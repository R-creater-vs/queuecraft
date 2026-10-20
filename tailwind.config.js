/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F7F5EF',
          subtle: '#EEECE4',
        },
        navy: {
          DEFAULT: '#24343A',
          light: '#364B53',
          dark: '#162226',
        },
        teal: {
          DEFAULT: '#267D78',
          light: '#E6F3F2',
          dark: '#1C605C',
        },
        copper: {
          DEFAULT: '#B96732',
          light: '#FAEEE7',
          dark: '#934F23',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
