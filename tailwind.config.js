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
          fire: '#ff3d00',
          'fire-glow': 'rgba(255, 61, 0, 0.6)',
          wind: '#00e676',
          'wind-glow': 'rgba(0, 230, 118, 0.6)',
          lightning: '#d500f9',
          'lightning-glow': 'rgba(213, 0, 249, 0.6)',
          earth: '#ffab00',
          'earth-glow': 'rgba(255, 171, 0, 0.6)',
          water: '#00e5ff',
          'water-glow': 'rgba(0, 229, 255, 0.6)',
          kyuubi: '#ff1744',
          gold: '#ffd700',
          ancestral: '#b388ff',
        },
        shinobi: {
          bg: '#0a0d14',
          card: '#121622',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-active': 'rgba(0, 229, 255, 0.4)',
          text: '#f0f4fc',
          muted: '#8e9aaf',
        },
      },
      backgroundColor: {
        'glass-panel': 'rgba(18, 22, 34, 0.75)',
        'glass-card': 'rgba(255, 255, 255, 0.04)',
        'glass-hover': 'rgba(255, 255, 255, 0.08)',
        'glass-dark': 'rgba(10, 13, 20, 0.85)',
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
