import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7ff',
          100: '#e6ecff',
          200: '#c4d3ff',
          300: '#9db5ff',
          400: '#6b8aff',
          500: '#3c5aff',
          600: '#2a43db',
          700: '#1d30a8',
          800: '#121f75',
          900: '#0a134b',
        },
      },
    },
  },
  plugins: [],
};

export default config;
