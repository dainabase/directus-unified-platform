/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'dainabase-blue': '#2563eb',
        'dainabase-purple': '#7c3aed',
      }
    }
  },
  plugins: []
}