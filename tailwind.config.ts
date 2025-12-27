import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'fraction-bg': '#0a0a0a',
        'fraction-lime': '#ccff00',
      },
      boxShadow: {
        glow: '0 0 20px rgba(204,255,0,0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
