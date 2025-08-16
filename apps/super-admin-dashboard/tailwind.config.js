/** @type {import('tailwindcss').Config} */

// Étend la configuration du Design System
const baseConfig = require('../../packages/ui/tailwind.config.js');

module.exports = {
  ...baseConfig,
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    // Inclure les composants du Design System
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      // Extensions spécifiques au dashboard
      animation: {
        ...baseConfig.theme?.extend?.animation,
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        ...baseConfig.theme?.extend?.keyframes,
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      colors: {
        ...baseConfig.theme?.extend?.colors,
        dashboard: {
          sidebar: 'hsl(var(--dashboard-sidebar))',
          header: 'hsl(var(--dashboard-header))',
          content: 'hsl(var(--dashboard-content))',
        },
      },
    },
  },
  plugins: [
    ...(baseConfig.plugins || []),
    // Plugins additionnels si nécessaire
  ],
};
