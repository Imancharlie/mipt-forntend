/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Orange Theme - brighter pleasant orange
        'orange': {
          50: '#FFF4E6',
          100: '#FFE6BF',
          200: '#FFD196',
          300: '#FFB866',
          400: '#FF9A33',
          500: '#FF7F1A', // primary (brighter but not neon)
          600: '#F76A00', // hover
          700: '#D95D00',
          800: '#B34C00',
          900: '#8C3C00',
        },
        // Purple Theme
        'purple': {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#7C3AED', // More muted primary
          600: '#6D28D9',
          700: '#5B21B6',
          800: '#4C1D95',
          900: '#2E1065',
        },
        // Green Theme
        'green': {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#059669', // More muted primary
          600: '#047857',
          700: '#065F46',
          800: '#064E3B',
          900: '#022C22',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      minHeight: {
        '11': '2.75rem', // 44px for touch targets
      },
      maxWidth: {
        '8xl': '88rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 