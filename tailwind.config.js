/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1B3A2D',
        accent: '#C9A84C',
        background: '#F8F5EF',
        charcoal: '#1C1C1C',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(27, 58, 45, 0.08)',
        'card-hover': '0 8px 30px rgba(27, 58, 45, 0.12)',
      },
    },
  },
  plugins: [],
}
