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
        ink: "#0F172A",
        canvas: "#FAFAF9",
        surface: "#FFFFFF",
        line: "#E7E5E0",
        muted: "#6B7280",
        lorenzo: {
          DEFAULT: "#1E3A8A",
          light: "#3B5BC9",
        },
        signal: {
          critical: "#DC2626",
          warning: "#D97706",
          good: "#16A34A",
          info: "#0EA5E9",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Inter",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 8px -2px rgba(15, 23, 42, 0.06)",
      },
      borderRadius: {
        xl2: "1.1rem",
      },
    },
  },
  plugins: [],
};

export default config;
