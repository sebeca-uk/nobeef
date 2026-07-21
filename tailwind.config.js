/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "var(--bg-main)",
        cardBg: "var(--bg-surface)",
        cardHover: "var(--bg-surface-elevated)",
        crossfitRed: "var(--accent-red)",
        accentBlue: "var(--accent-blue)",
        accentBlueHover: "var(--accent-blue-hover)",
        textMain: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        textMuted: "var(--text-muted)",
        borderColor: "var(--border-color)",
      },
      fontFamily: {
        sans: ['var(--font-body)'],
        athletic: ['var(--font-heading)'],
        mono: ['var(--font-mono)'],
      }
    },
  },
  plugins: [],
}
