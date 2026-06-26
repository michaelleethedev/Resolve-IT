import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05070d",
          900: "#080d17",
          850: "#0b1220",
          800: "#0f1728",
          700: "#182235"
        },
        signal: {
          blue: "#2f8cff",
          cyan: "#30d5ff",
          red: "#ff4d5d",
          orange: "#ffae42",
          green: "#2ee88f"
        }
      },
      boxShadow: {
        glow: "0 0 24px rgba(48, 213, 255, 0.16)",
        redGlow: "0 0 22px rgba(255, 77, 93, 0.15)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
