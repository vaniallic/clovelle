/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#E8F1DD",
        "cream-deep": "#CFE4BC",
        paper: "#FFFDF8",
        blush: {
          DEFAULT: "#FBE3E9",
          soft: "#FCEDF1",
        },
        mango: {
          DEFAULT: "#E8924B",
          dark: "#C9723A",
          light: "#F5C98A",
        },
        pool: {
          DEFAULT: "#6FA8C4",
          dark: "#4F86A3",
          light: "#BEE0ED",
        },
        clover: {
          DEFAULT: "#7A9B6E",
          dark: "#5A7A4F",
        },
        ink: "#3B2E22",
        rust: "#C0564A",
      },
      fontFamily: {
        display: ["'Baloo 2'", "sans-serif"],
        body: ["Quicksand", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
}
