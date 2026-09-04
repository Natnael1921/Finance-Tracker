/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base palette: Black, charcoal, grey, white
        base: {
          black:    '#080808',
          950:      '#0d0d0d',
          900:      '#111111',
          800:      '#1a1a1a',
          700:      '#222222',
          600:      '#2d2d2d',
          500:      '#3a3a3a',
          400:      '#555555',
          300:      '#888888',
          200:      '#b0b0b0',
          100:      '#d4d4d4',
          50:       '#f0f0f0',
          white:    '#ffffff',
        },
        // Green accent palette
        accent: {
          950:      '#052e16',
          900:      '#14532d',
          800:      '#166534',
          700:      '#15803d',
          600:      '#16a34a',
          500:      '#22c55e',
          400:      '#4ade80',
          300:      '#86efac',
          200:      '#bbf7d0',
          100:      '#dcfce7',
          DEFAULT:  '#22c55e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'glass':   '0 4px 24px 0 rgba(0,0,0,0.45)',
        'green':   '0 0 20px rgba(34,197,94,0.25)',
        'green-lg':'0 0 40px rgba(34,197,94,0.2)',
      },
      animation: {
        'fade-in':     'fadeIn 0.4s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:     { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:    { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight: { from: { opacity: '0', transform: 'translateX(-16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
