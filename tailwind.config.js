/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary uses CSS variables so the color can be changed at runtime
        // without rebuilding. Set --primary-NNN as space-separated RGB channels
        // (e.g. "13 74 74") in :root. See src/index.css for defaults and
        // src/lib/settings.js applyPrimaryColor() for the runtime setter.
        primary: {
          50:  'rgb(var(--primary-50)  / <alpha-value>)',
          100: 'rgb(var(--primary-100) / <alpha-value>)',
          200: 'rgb(var(--primary-200) / <alpha-value>)',
          300: 'rgb(var(--primary-300) / <alpha-value>)',
          400: 'rgb(var(--primary-400) / <alpha-value>)',
          500: 'rgb(var(--primary-500) / <alpha-value>)',
          600: 'rgb(var(--primary-600) / <alpha-value>)',
          700: 'rgb(var(--primary-700) / <alpha-value>)',
          800: 'rgb(var(--primary-800) / <alpha-value>)',
          900: 'rgb(var(--primary-900) / <alpha-value>)',
        },
        accent: {
          50: '#f0faf5',
          100: '#d1f0e2',
          200: '#a3e1c5',
          300: '#75d2a8',
          400: '#47c38b',
          500: '#2d9e6b',
          600: '#237e56',
          700: '#1a5e40',
          800: '#123f2b',
          900: '#091f15',
        },
        risk: {
          acceptable: '#22c55e',
          unacceptable: '#eab308',
          high: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
