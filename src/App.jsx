import { createContext, useContext, useState } from 'react';
import { Users, AlertCircle, Loader2, RefreshCw, CheckCircle, LogOut, Lock, TrendingUp, BarChart3, UserCircle, Activity } from 'lucide-react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    if (email && password) {
      const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const mockUser = { email, name: email.split('@')[0] };
      setToken(mockToken);
      setUser(mockUser);
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

async function fetchJson(url, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 30000,
      cacheTime: 5 * 60 * 1000,
    },
  },
});

function useUsers() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['users', token],
    queryFn: () => fetchJson(`${API_BASE_URL}/users`, token),
    enabled: !!token,
  });
}

function useSales() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['sales', token],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        revenue: [45000, 52000, 48000, 61000, 55000, 67000, 72000, 68000, 75000, 82000, 79000, 88000],
        expenses: [32000, 35000, 33000, 42000, 38000, 45000, 48000, 46000, 51000, 55000, 53000, 58000]
      };
    },
    enabled: !!token,
    staleTime: 60000,
  });
}

function useActivityData() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['activity', token],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      const weeks = 12;
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const data = [];
      
      for (let week = 0; week < weeks; week++) {
        for (let day = 0; day < 7; day++) {
          let value;
          if (day === 0 || day === 6) {
            value = Math.floor(Math.random() * 30);
          } else {
            value = Math.floor(Math.random() * 100);
          }
          data.push({ week, day, dayName: days[day], value });
        }
      }
      return { data, days, weeks };
    },
    enabled: !!token,
    staleTime: 60000,
  });
}

