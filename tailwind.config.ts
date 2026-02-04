import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brandOrange: "#f97316",
        ink: "#111111",
        softWhite: "#fff8f1"
      },
      boxShadow: {
        card: "0 8px 24px rgba(0, 0, 0, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
