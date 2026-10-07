import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep Navy — Primary Government Blue
        navy: {
          50: '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5bbfd',
          400: '#8198fa',
          500: '#6172f4',
          600: '#444ee7',
          700: '#3838cc',
          800: '#2f30a5',
          900: '#1e2d7d',
          950: '#14205c',
        },
        // Primary brand navy
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#1e3a8a',   // deep institutional navy
          700: '#1e3068',
          800: '#162355',
          900: '#0f1a40',
          950: '#0a1128',
        },
        // Saffron accent
        saffron: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Government background
        gov: {
          bg: '#f8f9fc',
          surface: '#ffffff',
          border: '#e2e8f0',
          muted: '#94a3b8',
          text: '#1e293b',
          subtle: '#64748b',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gov': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
        'gov-md': '0 4px 12px rgba(30,42,89,0.08), 0 2px 4px rgba(30,42,89,0.04)',
        'gov-lg': '0 8px 24px rgba(30,42,89,0.12), 0 4px 8px rgba(30,42,89,0.06)',
        'passport': '0 20px 60px rgba(30,42,89,0.15), 0 8px 24px rgba(30,42,89,0.08)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0f1a40 0%, #1e3a8a 40%, #1e4ba8 100%)',
        'section-gradient': 'linear-gradient(180deg, #f8f9fc 0%, #ffffff 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,244,255,0.6) 100%)',
        'saffron-gradient': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        'passport-gradient': 'linear-gradient(135deg, #0f1a40 0%, #1e3a8a 60%, #1e4ba8 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      borderRadius: {
        lg: '0.625rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
