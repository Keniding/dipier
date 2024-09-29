/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#7986cb',
          DEFAULT: '#3f51b5',
          dark: '#303f9f',
        },
        secondary: {
          light: '#ff4081',
          DEFAULT: '#f50057',
          dark: '#c51162',
        },
        text: {
          light: '#000000',
          DEFAULT: '#3f51b5',
          dark: '#ffffff'
        }
      },
    },
  },
  plugins: [],
}

