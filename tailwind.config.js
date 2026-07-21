/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0b0f19",
        cardBg: "#151c2c",
        cardHover: "#1e293b",
        goldAccent: "#f59e0b",
        cyanAccent: "#38bdf8",
        greenAccent: "#10b981",
        redAccent: "#ef4444",
        textMain: "#f8fafc",
        textMuted: "#94a3b8",
        borderColor: "#334155",
      },
      fontFamily: {
        sans: ['Outfit', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
