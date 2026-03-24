/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fafa',
          100: '#ccefef',
          200: '#99dfdf',
          300: '#66cfcf',
          400: '#33bfbf',
          500: '#1a6b6b',
          600: '#0d4a4a',
          700: '#0a3838',
          800: '#072626',
          900: '#031414',
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
