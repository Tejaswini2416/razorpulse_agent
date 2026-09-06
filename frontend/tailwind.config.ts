import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        razor: {
          navy: "#0C2340",
          midnight: "#02042B",
          blue: "#0052FF",
          green: "#10B981",
          slate: "#0F172A",
        },
      },
      boxShadow: {
        glow: "0 0 35px rgba(0,82,255,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
