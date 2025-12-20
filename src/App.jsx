import React, { createContext, useContext, useState } from 'react';
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
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800 text-center">
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
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
          {user.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
          {user.company && <p className="text-xs text-gray-400 mt-1">{user.company.name}</p>}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
      <p className="text-gray-600 font-medium">Loading users...</p>
      <p className="text-sm text-gray-400 mt-1">Please wait</p>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-red-50 rounded-full p-3 mb-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Users</h3>
      <p className="text-sm text-gray-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}

function DashboardStats({ userCount, loading, isFetching, dataUpdatedAt }) {
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'Never';
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-lg p-3">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-gray-900">{userCount}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 rounded-lg p-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Cache Status</p>
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-lg font-semibold text-green-600">
                {isFetching ? 'Updating...' : 'Cached'}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 rounded-lg p-3">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-sm font-semibold text-gray-900">{lastUpdated}</p>
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
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Sales Report</h2>
              <p className="text-sm text-gray-500">Revenue vs Expenses (2025)</p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading sales data...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-red-50 rounded-full p-3 mb-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Sales Data</h3>
            <p className="text-sm text-gray-600 mb-4">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
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
    if (value === 0) return 'bg-gray-100';
    if (value < 25) return 'bg-green-200';
    if (value < 50) return 'bg-green-300';
    if (value < 75) return 'bg-green-400';
    return 'bg-green-500';
  };

  const getIntensityLevel = (value) => {
    if (value === 0) return 'None';
    if (value < 25) return 'Low';
    if (value < 50) return 'Medium';
    if (value < 75) return 'High';
    return 'Very High';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-lg p-2">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Activity Heatmap</h2>
              <p className="text-sm text-gray-500">User engagement over the last 12 weeks</p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading activity data...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-red-50 rounded-full p-3 mb-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Activity Data</h3>
            <p className="text-sm text-gray-600 mb-4">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <div className="flex gap-1">
                  <div className="flex flex-col gap-1 pr-2">
                    <div className="h-6"></div>
                    {activityData.days.map((day, idx) => (
                      <div key={idx} className="h-4 flex items-center text-xs text-gray-600 font-medium">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-1">
                    {Array.from({ length: activityData.weeks }).map((_, weekIdx) => (
                      <div key={weekIdx} className="flex flex-col gap-1">
                        <div className="h-6 flex items-center justify-center text-xs text-gray-500">
                          W{weekIdx + 1}
                        </div>
                        {activityData.days.map((_, dayIdx) => {
                          const cellData = activityData.data.find(
                            d => d.week === weekIdx && d.day === dayIdx
                          );
                          return (
                            <div
                              key={`${weekIdx}-${dayIdx}`}
                              className={`w-8 h-4 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-blue-500 hover:scale-110 ${getColorClass(cellData?.value || 0)}`}
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
              <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm">
                <div className="font-semibold">{hoveredCell.dayName}, Week {hoveredCell.week + 1}</div>
                <div className="text-gray-300">
                  {hoveredCell.value} activities · {getIntensityLevel(hoveredCell.value)} intensity
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">Activity Level:</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Low</span>
                <div className="flex gap-1">
                  <div className="w-6 h-6 rounded bg-gray-100 border border-gray-300"></div>
                  <div className="w-6 h-6 rounded bg-green-200"></div>
                  <div className="w-6 h-6 rounded bg-green-300"></div>
                  <div className="w-6 h-6 rounded bg-green-400"></div>
                  <div className="w-6 h-6 rounded bg-green-500"></div>
                </div>
                <span className="text-xs text-gray-500">High</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {activityData.data.reduce((sum, d) => sum + d.value, 0)}
                </div>
                <div className="text-sm text-gray-500">Total Activities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(activityData.data.reduce((sum, d) => sum + d.value, 0) / activityData.data.length)}
                </div>
                <div className="text-sm text-gray-500">Daily Average</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.max(...activityData.data.map(d => d.value))}
                </div>
                <div className="text-sm text-gray-500">Peak Activity</div>
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
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Users</h2>
          <button
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState error={error.message} onRetry={refetch} />
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No users found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 font-medium transition-all border-b-2 ${
        active
          ? 'text-blue-600 border-blue-600'
          : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  const { data: users = [], isLoading, isFetching, dataUpdatedAt } = useUsers();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name || 'User'}</p>
            </div>
            <div className="flex items-center gap-4">
              {isFetching && !isLoading && (
                <div className="flex items-center gap-2 text-blue-600 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Syncing data...</span>
                </div>
              )}
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          <div className="flex gap-2 -mb-px overflow-x-auto">
            <TabButton active={activeTab === 'overview'} icon={BarChart3} label="Overview" onClick={() => setActiveTab('overview')} />
            <TabButton active={activeTab === 'sales'} icon={TrendingUp} label="Sales" onClick={() => setActiveTab('sales')} />
            <TabButton active={activeTab === 'activity'} icon={Activity} label="Activity" onClick={() => setActiveTab('activity')} />
            <TabButton active={activeTab === 'users'} icon={UserCircle} label="Users" onClick={() => setActiveTab('users')} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {activeTab === 'overview' && (
          <div>
            <DashboardStats userCount={users.length} loading={isLoading} isFetching={isFetching} dataUpdatedAt={dataUpdatedAt} />
            <div className="grid grid-cols-1 gap-6">
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

