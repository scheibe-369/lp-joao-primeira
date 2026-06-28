import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

// import.meta.env não está disponível no config — ler com loadEnv (regra 15 do PRD).
const { PUBLIC_SITE_URL } = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

export default defineConfig({
  output: 'static',
  site: PUBLIC_SITE_URL || 'https://lp.brasildtf.com.br',
  integrations: [
    // applyBaseStyles:false → o reset/base do Tailwind entra via globals.css (@tailwind base).
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
  // Serviço de imagem = sharp (padrão no Astro 5). AVIF/WebP a partir de src/assets.
});
