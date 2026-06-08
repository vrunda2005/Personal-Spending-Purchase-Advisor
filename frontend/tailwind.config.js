/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#080C14",
        darkSurface: "rgba(13, 20, 35, 0.75)",
        darkBorder: "rgba(255, 255, 255, 0.08)",
        neonMint: "#10B981",    // Success / Savings / Go
        neonCoral: "#EF4444",   // Warnings / Regret / Stop
        neonViolet: "#6366F1",  // Primary / Active / AI Coach
        neonAmber: "#F59E0B",   // Caution / Mid values
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-glow": "0 0 15px rgba(99, 102, 241, 0.15)",
        "success-glow": "0 0 15px rgba(16, 185, 129, 0.2)",
        "warning-glow": "0 0 15px rgba(239, 68, 68, 0.2)",
      }
    },
  },
  plugins: [],
}
