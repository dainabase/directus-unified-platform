import type { Config } from "tailwindcss";
import { tokens } from "@dainabase/ui";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: tokens.colors,
      borderRadius: tokens.radius,
      spacing: tokens.spacing,
      boxShadow: tokens.shadow,
      fontFamily: { sans: [tokens.font.sans as any, "sans-serif"] }
    }
  },
  plugins: []
} satisfies Config;