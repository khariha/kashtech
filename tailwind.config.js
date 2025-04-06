// tailwind.config.js
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#6B21A8",        // Custom purple
        secondary: "#F97316",      // Custom orange
        lightBg: "#f7f7fa",        // Light background
        darkBg: "#1e1e2f",         // Dark background
      },
      spacing: {
        18: "4.5rem",
        25: "6.25rem",
      },
      fontSize: {
        xxs: "0.65rem",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"), // Enables better form field styling
    plugin(function ({ addComponents }) {
      addComponents({
        ".input": {
          "@apply border border-gray-300 rounded-md px-3 py-2 w-full text-sm dark:bg-[#2b2b3c] dark:text-white dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500": {},
        },
      });
    }),
  ],
};
