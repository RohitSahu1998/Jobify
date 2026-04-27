/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#00C853",
        'primary-dark': "#00A846",
        'primary-light': "#69F0AE",
        dark: "#0A0A0A",
        'dark-2': "#111111",
        'dark-3': "#1A1A1A",
        'dark-4': "#222222",
        'dark-border': "#2A2A2A",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
