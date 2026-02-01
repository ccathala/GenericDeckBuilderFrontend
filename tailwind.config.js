/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    "grid-cols-6",
    "grid-cols-7",
    "grid-cols-8",
    "grid-cols-9",
    "grid-cols-10",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        9: "repeat(9, minmax(0, 1fr))",
        10: "repeat(10, minmax(0, 1fr))",
      },
      colors: {
        // Thème sombre inspiré de MageNoir
        "mage-dark": {
          50: "#faf7ff",
          100: "#f3edff",
          200: "#e9deff",
          300: "#d7c4ff",
          400: "#c19cff",
          500: "#a876ff",
          600: "#8b45ff",
          700: "#7c3aed",
          800: "#6b32c7",
          900: "#5b2ba3",
          950: "#1a0b2e",
        },
        "mage-bg": {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
    },
  },
  plugins: [],
};
