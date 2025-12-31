/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: 'var(--app-bg)',
          surface: 'var(--app-surface)',
          text: 'var(--app-text)',
          muted: 'var(--app-text-muted)',
          accent: 'var(--app-accent)',
          border: 'var(--app-border)',
          danger: 'var(--app-danger)',
          success: 'var(--app-success)',
          warning: 'var(--app-warning)',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}