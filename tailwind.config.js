import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['src/**/*.tsx'],
  theme: {
    textColor: {
      muted: colors.neutral[500],
    },
    backgroundColor: {
      muted: colors.slate[100],
    },
    fontSize: {
      DEFAULT: '16px',
      sm: '0.875rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    fontFamily: {
      DEFAULT: 'monospace',
    },
  },
  plugins: [],
};
