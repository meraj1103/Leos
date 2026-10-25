/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        leos: {
          dark: '#0e0f12',
          surface: '#16181d',
          surfaceHover: '#1e2128',
          card: '#1a1d24',
          border: '#2a2e39',
          borderLight: '#373c49',
          accent: '#e69500', // warm amber constellation accent
          accentGlow: 'rgba(230, 149, 0, 0.15)',
          muted: '#8e96a5',
          text: '#f1f3f7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
