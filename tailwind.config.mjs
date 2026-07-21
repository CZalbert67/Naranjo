/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Paleta Azul Empresarial Claro + Naranja
        corporate: {
          dark: '#0a1128',
          card: '#1c2541',
          border: '#2a365c',
        },
        skyblue: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        brandOrange: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
      },
    },
  },
  plugins: [],
};
