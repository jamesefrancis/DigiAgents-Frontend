// filepath: frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-deep': '#0B1120',
        'bg-navy': '#102236',
        'bg-glacier': '#C7E5F3',
        yellow: '#FFD84D',
        mint: '#36F0C1',
        fuchsia: '#FF4BB8',
        white: '#FFFFFF',
        'text-muted': 'rgba(255,255,255,0.45)',
        'text-dim': 'rgba(255,255,255,0.65)',
        'card-bg': 'rgba(16,34,54,0.85)',
        'card-border': 'rgba(255,255,255,0.07)',
        violet: '#6C3FFF',
        amber: '#FF9A3C'
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: []
};
