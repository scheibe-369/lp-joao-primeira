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
          DEFAULT: '#051a3b', // âncora escura (footer / CTA final)
          deep: '#03122b', // âncora escura 2
          surface: '#0a2350', // superfície escura (uso pontual)
        },
        muted: '#9fb0c9', // texto secundário sobre navy (âncoras escuras)
        metal: {
          base: '#b8901e',
          high: '#fff3c4',
        },
        // ---- tema CLARO (tokens semânticos) ----
        surface: '#ffffff', // canvas base (nível 0)
        'surface-2': '#f5f7fb', // seção alternada (off-white frio)
        'surface-3': '#eaeef6', // insets / zebra de specs
        ink: {
          DEFAULT: '#051a3b', // títulos + texto forte (~15:1)
          muted: '#5b6a85', // texto secundário (~5:1 AA)
          soft: '#8492a8', // decorativo / texto grande
        },
        line: {
          DEFAULT: '#e3e8f1', // hairline padrão
          strong: '#cdd6e4', // contorno de botão / divisor forte
          subtle: '#eef2f8', // divisor tênue
        },
        fill: {
          DEFAULT: '#f1f4f9', // botão/chip neutro (rest)
          hover: '#e7ecf4', // hover
        },
        'gold-ink': '#8a6a0f', // "ouro" AA-safe p/ eyebrow no claro (~5:1)
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
        DEFAULT: '#e3e8f1',
      },
      boxShadow: {
        // sombras navy-tinted (mais premium que preto puro)
        'elev-1': '0 1px 2px 0 rgba(5,26,59,.05), 0 1px 3px 0 rgba(5,26,59,.06)',
        'elev-2': '0 2px 6px -1px rgba(5,26,59,.06), 0 10px 24px -8px rgba(5,26,59,.10)',
        'elev-3': '0 8px 16px -4px rgba(5,26,59,.08), 0 24px 48px -12px rgba(5,26,59,.16)',
      },
    },
  },
  plugins: [],
};
