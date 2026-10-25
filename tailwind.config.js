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
          dark: 'var(--color-leos-dark)',
          surface: 'var(--color-leos-surface)',
          surfaceHover: 'var(--color-leos-surface-hover)',
          card: 'var(--color-leos-card)',
          border: 'var(--color-leos-border)',
          borderLight: 'var(--color-leos-border-light)',
          accent: 'var(--color-leos-accent)',
          accentGlow: 'var(--color-leos-accent-glow)',
          muted: 'var(--color-leos-muted)',
          text: 'var(--color-leos-text)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
