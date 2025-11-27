/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        table: {
          available: '#10b981',
          occupied: '#3b82f6',
          paused: '#f59e0b',
          maintenance: '#6b7280',
        }
      },
      boxShadow: {
        'table': '0 10px 30px -5px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
