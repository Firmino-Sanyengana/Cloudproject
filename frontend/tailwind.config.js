/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff", 100: "#dbe7ff", 200: "#bcd0ff", 300: "#8eb1ff",
          400: "#5b87ff", 500: "#3a63ff", 600: "#2545eb", 700: "#1d36c2",
          800: "#1c2f99", 900: "#1c2d78",
        },
      },
      boxShadow: { soft: "0 10px 30px -12px rgba(15, 23, 42, 0.15)" },
      animation: { "fade-in": "fadeIn .3s ease-out" },
      keyframes: { fadeIn: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "none" } } },
    },
  },
  plugins: [],
};
