/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0a2540",
        cardBg: "#0f172a",
        cardHover: "#1e293b",
        stripeIndigo: "#635bff",
        stripeIndigoHover: "#7a73ff",
        stripeCyan: "#00d4ff",
        stripePurple: "#a855f7",
        stripeCoral: "#ff5b79",
        textMain: "#ffffff",
        textSecondary: "#94a3b8",
        textMuted: "#64748b",
        borderColor: "rgba(99, 91, 255, 0.2)",
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        athletic: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"Roboto Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
