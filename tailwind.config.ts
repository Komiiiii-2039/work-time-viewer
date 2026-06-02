import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        // Vercel design tokens
        surface: '#ffffff',
        background: '#fafafa',
        border: '#eaeaea',
        'a1': '#fafafa',
        'a2': '#eaeaea',
        'a3': '#999999',
        'a4': '#888888',
        'a5': '#666666',
        'a6': '#444444',
        'a7': '#333333',
        'a8': '#111111',
      },
      boxShadow: {
        'md1': '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px 1px rgba(0,0,0,0.03)',
        'md2': '0 1px 2px rgba(0,0,0,0.06), 0 2px 6px 2px rgba(0,0,0,0.05)',
        'md3': '0 4px 8px 3px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
