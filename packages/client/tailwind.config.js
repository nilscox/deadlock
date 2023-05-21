import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['src/**/*.tsx'],
  theme: {
    textColor: {
      muted: colors.neutral[500],
      green: colors.emerald[600],
      red: colors.orange[700],
    },
    backgroundColor: {
      muted: colors.slate[100],
    },
    fontSize: {
      base: ['1rem', '1.5rem'],
      xs: ['0.75rem', '1rem'],
      sm: ['0.875rem', '1.25rem'],
      lg: ['1.5rem', '2rem'],
      xl: ['2rem', '3rem'],
    },
    fontFamily: {
      mono: ['JetBrains Mono', 'Source Code Pro', 'Liberation Mono', 'monospace'],
    },
    animation: {
      'fade-in': '2s ease-out 4s both fade-in',
    },
    keyframes: {
      'fade-in': {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 },
      },
    },
  },
  plugins: [],
};
