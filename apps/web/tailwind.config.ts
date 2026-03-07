import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(var(--bg) / <alpha-value>)',
        card: 'hsl(var(--card) / <alpha-value>)',
        ink: 'hsl(var(--ink) / <alpha-value>)',
        muted: 'hsl(var(--muted) / <alpha-value>)',
        line: 'hsl(var(--line) / <alpha-value>)',
        ok: 'hsl(var(--ok) / <alpha-value>)',
        bad: 'hsl(var(--bad) / <alpha-value>)',
        accent: 'hsl(var(--accent) / <alpha-value>)',
      },
      boxShadow: {
        lift: '0 20px 60px -30px rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'fade-up': 'fade-up 450ms ease-out both',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
