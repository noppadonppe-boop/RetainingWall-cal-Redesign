/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',
        secondary: '#7C3AED',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        'border-card': '#E2E8F0',
        'border-input': '#CBD5E1',
        success: '#10b981',
        error: '#ba1a1a',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'focus-glow': '0 0 0 2px rgba(30, 64, 175, 0.1)',
        'soft-glow': '0 4px 12px rgba(30, 64, 175, 0.1)',
        'popover': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'soft': '0.25rem',
        'card': '0.5rem',
      }
    },
  },
  plugins: [],
}
