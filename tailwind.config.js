/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Kanit', 'sans-serif'],
      },
      colors: {
        primary: '#6366f1', // Indigo 500
        secondary: '#ec4899', // Pink 500
      }
    },
  },
  plugins: [],
}