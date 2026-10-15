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
        // Brand Theme Palette: Burgundy, Warm Cream, Soft Rose, Antique Gold, Pure White
        burgundy: {
          50: '#FFF1F2',
          100: '#FFE4E6', // Soft rose
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337', // Exact Brand Burgundy
          950: '#4C0519',
          base: '#881337',
        },
        rose: {
          50: '#FFF1F2',
          100: '#FFE4E6', // Exact Soft Rose
          200: '#FECDD3',
          300: '#FDA4AF',
          base: '#FFE4E6',
        },
        gold: {
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04', // Exact Antique Gold
          700: '#A16207',
          base: '#CA8A04',
        },
        // Backward-compatible milan mapping to Burgundy
        milan: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#9F1239',
          600: '#881337', // Brand Burgundy
          700: '#73102F',
          800: '#5E0C25',
          900: '#4C0519',
          950: '#2E030F',
          base: '#881337',
        },
        // Warm Cream surfaces & backgrounds
        cream: {
          bg: '#FFFDF7', // Exact Warm Cream
          surface: '#FFFFFF',
          card: '#FFFFFF',
          elevated: '#FFFDF7',
          border: 'rgba(136, 19, 55, 0.12)',
          'border-strong': 'rgba(136, 19, 55, 0.25)',
        },
        // Chiffon backward compatibility mapped to warm cream
        chiffon: {
          50: '#FFFFFF',
          100: '#FFFDF7',
          200: '#FFE4E6',
          300: '#FED7AA',
          400: '#FDE047',
          500: '#CA8A04',
          base: '#FFFDF7',
        },
        // Deep burgundy/espresso text on warm cream
        espresso: {
          900: '#1C0D12',
          800: '#2B1119',
          700: '#3D1B24',
          600: '#542833',
          500: '#6B3846',
          muted: '#6B4E56',
          subtle: '#8C6C75',
        },
        cinema: {
          black: '#FFFDF7',
          navy: '#FFE4E6',
          elevated: '#FFFFFF',
          secondary: '#FFFDF7',
          surface: '#FFFFFF',
          border: 'rgba(136, 19, 55, 0.12)',
          'border-bright': 'rgba(136, 19, 55, 0.25)',
        },
        text: {
          primary: '#1C0D12',
          muted: '#6B4E56',
          subtle: '#8C6C75',
        },
        accent: {
          blue: '#881337',
          cyan: '#9F1239',
          violet: '#881337',
          saffron: '#CA8A04',
          emerald: '#16A34A',
        },
        gov: {
          bg: '#FFFDF7',
          surface: '#FFFFFF',
          border: 'rgba(136, 19, 55, 0.12)',
          muted: '#6B4E56',
          text: '#1C0D12',
          subtle: '#8C6C75',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'milan-glow': '0 10px 30px -5px rgba(184, 17, 4, 0.45), 0 0 15px rgba(255, 181, 71, 0.25)',
        'milan-panel': '0 25px 60px -15px rgba(122, 11, 2, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
        'chiffon-card': '0 10px 30px -10px rgba(184, 17, 4, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
        'chiffon-elevated': '0 20px 45px -15px rgba(184, 17, 4, 0.15), 0 0 1px rgba(184, 17, 4, 0.25)',
        'glow-luminous': '0 10px 30px -5px rgba(184, 17, 4, 0.45), 0 0 15px rgba(255, 181, 71, 0.25)',
        'cinema-card': '0 10px 30px -10px rgba(184, 17, 4, 0.08), 0 0 0 1px rgba(184, 17, 4, 0.12)',
        'cinema-panel': '0 25px 60px -15px rgba(122, 11, 2, 0.5), 0 0 0 1px rgba(184, 17, 4, 0.2)',
      },
      backgroundImage: {
        'milan-gradient': 'linear-gradient(135deg, #D91C0B 0%, #B81104 50%, #7A0B02 100%)',
        'milan-gloss': 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)',
        'chiffon-mesh': 'radial-gradient(ellipse at 80% 15%, rgba(184, 17, 4, 0.12) 0%, transparent 50%), radial-gradient(circle at 15% 85%, rgba(255, 181, 71, 0.15) 0%, transparent 45%), linear-gradient(180deg, #FFFDF0 0%, #FFFACD 50%, #FFFDF0 100%)',
        'ribbon-wave': 'radial-gradient(ellipse at 50% 50%, rgba(184, 17, 4, 0.08) 0%, transparent 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float-slow': 'float 6s ease-in-out infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      borderRadius: {
        lg: '0.625rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
};

export default config;
