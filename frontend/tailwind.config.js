/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF8F5',
        ivory: '#FDFBF7',
        beige: {
          50: '#FDFCFB',
          100: '#FAF8F5',
          200: '#F4EFEA',
          300: '#EFE9E1',
          400: '#E6DFD5',
          500: '#DDD5C7',
          600: '#C4BCB0',
          700: '#A39B94',
          800: '#7E766F',
          900: '#5A534D',
          DEFAULT: '#E6DFD5',
        },
        cream: {
          50: '#FDFCFB',
          100: '#FAF8F5',
          200: '#F4EFEA',
          300: '#EFE9E1',
          400: '#E6DFD5',
          500: '#DDD5C7',
          600: '#C4BCB0',
          700: '#A39B94',
          800: '#7E766F',
          900: '#5A534D',
          DEFAULT: '#FAF8F5',
        },
        surface: {
          white: '#FFFFFF',
          card: '#FCFBF9',
          subtle: '#F6F2EC',
          hover: '#F2ECE4',
          muted: '#EFE9E1',
        },
        terracotta: {
          50: '#FDF6F3',
          100: '#F9EDE8',
          200: '#F3D9CF',
          300: '#E8BBAA',
          400: '#D9917A',
          500: '#C86D51', // Primary brand
          600: '#B85D43', // Primary hover
          700: '#9B4B34',
          800: '#7F3D2B',
          900: '#683325',
          DEFAULT: '#C86D51',
        },
        sage: {
          50: '#F4F7F4',
          100: '#E8EFE9',
          200: '#D2E0D4',
          300: '#B3CBB7',
          400: '#8EB194',
          500: '#607B66', // Secondary accent
          600: '#4D6A54',
          700: '#3D5443',
          800: '#2E3F33',
          900: '#202C24',
          DEFAULT: '#607B66',
        },
        sand: {
          50: '#FAF7F2',
          100: '#F4EDE2',
          200: '#EAD8C3',
          300: '#DDC2A2',
          400: '#D4A373', // Supporting accent / warm sand
          500: '#C59B6D',
          600: '#A98155',
          700: '#8D6942',
          800: '#715233',
          900: '#553C24',
          DEFAULT: '#D4A373',
        },
        charcoal: {
          50: '#F7F6F5',
          100: '#E6E0DA',
          200: '#CCC5BE',
          300: '#ABA29B',
          400: '#8A8079', // Muted text
          500: '#6E655F', // Secondary text
          600: '#5E5450',
          700: '#453C39',
          800: '#2C2523', // Primary text
          900: '#1F1A18', // Deepest text
          DEFAULT: '#2C2523',
        },
        softBorder: {
          light: '#F0EBE3',
          DEFAULT: '#E6DFD5',
          dark: '#DDD5C7',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        'warm-sm': '0 2px 8px -1px rgba(44, 37, 35, 0.04), 0 1px 3px -1px rgba(44, 37, 35, 0.03)',
        'warm-md': '0 6px 20px -3px rgba(44, 37, 35, 0.06), 0 2px 6px -2px rgba(44, 37, 35, 0.04)',
        'warm-lg': '0 12px 32px -4px rgba(44, 37, 35, 0.08), 0 4px 12px -2px rgba(44, 37, 35, 0.04)',
        'warm-xl': '0 20px 48px -6px rgba(44, 37, 35, 0.1), 0 8px 20px -4px rgba(44, 37, 35, 0.05)',
        'terracotta': '0 6px 20px -4px rgba(200, 109, 81, 0.35)',
        'sage': '0 6px 20px -4px rgba(96, 123, 102, 0.35)',
        'sand': '0 6px 20px -4px rgba(212, 163, 115, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
