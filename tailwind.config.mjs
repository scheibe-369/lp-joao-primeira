/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx,vue,svelte}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#febf02', // amarelo — CTA/acento/badges
          ink: '#051a3b', // texto sobre amarelo = navy (nunca branco)
        },
        navy: {
          DEFAULT: '#051a3b', // fundo base
          deep: '#03122b', // fundo 2 / seções alternadas
          surface: '#0a2350', // cards
        },
        muted: '#9fb0c9', // texto secundário (>=4.5:1 sobre navy)
        metal: {
          base: '#b8901e',
          high: '#fff3c4',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', '"Bebas Neue Fallback"', '"Arial Narrow"', 'sans-serif'],
        body: ['Barlow', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
        sans: ['Barlow', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        content: '1200px',
      },
      letterSpacing: {
        eyebrow: '0.18em',
      },
      screens: {
        xs: '375px',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.08)',
      },
    },
  },
  plugins: [],
};
