// Design tokens for the Dainabase UI system - Orbai Premium Style
export const tokens = {
  colors: {
    primary: {
      DEFAULT: "#0A0A0B", // Deep black
      50: "#FAFAFA",
      100: "#F5F5F5",
      200: "#E5E5E7",
      300: "#D4D4D8",
      400: "#A1A1AA",
      500: "#71717A",
      600: "#52525B",
      700: "#3F3F46",
      800: "#27272A",
      900: "#18181B",
      950: "#0A0A0B",
    },
    secondary: {
      DEFAULT: "#FAFAFA", // Off-white
      50: "#FFFFFF",
      100: "#FAFAFA",
      200: "#F5F5F5",
      300: "#F0F0F0",
      400: "#E5E5E5",
      500: "#D4D4D4",
      600: "#A3A3A3",
      700: "#737373",
      800: "#525252",
      900: "#262626",
    },
    accent: {
      DEFAULT: "#D4AF37", // Luxury Gold
      gold: {
        light: "#F4E4BC",
        DEFAULT: "#D4AF37",
        dark: "#B8941F",
        deep: "#9B7A0A",
      },
      platinum: {
        light: "#E8E6E1",
        DEFAULT: "#C9C5BA",
        dark: "#A09B8C",
      },
      rose: {
        light: "#FCE4EC",
        DEFAULT: "#E91E63",
        dark: "#C2185B",
      },
      success: "#71717A", // Soft gray instead of green
      warning: "#A1A1AA", // Medium gray instead of orange
      error: "#52525B", // Dark gray instead of red
    },
    glass: {
      white: "rgba(255, 255, 255, 0.95)",
      light: "rgba(255, 255, 255, 0.85)",
      ultralight: "rgba(255, 255, 255, 0.5)",
      dark: "rgba(10, 10, 11, 0.95)",
      darker: "rgba(0, 0, 0, 0.8)",
      gold: "rgba(212, 175, 55, 0.1)",
    },
    background: {
      DEFAULT: "#FAFAFA",
      paper: "#FFFFFF",
      subtle: "#F5F5F5",
      dark: "#0A0A0B",
      gradient: {
        premium: "linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)",
        dark: "linear-gradient(135deg, #0A0A0B 0%, #18181B 100%)",
        gold: "linear-gradient(135deg, #F4E4BC 0%, #D4AF37 100%)",
        radial: "radial-gradient(ellipse at top, #FAFAFA, #E5E5E7)",
      },
    },
  },
  radius: {
    DEFAULT: "0.75rem", // 12px
    none: "0",
    sm: "0.375rem", // 6px
    md: "0.75rem", // 12px
    lg: "1rem", // 16px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    full: "9999px",
  },
  spacing: {
    xs: "0.5rem", // 8px
    sm: "1rem", // 16px
    md: "1.5rem", // 24px
    lg: "2rem", // 32px
    xl: "3rem", // 48px
  },
  shadow: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.08)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.08)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.08)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    glow: "0 0 30px rgba(212, 175, 55, 0.3)",
    "glow-gold": "0 0 50px rgba(212, 175, 55, 0.4)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    none: "none",
  },
  blur: {
    xs: "4px",
    sm: "8px",
    DEFAULT: "16px",
    md: "24px",
    lg: "40px",
    xl: "64px",
  },
  gradient: {
    premium: "linear-gradient(135deg, #D4AF37 0%, #F4E4BC 50%, #D4AF37 100%)",
    subtle: "linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%)",
    dark: "linear-gradient(180deg, #0A0A0B 0%, #18181B 100%)",
    mesh: "radial-gradient(at 20% 80%, rgba(212, 175, 55, 0.15) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(212, 175, 55, 0.1) 0px, transparent 50%), radial-gradient(at 40% 40%, rgba(250, 250, 250, 0.8) 0px, transparent 50%)",
    radial: "radial-gradient(600px at 50% 50%, rgba(212, 175, 55, 0.1), transparent 70%)",
  },
  font: {
    sans: ["Inter", "Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
    display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "Cascadia Code", "SF Mono", "Consolas", "monospace"],
  },
  fontSize: {
    xs: "0.875rem", // 14px
    sm: "1rem", // 16px
    base: "1.125rem", // 18px
    lg: "1.25rem", // 20px
    xl: "1.5rem", // 24px
    "2xl": "1.875rem", // 30px
    "3xl": "2.25rem", // 36px
    "4xl": "3rem", // 48px
    "5xl": "3.75rem", // 60px
    "6xl": "4.5rem", // 72px
  },
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
  animation: {
    smooth: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fast: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    premium: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  },
};