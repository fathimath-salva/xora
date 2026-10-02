/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xora: {
          offwhite: '#FDFCF9',
          cream: '#F7F4EE',
          sand: '#EFEBE2',
          beige: '#E3DDD2',
          taupe: '#C6B9A8',
          'taupe-dark': '#8E8071',
          brown: '#564B41',
          charcoal: '#282522',
          black: '#171615',
          gold: '#A38B62',
          light: '#FAF8F5'
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif']
      },
      letterSpacing: {
        widest: '.2em',
        luxury: '.25em',
        subtle: '.06em'
      }
    },
  },
  plugins: [],
}
