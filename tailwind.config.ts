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
        brand: {
          primary: "#1A94DD",
          dark: "#0E6FA8",
          light: "#3BA8E5",
          accent: "#F99011",
          soft: "#FFF1DE",
          success: "#1B7A4E",
          warning: "#F99011",
          danger: "#B91C1C",
          bg: "#F3F8FC",
          surface: "#FFFFFF",
          text: "#0F1C24",
          muted: "#4A6270",
          border: "#C9D9E4",
        },
        primary: "#1A94DD",
        secondary: "#F99011",
      },
      minHeight: {
        touch: "56px",
        "touch-lg": "64px",
      },
    },
  },
  plugins: [],
};
export default config;
