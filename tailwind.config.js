/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./public/index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cms: {
          background: '#0B1220',
          cards: '#111827',
          sidebar: '#0B1220',
          primary: '#22C55E',
          secondary: '#1F2937',
          accent: '#16A34A',
          warning: '#F59E0B',
          danger: '#EF4444',
          success: '#10B981',
          text: '#F8FAFC',
          muted: '#94A3B8',
          border: 'rgba(255,255,255,0.08)'
        },
        primary: {
          DEFAULT: '#22C55E',
          dark: '#16A34A',
          light: '#4ADE80',
        },
        bg: {
          dark: '#0a0c10',
          alt: '#13171f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '18px',
        '2xl': '24px',
        '3xl': '32px',
      },
      spacing: {
        // Tailwind defaults are mostly based on 4px grid (0.25rem), which maps well to 8px grids (e.g. p-2 = 8px, p-4 = 16px).
        // Standard tailwind spacing is maintained.
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0,0,0,0.5)',
        'premium-hover': '0 20px 40px -10px rgba(0,245,160,0.1)',
        'glow-primary': '0 0 20px rgba(0,245,160,0.2)',
        'glow-accent': '0 0 20px rgba(124,58,237,0.2)',
        'glass': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}