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
          offwhite: 'rgb(var(--xora-offwhite) / <alpha-value>)',
          cream: 'rgb(var(--xora-cream) / <alpha-value>)',
          sand: 'rgb(var(--xora-sand) / <alpha-value>)',
          beige: 'rgb(var(--xora-beige) / <alpha-value>)',
          taupe: 'rgb(var(--xora-taupe) / <alpha-value>)',
          'taupe-dark': 'rgb(var(--xora-taupe-dark) / <alpha-value>)',
          brown: 'rgb(var(--xora-brown) / <alpha-value>)',
          charcoal: 'rgb(var(--xora-charcoal) / <alpha-value>)',
          black: 'rgb(var(--xora-black) / <alpha-value>)',
          gold: 'rgb(var(--xora-gold) / <alpha-value>)',
          light: 'rgb(var(--xora-light) / <alpha-value>)'
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
