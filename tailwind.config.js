/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Temporary pages and services
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        primary: {
          50: '#eef9ff',
          100: '#d9f0ff',
          200: '#bae5ff',
          300: '#8ad6ff',
          400: '#52bcff',
          500: '#2b9dff',
          600: '#1181f8',
          700: '#0e6de9',
          800: '#1357bd',
          900: '#154994',
          950: '#112d5a',
        },
        dark: {
          background: '#030712',
          card: '#0f172a',
          border: '#1e293b',
          text: '#e2e8f0',
          muted: '#94a3b8',
        },
        light: {
          background: '#ffffff',
          card: '#f8fafc',
          border: '#e2e8f0',
          text: '#1e293b',
          muted: '#64748b',
        }
      },
    },
  },
  plugins: [],
}