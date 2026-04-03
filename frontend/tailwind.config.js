/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          deep:  '#08080F',
          card:  '#111120',
          hover: '#18182E',
        },
        saffron: {
          DEFAULT: '#F97316',
          light:   '#FB923C',
          dark:    '#EA6100',
        },
        gold: {
          DEFAULT: '#F59E0B',
          light:   '#FCD34D',
        },
        spirit: '#A855F7',
        border: 'rgba(255,255,255,0.07)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
