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
        'app-bg': 'var(--color-bg-main)',
        'app-bg2': 'var(--color-bg-card2)',
        'app-text': 'var(--color-text-main)',
        'app-text2': 'var(--color-text-muted)',
        'app-text3': 'var(--color-text-light)',
        'app-border': 'var(--color-border)',
        'green-deep': 'var(--color-green-deep)',
        'green-mid': 'var(--color-green-mid)',
        'green-pale': 'var(--color-green-pale)',
      },
      borderRadius: {
        'app': '24px',
        'app-sm': '16px',
      },
      boxShadow: {
        'app': '0 8px 30px rgba(0,0,0,0.04)',
        'app-lg': '0 12px 40px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
}

