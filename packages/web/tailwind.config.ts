import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fff7f0",
          100: "#ffebe0",
          200: "#ffd4be",
          300: "#ffb896",
          400: "#ff9d6d",
          500: "#ff6633",
          600: "#e55a2b",
          700: "#cc4d23",
          800: "#b3401b",
          900: "#993313",
        },
        secondary: {
          50: "#f0f4f9",
          100: "#d9e4f0",
          200: "#b3c9e1",
          300: "#8cadd2",
          400: "#6692c3",
          500: "#003d7a",
          600: "#003366",
          700: "#002952",
          800: "#001f3d",
          900: "#001533",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderRadius: {
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
