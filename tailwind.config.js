/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#123C2A',
        leaf: '#215C3A',
        sage: '#8DB580',
        terracotta: '#D5573B',
        mustard: '#E3A62F',
        cream: '#F2F4EC',
        ink: '#1C2A22',
        muted: '#5F6B63',
        line: '#E4E8DF',
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Lato', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(18,60,42,0.06)',
        lift: '0 12px 32px rgba(18,60,42,0.14)',
        phone: '0 30px 60px -20px rgba(18,60,42,0.45)',
      },
    },
  },
  plugins: [],
}
