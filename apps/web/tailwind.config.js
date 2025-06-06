/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'scaffai-primary': '#2563eb',
        'scaffai-secondary': '#64748b',
        'scaffai-accent': '#f59e0b',
      },
    },
  },
  plugins: [],
}