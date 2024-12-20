// tailwind.config.js

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust the paths according to your project structure
  ],
  theme: {
    extend: {
      animation: {
        "slide-in": "slideIn 0.3s ease-out forwards",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      colors: {
        teal: {
          400: "#38bdf8",
          500: "#0f766e",
        },
        gray: {
          800: "#1e293b",
          900: "#111827",
        },
      },
    },
  },
  plugins: [],
};