function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const result = login(email, password);
    if (!result.success) setError(result.error || 'Login failed');
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon-wrapper">
              <Lock className="login-icon" />
            </div>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to access your dashboard</p>
          </div>

          <div className="login-form">
            <div>
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                className="form-input"
              />
            </div>

            {error && (
              <div className="error-alert">
                <AlertCircle className="error-icon" />
                <p className="error-text">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="button-spinner" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div className="login-demo-notice">
            <p className="demo-text">
              <strong>Demo:</strong> Use any email and password to login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserCard({ user }) {
  return (
    <div className="user-card">
      <div className="user-card-content">
        <div className="user-avatar">
          {user.name.charAt(0)}
        </div>
        <div className="user-info">
          <h3 className="user-name">{user.name}</h3>
          <p className="user-email">{user.email}</p>
          {user.company && <p className="user-company">{user.company.name}</p>}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="loading-state">
      <Loader2 className="loading-spinner" />
      <p className="loading-title">Loading users...</p>
      <p className="loading-subtitle">Please wait</p>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="error-state">
      <div className="error-icon-wrapper">
        <AlertCircle className="error-state-icon" />
      </div>
      <h3 className="error-state-title">Failed to Load Users</h3>
      <p className="error-state-message">{error}</p>
      <button onClick={onRetry} className="retry-button">
        <RefreshCw className="retry-icon" />
        Try Again
      </button>
    </div>
  );
}

function DashboardStats({ userCount, loading, isFetching, dataUpdatedAt }) {
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'Never';
  
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-card-content">
          <div className="stat-icon-wrapper stat-icon-blue">
            <Users className="stat-icon" />
          </div>
          <div>
            <p className="stat-label">Total Users</p>
            {loading ? (
              <div className="stat-skeleton"></div>
            ) : (
              <p className="stat-value">{userCount}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-card-content">
          <div className="stat-icon-wrapper stat-icon-green">
            <CheckCircle className="stat-icon" />
          </div>
          <div>
            <p className="stat-label">Cache Status</p>
            {loading ? (
              <div className="stat-skeleton-wide"></div>
            ) : (
              <p className="stat-status">
                {isFetching ? 'Updating...' : 'Cached'}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-card-content">
          <div className="stat-icon-wrapper stat-icon-purple">
            <Users className="stat-icon" />
          </div>
          <div>
            <p className="stat-label">Last Updated</p>
            {loading ? (
              <div className="stat-skeleton-small"></div>
            ) : (
              <p className="stat-time">{lastUpdated}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SalesReport() {
  const { data: salesData, isLoading, isError, error, refetch, isFetching } = useSales();

  const chartData = salesData ? {
    labels: salesData.labels,
    datasets: [
      {
        label: 'Revenue',
        data: salesData.revenue,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Expenses',
        data: salesData.expenses,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, weight: 500 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 600 },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + (value / 1000) + 'k';
          },
          font: { size: 11 }
        },
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="report-card">
      <div className="report-header">
        <div className="report-header-content">
          <div className="report-title-wrapper">
            <div className="report-icon-wrapper">
              <TrendingUp className="report-icon" />
            </div>
            <div>
              <h2 className="report-title">Sales Report</h2>
              <p className="report-subtitle">Revenue vs Expenses (2025)</p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="refresh-button"
          >
            <RefreshCw className={isFetching ? "refresh-icon-spinning" : "refresh-icon"} />
            Refresh
          </button>
        </div>
      </div>

      <div className="report-content">
        {isLoading ? (
          <div className="report-loading">
            <Loader2 className="loading-spinner-large" />
            <p className="loading-text">Loading sales data...</p>
          </div>
        ) : isError ? (
          <div className="report-error">
            <div className="report-error-icon-wrapper">
              <AlertCircle className="report-error-icon" />
            </div>
            <h3 className="report-error-title">Failed to Load Sales Data</h3>
            <p className="report-error-message">{error.message}</p>
            <button onClick={() => refetch()} className="report-retry-button">
              <RefreshCw className="retry-icon" />
              Try Again
            </button>
          </div>
        ) : (
          <div style={{ height: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityHeatmap() {
  const { data: activityData, isLoading, isError, error, refetch, isFetching } = useActivityData();
  const [hoveredCell, setHoveredCell] = useState(null);

  const getColorClass = (value) => {
    if (value === 0) return 'heatmap-cell-none';
    if (value < 25) return 'heatmap-cell-low';
    if (value < 50) return 'heatmap-cell-medium';
    if (value < 75) return 'heatmap-cell-high';
    return 'heatmap-cell-very-high';
  };

  const getIntensityLevel = (value) => {
    if (value === 0) return 'None';
    if (value < 25) return 'Low';
    if (value < 50) return 'Medium';
    if (value < 75) return 'High';
    return 'Very High';
  };

  return (
    <div className="heatmap-card">
      <div className="heatmap-header">
        <div className="heatmap-header-content">
          <div className="heatmap-title-wrapper">
            <div className="heatmap-icon-wrapper">
              <Activity className="heatmap-icon" />
            </div>
            <div>
              <h2 className="heatmap-title">Activity Heatmap</h2>
              <p className="heatmap-subtitle">User engagement over the last 12 weeks</p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="refresh-button"
          >
            <RefreshCw className={isFetching ? "refresh-icon-spinning" : "refresh-icon"} />
            Refresh
          </button>
        </div>
      </div>

      <div className="heatmap-content">
        {isLoading ? (
          <div className="heatmap-loading">
            <Loader2 className="loading-spinner-green" />
            <p className="loading-text">Loading activity data...</p>
          </div>
        ) : isError ? (
          <div className="heatmap-error">
            <div className="heatmap-error-icon-wrapper">
              <AlertCircle className="heatmap-error-icon" />
            </div>
            <h3 className="heatmap-error-title">Failed to Load Activity Data</h3>
            <p className="heatmap-error-message">{error.message}</p>
            <button onClick={() => refetch()} className="heatmap-retry-button">
              <RefreshCw className="retry-icon" />
              Try Again
            </button>
          </div>
        ) : (
          <div className="heatmap-wrapper">
            <div className="heatmap-scroll-container">
              <div className="heatmap-grid-wrapper">
                <div className="heatmap-grid-container">
                  <div className="heatmap-day-labels">
                    <div className="heatmap-spacer"></div>
                    {activityData.days.map((day, idx) => (
                      <div key={idx} className="heatmap-day-label">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="heatmap-grid">
                    {Array.from({ length: activityData.weeks }).map((_, weekIdx) => (
                      <div key={weekIdx} className="heatmap-week-column">
                        <div className="heatmap-week-label">
                          W{weekIdx + 1}
                        </div>
                        {activityData.days.map((_, dayIdx) => {
                          const cellData = activityData.data.find(
                            d => d.week === weekIdx && d.day === dayIdx
                          );
                          return (
                            <div
                              key={`${weekIdx}-${dayIdx}`}
                              className={`heatmap-cell ${getColorClass(cellData?.value || 0)}`}
                              onMouseEnter={() => setHoveredCell(cellData)}
                              onMouseLeave={() => setHoveredCell(null)}
                              title={`${cellData?.dayName}, Week ${weekIdx + 1}: ${cellData?.value || 0} activities`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {hoveredCell && (
              <div className="heatmap-tooltip">
                <div className="heatmap-tooltip-title">{hoveredCell.dayName}, Week {hoveredCell.week + 1}</div>
                <div className="heatmap-tooltip-content">
                  {hoveredCell.value} activities · {getIntensityLevel(hoveredCell.value)} intensity
                </div>
              </div>
            )}

            <div className="heatmap-legend-wrapper">
              <div className="heatmap-legend-label">Activity Level:</div>
              <div className="heatmap-legend">
                <span className="heatmap-legend-text">Low</span>
                <div className="heatmap-legend-colors">
                  <div className="heatmap-legend-color heatmap-legend-none"></div>
                  <div className="heatmap-legend-color heatmap-legend-low"></div>
                  <div className="heatmap-legend-color heatmap-legend-medium"></div>
                  <div className="heatmap-legend-color heatmap-legend-high"></div>
                  <div className="heatmap-legend-color heatmap-legend-very-high"></div>
                </div>
                <span className="heatmap-legend-text">High</span>
              </div>
            </div>

            <div className="heatmap-stats">
              <div className="heatmap-stat">
                <div className="heatmap-stat-value">
                  {activityData.data.reduce((sum, d) => sum + d.value, 0)}
                </div>
                <div className="heatmap-stat-label">Total Activities</div>
              </div>
              <div className="heatmap-stat">
                <div className="heatmap-stat-value">
                  {Math.round(activityData.data.reduce((sum, d) => sum + d.value, 0) / activityData.data.length)}
                </div>
                <div className="heatmap-stat-label">Daily Average</div>
              </div>
              <div className="heatmap-stat">
                <div className="heatmap-stat-value">
                  {Math.max(...activityData.data.map(d => d.value))}
                </div>
                <div className="heatmap-stat-label">Peak Activity</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UsersTab() {
  const { data: users = [], isLoading, isError, error, refetch, isFetching } = useUsers();

  return (
    <div className="users-tab">
      <div className="users-header">
        <div className="users-header-content">
          <h2 className="users-title">Users</h2>
          <button
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="refresh-button"
          >
            <RefreshCw className={isFetching ? "refresh-icon-spinning" : "refresh-icon"} />
            Refresh
          </button>
        </div>
      </div>

      <div className="users-content">
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState error={error.message} onRetry={refetch} />
        ) : users.length === 0 ? (
          <div className="users-empty">No users found</div>
        ) : (
          <div className="users-grid">
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className={active ? "tab-button tab-button-active" : "tab-button"}>
      <Icon className="tab-icon" />
      {label}
    </button>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  const { data: users = [], isLoading, isFetching, dataUpdatedAt } = useUsers();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header-container">
          <div className="dashboard-header-content">
            <div>
              <h1 className="dashboard-title">User Dashboard</h1>
              <p className="dashboard-subtitle">Welcome back, {user?.name || 'User'}</p>
            </div>
            <div className="dashboard-header-actions">
              {isFetching && !isLoading && (
                <div className="sync-indicator">
                  <Loader2 className="sync-spinner" />
                  <span>Syncing data...</span>
                </div>
              )}
              <button onClick={logout} className="logout-button">
                <LogOut className="logout-icon" />
                Logout
              </button>
            </div>
          </div>

          <div className="tabs-container">
            <TabButton active={activeTab === 'overview'} icon={BarChart3} label="Overview" onClick={() => setActiveTab('overview')} />
            <TabButton active={activeTab === 'sales'} icon={TrendingUp} label="Sales" onClick={() => setActiveTab('sales')} />
            <TabButton active={activeTab === 'activity'} icon={Activity} label="Activity" onClick={() => setActiveTab('activity')} />
            <TabButton active={activeTab === 'users'} icon={UserCircle} label="Users" onClick={() => setActiveTab('users')} />
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div>
            <DashboardStats userCount={users.length} loading={isLoading} isFetching={isFetching} dataUpdatedAt={dataUpdatedAt} />
            <div className="dashboard-sections">
              <SalesReport />
              <ActivityHeatmap />
              <UsersTab />
            </div>
          </div>
        )}
        {activeTab === 'sales' && <SalesReport />}
        {activeTab === 'activity' && <ActivityHeatmap />}
        {activeTab === 'users' && <UsersTab />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AuthWrapper />
      </QueryClientProvider>
    </AuthProvider>
  );
}

function AuthWrapper() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <LoginPage />;
}