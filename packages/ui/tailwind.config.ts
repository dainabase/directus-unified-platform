// packages/ui/tailwind.config.ts
import type { Config } from "tailwindcss";
import { tokens } from "./tokens";

export default {
  darkMode: ["class"],
  content: [
    "../../apps/**/*.{ts,tsx}",
    "../../packages/ui/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: tokens.colors,
      borderRadius: tokens.radius,
      spacing: tokens.spacing,
      boxShadow: tokens.shadow,
      fontFamily: {
        sans: [tokens.font.sans, "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;