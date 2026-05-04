/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#FFFFFF",
        bg2: "#F7F8FA",
        bg3: "#F0F2F5",
        text1: "#111318",
        text2: "#5A5F6E",
        text3: "#9298A8",
        accent: "#6C63FF",
        "accent-bg": "#F0EFFF",
        "accent-dark": "#3D36CC",
        "accent-mid": "#9490FF",
        green: "#16A34A",
        red: "#DC2626",
        amber: "#D97706",
      },
    },
  },
  plugins: [],
};
