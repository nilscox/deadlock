/** @type {import('tailwindcss').Config} */
export default {
  content: ['src/**/*.tsx'],
  darkMode: 'class',
  theme: {
    backgroundColor: {
      transparent: 'transparent',
      body: 'rgb(var(--color-bg-body) / <alpha-value>)',
      muted: 'rgb(var(--color-bg-muted) / <alpha-value>)',
    },
    boxShadowColor: {
      neutral: 'rgb(var(--color-shadow) / <alpha-value>)',
    },
    borderColor: {
      DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
    },
    textColor: {
      body: 'rgb(var(--color-text-body) / <alpha-value>)',
      inverted: 'rgb(var(--color-text-inverted) / <alpha-value>)',
      muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
      green: 'rgb(var(--color-text-green) / <alpha-value>)',
      red: 'rgb(var(--color-text-red) / <alpha-value>)',
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
      'fade-in': '2s ease-out both fade-in',
      swipe: '2s ease swipe infinite',
      'tap-twice': '2s ease 1s both tap-twice infinite',
    },
    keyframes: {
      'fade-in': {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 },
      },
      swipe: {
        '0%': { opacity: 0, transform: 'translateX(-2rem)' },
        '5%': { opacity: 1 },
        '95%': { opacity: 1 },
        '100%': { opacity: 0, transform: 'translateX(2rem)' },
      },
      'tap-twice': {
        ...{ '00%': { opacity: 0 }, '03%': { opacity: 1 }, '07%': { opacity: 1 }, '10%': { opacity: 0 } },
        ...{ '20%': { opacity: 0 }, '23%': { opacity: 1 }, '27%': { opacity: 1 }, '30%': { opacity: 0 } },
        '100%': { opacity: 0 },
      },
    },
  },
  plugins: [],
};
