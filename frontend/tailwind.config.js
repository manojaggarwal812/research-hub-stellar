/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f4f7f6",
          100: "#e3ebe8",
          200: "#c5d6d0",
          300: "#9bb8ae",
          400: "#6f9487",
          500: "#54786d",
          600: "#426057",
          700: "#374e47",
          800: "#2f403b",
          900: "#293733",
          950: "#141c1a",
        },
        ember: {
          400: "#f0a05a",
          500: "#e8843a",
          600: "#d06822",
        },
        tide: {
          400: "#4db8c4",
          500: "#2a9aa6",
          600: "#1f7c86",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(41,55,51,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(41,55,51,0.06) 1px, transparent 1px)",
        "hero-glow":
          "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(232,132,58,0.22), transparent 55%), radial-gradient(ellipse 60% 50% at 15% 80%, rgba(42,154,166,0.18), transparent 50%)",
      },
      backgroundSize: {
        grid: "28px 28px",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        rise: "rise 0.7s ease-out both",
        "rise-delayed": "rise 0.7s ease-out 0.15s both",
        "pulse-soft": "pulseSoft 2.4s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};
