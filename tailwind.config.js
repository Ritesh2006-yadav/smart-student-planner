/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: { soft: '0 12px 35px -15px rgb(15 23 42 / .22)' },
      animation: { 'fade-up': 'fade-up .35s ease-out both', float: 'float 4s ease-in-out infinite' },
      keyframes: {
        'fade-up': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-7px)' } }
      }
    }
  },
  plugins: []
};
