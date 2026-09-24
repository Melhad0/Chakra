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
        chakra: {
          orange: '#ff6b00',
          'orange-glow': 'rgba(255, 107, 0, 0.6)',
          fire: '#ff4500',
          'fire-glow': 'rgba(255, 69, 0, 0.6)',
          amber: '#ff9100',
          gold: '#ffb300',
          wind: '#00e676',
          lightning: '#d500f9',
          earth: '#ff8f00',
          water: '#00e5ff',
          kyuubi: '#ff2200',
          ancestral: '#ff7700',
        },
        shinobi: {
          bg: '#050507',
          card: '#0c0e12',
          cardHover: '#13161c',
          border: 'rgba(255, 255, 255, 0.07)',
          'border-active': 'rgba(255, 107, 0, 0.6)',
          'border-orange': 'rgba(255, 107, 0, 0.35)',
          text: '#f4f6fa',
          muted: '#858d9d',
        },
      },
      backgroundColor: {
        'glass-panel': 'rgba(12, 14, 18, 0.85)',
        'glass-card': 'rgba(255, 255, 255, 0.03)',
        'glass-hover': 'rgba(255, 107, 0, 0.08)',
        'glass-dark': 'rgba(5, 5, 7, 0.92)',
      },
      boxShadow: {
        'chakra-glow': '0 0 25px rgba(255, 107, 0, 0.55)',
        'orange-glow': '0 0 25px rgba(255, 107, 0, 0.6)',
        'fire-glow': '0 0 25px rgba(255, 69, 0, 0.55)',
        'gold-glow': '0 0 25px rgba(255, 179, 0, 0.5)',
      },
      fontFamily: {
        ninja: ['Cinzel', 'Trajan Pro', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulseSlow 3.5s ease-in-out infinite alternate',
        'spin-slow': 'spinSlow 24s linear infinite',
        'spin-reverse': 'spinReverse 16s linear infinite',
        'hover-bob': 'hoverBob 3s ease-in-out infinite alternate',
        'fluid-flow': 'fluidFlow 3s linear infinite',
        'parry-pulse': 'parryPulse 1.6s cubic-bezier(0.2, 0.8, 0.3, 1) infinite',
        'float-fade': 'floatFade 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'shockwave-pulse': 'shockwavePulse 0.5s ease-out forwards',
      },
      keyframes: {
        pulseSlow: {
          '0%': { transform: 'scale(0.98)' },
          '100%': { transform: 'scale(1.02)' },
        },
        spinSlow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        spinReverse: {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        hoverBob: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-6px)' },
        },
        fluidFlow: {
          '0%': { backgroundPosition: '100% 0' },
          '100%': { backgroundPosition: '-100% 0' },
        },
        parryPulse: {
          '0%': { transform: 'translate(-50%, -50%) scale(2.2)', opacity: '0.3' },
          '70%': { opacity: '1', borderColor: '#ffd700' },
          '100%': { transform: 'translate(-50%, -50%) scale(1.0)', opacity: '0.8', borderColor: '#00e5ff' },
        },
        floatFade: {
          '0%': {
            opacity: '1',
            transform: 'translate(-50%, -50%) translate3d(0, 0, 0) scale(0.85)',
          },
          '25%': {
            opacity: '1',
            transform: 'translate(-50%, -50%) translate3d(var(--float-x, 0px), -30px, 0) scale(1.2)',
          },
          '70%': {
            opacity: '0.8',
            transform: 'translate(-50%, -50%) translate3d(calc(var(--float-x, 0px) * 1.3), -55px, 0) scale(1.0)',
          },
          '100%': {
            opacity: '0',
            transform: 'translate(-50%, -50%) translate3d(calc(var(--float-x, 0px) * 1.5), -75px, 0) scale(0.8)',
          },
        },
        shockwavePulse: {
          '0%': {
            opacity: '0.9',
            transform: 'translate(-50%, -50%) scale(0.3)',
          },
          '100%': {
            opacity: '0',
            transform: 'translate(-50%, -50%) scale(2.2)',
          },
        },
      },
      boxShadow: {
        'chakra-glow': '0 0 25px rgba(0, 229, 255, 0.4)',
        'fire-glow': '0 0 25px rgba(255, 61, 0, 0.5)',
        'gold-glow': '0 0 25px rgba(255, 215, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
