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
      },
    },
  },
  plugins: [],
}
