/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          sans: ['"Atkinson Hyperlegible"', 'sans-serif'],
        },
        colors: {
          primary: {
            DEFAULT: '#047857', // green with good contrast
            dark: '#065f46'
          }
        }
      }
    },
    plugins: []
  };