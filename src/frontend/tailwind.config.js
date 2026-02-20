/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: '#F5F5F7',
          surface: '#FFFFFF',
          text: '#1D1D1F',
          'text-secondary': '#6E6E73',
          'text-tertiary': '#AEAEB2',
          accent: '#0071E3',
          'accent-hover': '#0077ED',
          success: '#34C759',
          warning: '#FF9500',
          danger: '#FF3B30',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'SF Pro Display', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'input': '8px',
        'badge': '6px',
      },
      boxShadow: {
        'ds-sm': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'ds-md': '0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'ds-lg': '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
        'ds-focus': '0 0 0 3px rgba(0,113,227,0.20)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'shimmer': 'shimmer 1.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
