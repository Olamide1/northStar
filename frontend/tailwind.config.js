/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '8pt': '8px',
        '16pt': '16px',
        '24pt': '24px',
        '32pt': '32px',
        '48pt': '48px',
        '64pt': '64px',
      },
      colors: {
        primary: {
          DEFAULT: '#000000',
          hover: '#333333',
        },
        accent: {
          DEFAULT: '#0066FF',
          hover: '#0052CC',
        },
        // Subtle color palette inspired by minimalist design
        warm: {
          50: '#FFF8F5',
          100: '#FFE8E0',
          200: '#FFD4C2',
          300: '#FFB89A',
          DEFAULT: '#FF9A6B',
        },
        cool: {
          50: '#F5F9FF',
          100: '#E0EDFF',
          200: '#C2DBFF',
          300: '#9AC2FF',
          DEFAULT: '#6BA3FF',
        },
        soft: {
          purple: '#E8D5FF',
          green: '#D5F5E8',
          amber: '#FFF4D5',
          rose: '#FFE5E8',
          blue: '#E5F0FF',
        },
      },
    },
  },
  plugins: [],
}
