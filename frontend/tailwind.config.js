/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark': {
          'primary': '#141821',
          'secondary': '#191F2B',
          'surface': '#1F2633',
          'hover': '#242C3B',
          'border': '#2E3748',
        },
        'text': {
          'primary': '#E6EAF2',
          'secondary': '#B6BDCC',
          'muted': '#8B93A7',
          'disabled': '#6E768C',
        },
        'brand': {
          'primary': '#5B8CFF',
          'primary-hover': '#4F7BEB',
        },
        'accent': {
          'teal': '#3FC1A4',
        },
        'status': {
          'success': '#4CAF8F',
          'warning': '#D9A441',
          'error': '#E06C75',
          'info': '#6FA8FF',
        }
      },
      boxShadow: {
        'sm': '0 4px 12px rgba(0, 0, 0, 0.25)',
        'md': '0 8px 24px rgba(0, 0, 0, 0.35)',
        'lg': '0 16px 48px rgba(0, 0, 0, 0.45)',
      }
    },
  },
  plugins: [],
}
