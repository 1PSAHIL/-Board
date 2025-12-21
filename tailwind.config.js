/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // scan all JS/TS files in src
    "./public/index.html",          // also scan your public HTML file
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

