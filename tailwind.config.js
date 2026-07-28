/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Override Tailwind's built-in "indigo" scale so every existing
        // text-indigo-*, bg-indigo-*, border-indigo-*/opacity className
        // across the app now renders the new competition-red brand color
        // instead of Stripe's indigo, with no per-component class edits.
        indigo: {
          50: "#fef2ef",
          100: "#fde1d9",
          200: "#fbc0b0",
          300: "#f7967d",
          400: "#f16b4c",
          500: "#e8462f", // primary brand accent
          600: "#c9331e",
          700: "#a3271a",
          800: "#7a1f16",
          900: "#571712",
          950: "#2e0d0a",
        },
        darkBg: "#121316",
        cardBg: "#1a1b1f",
        cardHover: "#24262b",
        stripeIndigo: "#e8462f",
        stripeIndigoHover: "#ff6a4d",
        stripeCyan: "#f2b134",
        stripePurple: "#f2903d",
        stripeCoral: "#ff5b79",
        textMain: "#ffffff",
        textSecondary: "#94a3b8",
        textMuted: "#64748b",
        borderColor: "rgba(232, 70, 47, 0.2)",
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        athletic: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Roboto Condensed"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"Roboto Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
