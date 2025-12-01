/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#1B3B2F', /* Deep Green from logo */
          yellow: '#F2B734', /* Mustard/Gold from logo */
          light: '#F9FAFB',
          dark: '#111827',
        }
      },
      fontFamily: {
        sans: ['"Open Sans"', 'sans-serif'],
        display: ['"Montserrat"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}