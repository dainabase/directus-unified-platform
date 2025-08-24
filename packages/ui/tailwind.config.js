import { tokens } from "./src/tokens";
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
                sans: tokens.font.sans,
                mono: tokens.font.mono,
            },
            animation: {
                blob: "blob 7s infinite",
            },
            backdropBlur: {
                xs: tokens.blur.xs,
                sm: tokens.blur.sm,
                DEFAULT: tokens.blur.DEFAULT,
                md: tokens.blur.md,
                lg: tokens.blur.lg,
                xl: tokens.blur.xl,
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-mesh": tokens.gradient.mesh,
                "gradient-aurora": tokens.gradient.aurora,
            },
        },
    },
    plugins: [],
};
