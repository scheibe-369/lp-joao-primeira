# PRD (IA) — Landing Page Brasil DTF · Portfólio de Impressoras DTF · **v2 (auditado)**

> Documento autossuficiente para um agente de código (Claude Code / Cursor / Gemini).
> Lendo SÓ este arquivo é possível construir a LP inteira. Linguagem imperativa: faça exatamente
> o que está aqui. Se uma tecnologia escolhida der problema, **reporte** — não troque sozinho.
> **Leia a Seção 11 (Manifesto de Segurança) ANTES de escrever qualquer código.**
> v2 = corrigido após auditoria adversarial (ver `AUDITORIA-prd.md`).

---

## 1. CONTEXTO

Construir uma **landing page-portfólio** para a **Brasil DTF** (revenda brasileira de impressoras
DTF / UV-DTF têxteis, CNPJ 39.497.418/0001-91 — *confirmar exibição*). A página reúne **7 máquinas**
num só lugar, sem a enrolação de um site institucional. É **isca de tráfego pago no Meta Ads**:
recebe volume, apresenta os produtos e converte em **conversa no WhatsApp**. **Não é e-commerce** —
sem carrinho, checkout ou preço exibido.

Cada máquina é um **card** num grid; ao clicar, abre uma **página dedicada só daquela máquina**
(specs, galeria, diferenciais) com **CTA para o WhatsApp** — imitando o padrão da Stellar Print
(catálogo lead-gen: card → detalhe → falar com humano).

**Restrição nº 1, inviolável: PERFORMANCE.** Carregar muito rápido e **não quebrar em NENHUM
device** — perfeita em celular (inclusive fraco/3G-4G e **in-app browser do Instagram/Facebook**) e
em desktop, de **320px a 4K**. Meta: **Lighthouse ≥ 95 mobile e desktop, medido em build de
PRODUÇÃO com o Pixel ativo**.

**Restrição nº 2:** plugar o **Pixel do Meta Ads** com **consentimento (LGPD)** e disparar evento
de conversão.

---

## 2. TECH STACK (NÃO-NEGOCIÁVEL)

| Componente | Tecnologia | Versão (fixar) | Observação |
|---|---|---|---|
| Framework | **Astro** | **^5** (`output: 'static'`) | HTML estático, ~zero JS por padrão. NÃO usar Astro 4. |
| Estilo | **Tailwind CSS** | ^3 (via `@astrojs/tailwind`) | Tokens da marca no `tailwind.config.mjs`. |
| Linguagem | **TypeScript** | ^5 | `strict: true`. |
| Imagens | **`astro:assets`** + **sharp** | nativo Astro 5 | AVIF/WebP responsivos. |
| Sitemap | **@astrojs/sitemap** | ^3 | SEO básico. |
| Ícones | **SVG inline** (Lucide static) | — | NUNCA emoji como ícone. |
| Fontes | **Self-hosted woff2 subsetado (latin)** — Bebas Neue + Barlow | via Fontsource/Google, subset latin | `font-display` controlado (ver regra 5). |
| Hospedagem | **Cloudflare Pages** | — | **SÓ DEPOIS**, via integração GitHub (não agora). |
| Node | LTS (≥ 18) | — | Para build. |

**Orçamento de JS first-party < 30KB** (não conta o `fbevents.js` da Meta, que é terceiro e carrega
**adiado** — ver regra 8). **Ilhas de JS permitidas (exatamente estas):** (a) `scroll-reveal.ts`;
(b) `consent.ts` (banner LGPD + carregador do Pixel). **O filtro do catálogo é CSS-only — não é
ilha de JS.**

**Proibido trocar** Astro por Next.js/Vite-SPA/WordPress; proibido React/Vue/Svelte/jQuery/GSAP/
Framer-Motion como runtime.

---

## 3. ESTRUTURA DO PROJETO (Feature-Sliced / modular-arch)

Cada feature é uma vertical; `components/ui/` só primitivos genéricos (zero conhecimento de domínio).

```
.
├── astro.config.mjs           # integrações: tailwind, sitemap, image (sharp). site via loadEnv (regra abaixo)
├── tailwind.config.mjs        # design tokens (cores, fontes, spacing)
├── tsconfig.json              # strict
├── package.json               # deps pinadas
├── .env.example
├── .gitignore                 # .env, dist/, node_modules/
├── CLAUDE.md
├── public/
│   ├── fonts/                 # BebasNeue-latin.woff2, Barlow-400.woff2, Barlow-600.woff2 (subset latin)
│   ├── og/                    # og-default.jpg (1200x630)
│   └── favicon.svg
└── src/
    ├── assets/
    │   ├── brand/             # logo otimizável (mover logo/BrasilDTF logo.png p/ cá)
    │   └── machines/          # FOTOS por máquina: <slug>/hero.jpg, <slug>/g1.jpg ...
    ├── layouts/
    │   └── BaseLayout.astro   # <head>: meta, viewport, preload fonte, OG, JSON-LD (prop), consent slot
    ├── pages/
    │   ├── index.astro
    │   ├── maquinas/[slug].astro
    │   ├── politica-de-privacidade.astro
    │   └── 404.astro
    ├── data/
    │   └── machines.ts        # FONTE ÚNICA das 7 máquinas (tipada). Resolve imagens via import.meta.glob
    ├── components/ui/         # PRIMITIVOS genéricos:
    │   ├── Button.astro
    │   ├── WhatsAppButton.astro   # usa lib/whatsapp.ts + dispara Contact; target=_blank rel=noopener
    │   ├── Badge.astro
    │   ├── Section.astro
    │   └── Container.astro
    ├── modules/
    │   ├── header/Header.astro        # logo + link "Falar no WhatsApp"
    │   ├── hero/Hero.astro            # headline .metal-shine + imagem (LCP)
    │   ├── catalog/
    │   │   ├── Catalog.astro          # grid + filtro Têxtil/UV CSS-only (radios)
    │   │   └── ProductCard.astro      # card .card-glow
    │   ├── machine/
    │   │   ├── MachineHero.astro
    │   │   ├── MachineHighlights.astro
    │   │   └── MachineSpecs.astro
    │   ├── about/About.astro          # "Sobre" com scroll-reveal
    │   ├── trust/Trust.astro          # selos verificáveis
    │   ├── testimonials/Testimonials.astro  # prova social (conteúdo a coletar c/ cliente)
    │   ├── faq/Faq.astro              # FAQ + "qual máquina escolher" (CSS-only <details>)
    │   ├── consent/CookieBanner.astro # banner LGPD que gateia o Pixel
    │   ├── contact/
    │   │   ├── ContactBand.astro
    │   │   └── FloatingWhatsApp.astro
    │   └── footer/Footer.astro        # CNPJ, link Política de Privacidade, WhatsApp
    ├── lib/
    │   ├── analytics/pixel.ts  # carrega fbevents só após consentimento; track('Contact', {...})
    │   ├── consent.ts          # estado de consentimento (localStorage) + init do banner
    │   ├── whatsapp.ts         # monta link wa.me
    │   └── scroll-reveal.ts    # IntersectionObserver (vanilla) + pausa do metal-shine fora da viewport
    └── styles/
        └── globals.css         # tokens + .metal-shine + .card-glow + reveal + fallback de fonte
```

**Regra modular-arch:** componente que renderiza máquina / lê specs / monta CTA de WhatsApp → vive em
`modules/`. `components/ui/` só o que é 100% agnóstico.

---

## 4. MODELO DE DADOS (fonte única: `src/data/machines.ts`)

Sem banco. O "modelo" é o array tipado. Grid e páginas `[slug]` consomem **o mesmo** array (DRY).

### 4.1 Tipos + resolução de imagem (astro:assets correto)

```ts
// src/data/machines.ts
import type { ImageMetadata } from 'astro';

// Resolve as imagens de src/assets/machines/<slug>/... em ImageMetadata (otimizável por <Image/>).
// NÃO colocar fotos em public/ — public não passa pelo astro:assets.
const _images = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/machines/**/*.{jpg,jpeg,png,webp,avif}',
  { eager: true }
);
function img(rel: string): ImageMetadata {
  const key = `../assets/machines/${rel}`;
  const mod = _images[key];
  if (!mod) throw new Error(`Imagem da máquina não encontrada: ${key}`);
  return mod.default;
}

export type MachineLine = 'textile' | 'uv';
export type MachineTier =
  | 'iniciante' | 'compacta' | 'profissional' | 'profissional-plus' | 'industrial' | 'uv';

export interface MachineSpec { label: string; value: string }

export interface Machine {
  slug: string;                 // URL: /maquinas/<slug>
  name: string;                 // nome completo (vai no <title>/JSON-LD)
  shortName: string;            // nome curto p/ H1 (evita estouro em 320px)
  line: MachineLine;            // têxtil | uv (filtro)
  tier: MachineTier;            // nível (lógica/ordenação interna — NÃO exibido)
  badge: string;                // selo EXIBIDO no card (string livre, ex: "Profissional • 60cm")
  tagline: string;              // 1 linha de venda
  target: string;               // "Ideal para:" (EXIBIR no card e/ou detalhe)
  heads: string;
  width: string;
  topSpeed: string | null;      // null => omitir a linha (não exibir "—")
  highlights: string[];         // 3–5 bullets do detalhe
  specs: MachineSpec[];         // tabela completa do detalhe
  whatsappMessage: string;      // texto pré-preenchido específico
  image: ImageMetadata;         // principal (LCP do detalhe). via img('<slug>/hero.jpg')
  gallery?: ImageMetadata[];    // opcional. Se ausente/vazio, MachineHero usa só `image`.
  sourceUrl: string;            // origem interna (NÃO exibir)
}
```

> **Placeholder até as fotos reais (👤 cliente):** versionar 1 `hero.jpg` placeholder por slug em
> `src/assets/machines/<slug>/` (mesmo um SVG/imagem navy+amarelo com aspecto fixo) para o build
> passar. Trocar antes do go-live. **Não** usar `public/` para essas imagens.

### 4.2 Os 7 registros (escada "bom → melhor → topo")

Linha **têxtil** (1→5 por cabeças/velocidade/largura) + linha **UV-DTF** (6–7). `badge` é exibido;
`tier` é só ordenação. Specs da pesquisa de domínio.

| # | slug | shortName | name (título completo) | line | badge | heads | width | topSpeed |
|---|------|-----------|------------------------|------|-------|-------|-------|----------|
| 1 | `l8180-xp600` | L8180 XP600 | Impressora DTF L8180 XP600 — Kit Completo | textile | Iniciante • A3 | 1× Epson XP600 | A3 (~32 cm) | null |
| 2 | `xf-400pro-a2` | XF-400PRO A2 | XF-400PRO A2 — Dual F1080 All-in-One | textile | Compacta • 40cm | 2× Epson F1080-A1 | 40 cm (16,5") | 3,5 m²/h |
| 3 | `702e-c650sc` | 702E C650SC | 702E + C650SC — 60cm Dual i3200 | textile | Profissional • 60cm | 2× Epson i3200-A1 | 60 cm (24") | 8 m²/h |
| 4 | `702e-z650-2` | 702E Z650-2 | 702E + Z650-2 — 60cm Dual i3200 (Alta Velocidade) | textile | Profissional+ • 60cm | 2× Epson i3200-A1 | 60 cm (24") | 10 m²/h |
| 5 | `c605-h6502` | C605 H6502 | C605 + H6502 — Industrial 5 Cabeças 60cm | textile | Industrial • 5 cabeças | 5× Epson i3200-A1 | 60 cm (24") | 28 m²/h |
| 6 | `xf-420s` | XF-420S | XF-420S — UV-DTF + Bordado 3D | uv | UV-DTF + Bordado 3D | 4× Epson i1600-U1 | 42 cm (16,5") | 3,5 m²/h |
| 7 | `xf-450s-uv` | XF-450S UV | XF-450S UV — Crystal Label | uv | UV-DTF • Crystal Label | 1× i3200U1-HD + 2× i1600-U1 | 30 cm (12") | 2,75 m²/h |

**Conteúdo por registro** (tagline · target · highlights · specs):

- **1 · L8180 XP600** — tagline: "O jeito mais barato e completo de começar no DTF." · target:
  "Quem está começando / primeiro negócio." · highlights: kit turnkey (forno de poliamida, mesa a
  vácuo, tintas 100ml/cor, 30 folhas A3, 200g poliamida, Acrorip 11.2); **garantia + treinamento
  incluso**; suporte por WhatsApp. · specs: Cabeça 1× XP600 · Largura A3 (~32cm) · Tinta CMYK+Branco ·
  Inclui kit de insumos · Garantia 3 meses + treinamento.
- **2 · XF-400PRO A2** — tagline: "All-in-one compacta: imprime, aplica pó e cura num equipamento só."
  · target: "Pequeno negócio / quem quer subir do A3." · highlights: print+pó+cura integrado;
  **circulação de tinta branca** (baixa manutenção); cores vivas com cabeça dupla. · specs: 2×
  F1080-A1 · 40cm · 3,5 m²/h (6-pass) · CMYK+Branco · 3,5 kW.
- **3 · 702E + C650SC** — tagline: "Entrada no formato 60cm com pó e cura automáticos." · target:
  "Produção têxtil em crescimento." · highlights: cabeça dupla + **circulação automática de tinta
  branca**; agitador de pó com sensores; aquecimento infravermelho + resfriamento. · specs: 2×
  i3200-A1 · 60cm · 8 m²/h · CMYK+Branco (base água) · 0,8 kW.
- **4 · 702E + Z650-2** — tagline: "A 60cm mais rápida para quem já produz em escala." · target:
  "Confecção / produção em volume." · highlights: alta velocidade com branco estável; agitador de pó
  + esteira mesh + take-up por sensor; sistema térmico + resfriamento. · specs: 2× i3200-A1 · 60cm ·
  **10 m²/h** · CMYK+Branco (base água) · 0,8 kW · 158 kg. *(Sempre diferenciar da nº3 pela
  velocidade: 10 vs 8 m²/h.)*
- **5 · C605 + H6502** — tagline: "Máquina industrial de 5 cabeças para alto volume." · target:
  "Operação de médio/grande porte." · highlights: pó + cura + reciclagem + resfriamento automáticos;
  grau industrial, alta precisão, anti-colisão; ampla compatibilidade de tecidos. · specs: 5×
  i3200-A1 · 60cm · **28 m²/h** · base água · 1,6 kW.
- **6 · XF-420S** — tagline: "UV-DTF e bordado 3D no mesmo equipamento." · target: "Quem quer
  rótulos/adesivos premium e efeito 3D." · highlights: híbrida UV-DTF + bordado 3D; laminação por
  rolo de alta aderência (alto brilho); tela touch 7", descolamento automático do filme, mesa a
  vácuo, anti-colisão. · specs: 4× i1600-U1 · 42cm · 3,5 m²/h (8-pass) · 300 npi · tinta UV
  (CMYK+Branco+Branco) · 2,5 kW.
- **7 · XF-450S UV** — tagline: "Imprime e lamina rótulos crystal numa passada." · target:
  "Estúdios/PME de rótulos e superfícies rígidas." · highlights: imprime + lamina crystal labels;
  aderência durável em vidro/metal/plástico/acrílico/madeira; anti-colisão + alarme de tinta baixa. ·
  specs: 1× i3200U1-HD + 2× i1600-U1 · 30cm · 2,75 m²/h (8-pass) · 300 npi · tinta UV (CMYK + cores
  opcionais) · 1 kW.

`whatsappMessage` por máquina: `"Olá! Tenho interesse na <name>. Pode me passar mais informações?"`

---

## 5. (FILAS / JOBS) — NÃO SE APLICA
Site estático, sem backend/filas.

---

## 6. REGRAS DE IMPLEMENTAÇÃO (padrões globais)

1. **Estático sempre.** `output: 'static'`. Páginas `[slug]` via `getStaticPaths()` a partir de `machines.ts`.
2. **JS first-party < 30KB.** Só as ilhas permitidas (Seção 2): `scroll-reveal.ts` e `consent.ts`.
   O **filtro do catálogo é CSS-only** (radios + `:checked ~`), o **FAQ é `<details>`/CSS**, a
   **galeria é `scroll-snap`/CSS** — nenhum conta como ilha. `fbevents.js` (terceiro) é à parte e adiado.
3. **Animação só com `transform`/`opacity`.** **Exceção consciente e isolada:** o `.metal-shine`
   anima `background-position` (necessário p/ o efeito cromado) — por isso ele é **pausado fora da
   viewport** (regra 6.1) e `will-change` só fica ativo enquanto visível. Todas as animações têm
   guarda `@media (prefers-reduced-motion: reduce)`.
4. **Imagens via `astro:assets`** (`<Image/>`), nunca `<img>` cru, nunca em `public/`. Gerar AVIF+WebP,
   `srcset`, `width`/`height` **explícitos** (CLS=0). **LCP = imagem do hero** → `loading="eager"` +
   `fetchpriority="high"`; resto `loading="lazy"`. Abaixo da dobra: `content-visibility:auto` +
   `contain-intrinsic-size` nas seções pesadas. Para o hero, testar AVIF vs WebP em device fraco.
5. **Fontes self-hosted subsetadas (latin).** Obter via Fontsource/Google Fonts, **subset latin**
   (Basic+Latin-1, p/ diacríticos PT-BR: ã õ ç á é í ó ú â ê ô). **Verificar que a Bebas cobre os
   diacríticos** — se não cobrir, escolher arquivo com cobertura ou usar Barlow 600 onde houver
   acento. Barlow: só pesos **400 e 600** (estáticos ou variable subsetado), **teto ~30KB por
   arquivo**. `@font-face`: Barlow `font-display: swap`; **Bebas (display crítico) `font-display:
   optional`** OU `swap` **com fallback ajustado** (`@font-face` de fallback com `size-adjust`/
   `ascent-override`/`descent-override` calibrados p/ casar com a Bebas e evitar CLS). **Preload só**
   da Bebas. Sem Google Fonts via `<link>` em runtime.
6. **CTA = um verbo.** "Falar no WhatsApp" (conversão) e "Ver Detalhes" (card→detalhe) são os DOIS
   CTAs intencionais do funil estilo Stellar. Opcional: ícone-atalho de WhatsApp no card p/ o lead
   decidido.
7. **WhatsApp via `lib/whatsapp.ts`:** `https://wa.me/${PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`.
   Todo `<a>` de WhatsApp usa `target="_blank" rel="noopener"` (mantém a LP viva p/ o beacon do Pixel
   completar) e dispara o evento Contact (regra 8).
8. **Pixel: UM evento de conversão + consentimento.**
   - Carregar `fbevents.js` **só após o consentimento** (banner LGPD) **e** se `PUBLIC_META_PIXEL_ID`
     existir; injetar **adiado** (`requestIdleCallback`/pós-`load`) p/ não competir com o LCP.
   - `PageView` — no init (após consentimento).
   - `ViewContent` — no detalhe `[slug]`, `{ content_name: name, content_category: line, content_ids: [slug] }`.
   - **`Contact`** — em todo clique de CTA de WhatsApp, com `{ content_name, content_category, content_ids:[slug] }`.
     **NÃO disparar `Lead`** (clique não é lead qualificado; usar só `Contact`).
   - Se `import.meta.env.PROD && !PUBLIC_META_PIXEL_ID` → `console.warn` visível no build (falha não-silenciosa).
9. **Acessibilidade base:** contraste AA (≥4.5:1; **texto sobre amarelo = navy `#051a3b`**), foco
   visível, `alt` descritivo em imagem de produto, tap target ≥44px, headings sequenciais,
   `aria-hidden` nos decorativos (glow, linha, brilho).
10. **Mobile-first, base 320px.** A base (sem breakpoint) é projetada p/ **320px** (largura de aceite
    primária); 375/768/1024/1440 são ajustes. **Sem scroll horizontal de 320px a 4K** (`overflow-x`
    contido; scroll só dentro do trilho da galeria). `min-h-dvh`. H1 com `overflow-wrap:anywhere` +
    `text-wrap:balance`. **Tabela de specs:** em `<768px` empilhar (label em cima, valor embaixo,
    `display:grid`), nunca `<table>` que force scroll.
11. **Hover só em `@media (hover:hover)`** (card-glow não gruda em touch).
12. **SEO/Share:** `<title>`/description por página; OG/Twitter; **JSON-LD por página via prop
    `jsonLd` no BaseLayout** — no detalhe, `Product` (name, description, brand, image; **sem
    `offers`/price** — preço oculto; warning do Google é aceitável e intencional). `sitemap`, `lang="pt-BR"`.
13. **Filtro do catálogo CSS-only:** `<input type="radio" name="filtro">` (Todas / Têxtil / UV) +
    `:checked ~` p/ alternar visibilidade dos grupos. Chips ≥44px, estado ativo visível, default = **Todas**.
14. **FloatingWhatsApp:** `position:fixed; bottom: calc(16px + env(safe-area-inset-bottom))`; a página
    reserva `padding-bottom` da altura do botão; **esconder o flutuante quando a ContactBand estiver
    visível** (IntersectionObserver já existente). Não cobrir conteúdo/CTA.
15. **`astro.config.mjs`:** ler env com `loadEnv` do Vite (`const env = loadEnv(mode, process.cwd(), '')`)
    para setar `site: env.PUBLIC_SITE_URL` — `import.meta.env` não está disponível no config.

### 6.1 CSS dos efeitos (em `src/styles/globals.css`)

```css
:root { --ease: cubic-bezier(0.22, 1, 0.36, 1); --accent: 254 191 2; } /* #febf02 */

/* ===== METAL SHINE (ouro) — com fallback p/ in-app browsers + pausável ===== */
.metal-shine { color: #fff3c4; } /* FALLBACK sólido: se background-clip:text não houver, título continua visível */
@supports ((-webkit-background-clip: text) or (background-clip: text)) {
  .metal-shine {
    background: linear-gradient(120deg, #b8901e 40%, #fff3c4 50%, #b8901e 60%);
    background-size: 200% 100%;
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent; color: transparent;
    /* roda só enquanto visível (classe .is-visible adicionada pelo observer) */
  }
  .metal-shine.is-visible {
    animation: metal-shine-sweep 5s linear infinite;
    will-change: background-position;
  }
}
@keyframes metal-shine-sweep { 0% { background-position: 100% 0 } 100% { background-position: -100% 0 } }
@media (max-width: 1024px) { .metal-shine.is-visible { animation-duration: 8s } }
@media (prefers-reduced-motion: reduce) { .metal-shine.is-visible { animation: none } }
/* REGRA DE USO: .metal-shine só sobre navy sólido OU scrim >=60% navy. Nunca direto sobre foto clara. */

/* ===== CARD GLOW (retintado roxo->amarelo da marca) ===== */
.card {
  position: relative; height: 100%; overflow: hidden; border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08); background-color: #0a2350;
  transition: background-color 900ms var(--ease), border-color 900ms var(--ease), box-shadow 900ms var(--ease);
}
.card-glow {
  pointer-events: none; position: absolute; inset: 0; opacity: 0;
  transition: opacity 900ms var(--ease);
  background: radial-gradient(130% 80% at 50% 110%, rgba(var(--accent)/0.22) 0%, rgba(var(--accent)/0) 65%);
}
.card-line {
  position: absolute; inset-inline: 0; bottom: 0; height: 2px;
  transform: scaleX(0); transform-origin: left;
  background: linear-gradient(to right, rgb(var(--accent)), rgba(var(--accent)/0.4));
  transition: transform 1200ms var(--ease);
}
@media (hover: hover) {
  .card:hover { border-color: rgba(var(--accent)/0.5); background-color: #0c2a5e;
                box-shadow: 0 0 80px -20px rgba(var(--accent)/0.35); }
  .card:hover .card-glow { opacity: 1; }
  .card:hover .card-line { transform: scaleX(1); }
}
@media (prefers-reduced-motion: reduce) { .card, .card-glow, .card-line { transition: none } }

/* ===== SCROLL REVEAL ===== */
[data-reveal] { opacity: 0; transform: translateY(24px); transition: opacity 600ms ease-out, transform 600ms ease-out; }
[data-reveal].is-visible { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { [data-reveal] { opacity: 1; transform: none; transition: none } }
```

`scroll-reveal.ts`: um `IntersectionObserver` (threshold 0.15) que adiciona `.is-visible` a
`[data-reveal]` (stagger 60–80ms, `unobserve` após revelar) **e** alterna `.is-visible` no
`.metal-shine` do hero (para pausar a animação quando sai da viewport). ~1KB.

---

## 7. VARIÁVEIS DE AMBIENTE (`.env` — nunca commitar)

```bash
# .env.example
PUBLIC_WHATSAPP_NUMBER=5519989066868   # 👤 confirmar nº único (achados: 19 98906-6868 / 19 99956-8864)
PUBLIC_META_PIXEL_ID=                   # vazio em dev (Pixel não injeta). 👤 preencher em prod.
PUBLIC_SITE_URL=https://lp.brasildtf.com.br   # 👤 confirmar domínio/subdomínio
```
`PUBLIC_*` é exposto ao cliente de propósito (pixel/whatsapp são públicos). Sem segredo de servidor;
se surgir, **não** usar prefixo `PUBLIC_`.

---

## 8. ORDEM DE IMPLEMENTAÇÃO (por dependência; cada passo tem teste)

1. **Scaffold (não-interativo).**
   `npm create astro@latest brasil-dtf-lp -- --template minimal --typescript strict --no-install --no-git --yes`
   depois `npm i` + `npx astro add tailwind sitemap --yes` + `npm i sharp`. Fixar Astro **^5** no
   `package.json`. Config `output:'static'`; `site` via `loadEnv` (regra 15).
   **Teste:** `npm run dev` sobe em `localhost:4321` sem erro.
2. **Tokens + globals.css + fontes.** `tailwind.config.mjs` (cores/fontes/spacing Seção 10); obter e
   subsetar fontes (regra 5) com `@font-face` + fallback ajustado; colar `.metal-shine`, `.card-glow`,
   reveal (Seção 6.1). **Teste:** página de teste com Bebas + Barlow + palavra `.metal-shine` (e ela
   continua visível com `background-clip` desativado nas devtools = fallback ok) + palavra acentuada
   em Bebas sem trocar pra fallback.
3. **BaseLayout.astro.** `<head>`: charset, viewport, title/description, OG/Twitter, preload Bebas,
   prop `jsonLd` (injeta `<script type="application/ld+json">`), slot do CookieBanner. **Teste:**
   view-source com head correto; Lighthouse SEO ~100.
4. **Primitivos + libs base.** `Button`, `WhatsAppButton` (usa `lib/whatsapp.ts`, `target=_blank`,
   chama `track('Contact', …)`), `Badge`, `Section`, `Container`; **stubs** de `lib/analytics/pixel.ts`
   (init condicional ao consentimento+env) e `lib/consent.ts`. **Teste:** `WhatsAppButton` gera o
   `wa.me` certo; `track` é no-op sem consentimento.
5. **`data/machines.ts`.** Tipos + `import.meta.glob` + 7 registros + placeholders de imagem em
   `src/assets/machines/<slug>/hero.*`. **Teste:** `astro check` passa; `machines.length===7`; slugs
   únicos; `<Image src={machine.image}/>` compila.
6. **Consentimento + Footer + Política.** `CookieBanner.astro` + `lib/consent.ts` (opt-in →
   habilita Pixel); `Footer.astro` (CNPJ 👤, link Política, WhatsApp); `pages/politica-de-privacidade.astro`
   (texto base Seção 10.10). **Teste:** banner aparece, aceitar persiste (localStorage) e só então o
   Pixel pode injetar; link da política abre.
7. **Header + Hero.** `Header` (logo via astro:assets + "Falar no WhatsApp"); `Hero` (headline Bebas
   com `.metal-shine` na palavra definida + subhead + CTA + imagem LCP). **Teste:** sem CLS; LCP =
   imagem; metal-shine sobre navy/scrim (legível).
8. **Catálogo.** `ProductCard` (imagem, `badge`, `shortName`/name, tagline, "Ideal para: target",
   2–4 specs resumidas — **omitir topSpeed se null**, CTA "Ver Detalhes") + `Catalog` (grid
   1→2→3col + filtro CSS-only Todas/Têxtil/UV). **Teste:** 7 cards; grid não quebra 320/768/1440;
   filtro alterna sem JS; hover-glow só em desktop.
9. **Detalhe.** `pages/maquinas/[slug].astro` (`getStaticPaths`) + `MachineHero` (galeria
   `scroll-snap` com fallback p/ `image` única; título = `shortName`; "voltar ao catálogo") +
   `MachineHighlights` + `MachineSpecs` (empilhável <768px) + ContactBand + FloatingWhatsApp + dispara
   `ViewContent` + injeta `Product` JSON-LD via prop. **Teste:** `build` gera 7 HTMLs; nome longo
   (#4) não estoura em 320px; tabela sem overflow.
10. **Sobre + Trust + Testimonials + FAQ + Contato.** `About` (`[data-reveal]`, copy Seção 10.9);
    `Trust` (selos verificáveis Seção 10.9 — sem % fabricado); `Testimonials` (estrutura; conteúdo 👤);
    `Faq` (`<details>` CSS, inclui "qual máquina escolher" usando `target`); `ContactBand` +
    `FloatingWhatsApp` (regra 14). **Teste:** reveal anima ao rolar; reduced-motion mostra tudo;
    flutuante some perto da ContactBand; FAQ abre sem JS.
11. **Analytics + consentimento de verdade.** Ligar `pixel.ts` ao `consent.ts`: após aceite, injetar
    `fbevents.js` adiado, `PageView`; `ViewContent` no detalhe; `Contact` nos cliques. **Teste:** com
    Pixel ID de teste, Meta Pixel Helper registra PageView só após aceite, ViewContent no detalhe,
    Contact (com content_name) ao clicar no WhatsApp.
12. **Passe de performance.** Otimizar imagens, `content-visibility`, conferir bundle/lazy, decidir LCP.
    **Teste:** **Lighthouse mobile ≥95 e desktop ≥95 em build de PRODUÇÃO com Pixel ativo**; CLS<0,1.
13. **QA responsivo + a11y + in-app.** Playwright (skill `webapp-testing`): screenshots
    **320/375/768/1024/1440**; sem scroll horizontal; foco/teclado; `prefers-reduced-motion`; **testar
    no in-app browser do Instagram** (ou UA equivalente / WebKit antigo) que o metal-shine NÃO some.
    **Teste:** prints OK; título visível no fallback.
14. **Build + preview + Git.** `npm run build && npm run preview`. Repo + `.gitignore` + remote
    `https://github.com/scheibe-369/lp-joao-primeira.git`. **Push só com aprovação.** **Cloudflare
    depois.** **Teste:** `dist/` limpo; preview == dev.

---

## 9. ANTI-PADRÕES (NÃO FAÇA)

1. Trocar Astro por Next/Vite-SPA/WordPress.
2. Adicionar React/Vue/Svelte/jQuery/GSAP/Framer-Motion (animação é CSS + observer vanilla).
3. Criar uma 3ª ilha de JS (filtro/FAQ/galeria são CSS-only; só `scroll-reveal` e `consent` são JS).
4. Emoji como ícone (use SVG inline).
5. Animar `width/height/top/left`; `background-position` só no `.metal-shine` (exceção controlada).
6. Hardcode de número de WhatsApp / Pixel ID (sempre env `PUBLIC_*`).
7. `<img>` sem dimensão, ou imagem de máquina em `public/` (perde otimização). Use `astro:assets` + `src/assets/`.
8. Google Fonts via `<link>` runtime; fonte não-subsetada; Bebas sem checar diacríticos.
9. Inter / tudo-centralizado / gradiente roxo genérico (AI-slop). Siga a Seção 10.
10. Lógica de domínio em `components/ui/` (vai em `modules/`).
11. Exibir preço.
12. Hover grudando em touch (use `@media (hover:hover)`).
13. **`.metal-shine` sem o fallback `@supports`** (some no in-app browser) ou sobre foto clara sem scrim.
14. Disparar `Lead` junto com `Contact`; disparar Pixel **antes do consentimento**; carregar `fbevents` no `<head>` bloqueando o LCP.
15. Exibir estatística não comprovada (ex: "90% satisfação") sem confirmação do cliente.
16. Deploy na Cloudflare agora; commit/push sem aprovação; commitar `.env`/`dist/`/`node_modules/`.

---

## 10. IDENTIDADE VISUAL E DESIGN SYSTEM

**Conceito:** "Maquinário de Precisão — Industrial Premium Dark". Navy escuro + amarelo elétrico
(único acento) + branco + cromado (metal-shine). Lê como equipamento industrial de alto valor.
**Dark-first, sem toggle.**

### 10.1 Paleta
```
PRIMARY (acento/CTA):  #febf02   — botões, CTA, badges, números, destaques
NAVY_BASE (fundo):     #051a3b
NAVY_DEEP (fundo 2):   #03122b   — (derivada) seções alternadas/profundidade
SURFACE (cards):       #0a2350   — (derivada)
TEXT:                  #ffffff
TEXT_MUTED:            #9fb0c9   — (derivada) >=4.5:1 sobre NAVY_BASE
BORDER:                rgba(255,255,255,0.08)
METAL_BASE / HIGHLIGHT: #b8901e / #fff3c4   — (derivadas) metal-shine ouro
SUCCESS #3fbf6a · WARNING #f0a500 · ERROR #e5484d
```
**Texto sobre amarelo = navy `#051a3b`** (nunca branco).

### 10.2 Tipografia
```
DISPLAY: "Bebas Neue", "Arial Narrow", sans-serif  (UPPERCASE)
BODY:    "Barlow", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif
H1 (Bebas):  clamp(36px, 8vw, 88px) / 400 / 0.95 / tracking 0.01em / UPPERCASE / overflow-wrap:anywhere
H2 (Bebas):  clamp(30px, 5vw, 56px) / 400 / 1.0 / UPPERCASE
H3 (Barlow): clamp(20px, 2.5vw, 28px) / 600 / 1.2
BODY (Barlow): 16–18px / 400 / 1.6
SMALL: 14px / 400 / 1.5   ·   LABEL/eyebrow: 12px / 600 / tracking 0.18em / UPPERCASE
```
*(H1 mínimo 36px p/ caber nomes em 320px; usar `shortName` no H1.)*

### 10.3 Spacing/grid/raio
```
BASE 4px · SCALE 4/8/12/16/24/32/48/64/96 · MAX_WIDTH 1200px
GRID catálogo: 1col → 2col(≥768) → 3col(≥1024) · GUTTER 16–24px
RADIUS cards 12px · botões 8px (CTA pode ser pill) · badges 6px
```

### 10.4 Componentes
- **ProductCard:** `SURFACE`, borda `BORDER`, raio 12px, `overflow:hidden`. Imagem (aspecto fixo) ·
  `Badge` amarelo · `shortName` (Barlow 600) · `tagline` · "Ideal para: target" · 2–4 specs (omite
  topSpeed null) · CTA "Ver Detalhes". Hover = `.card-glow` (só `@media hover`).
- **Botões:** Primário fundo `#febf02` + texto navy, peso 600, hover escurece + scale 1.02, min 44px,
  foco visível. WhatsApp = primário + ícone SVG. Secundário/ghost = borda branca translúcida.
- **Badge:** amarelo translúcido `rgba(254,191,2,.15)` texto amarelo, OU sólido amarelo + texto navy. Uppercase 12px.
- **Tabela de specs:** zebra sutil; <768px empilha (grid label/valor); `overflow-wrap:anywhere`.

### 10.5 Animações
```
DEFAULT 300ms cubic-bezier(0.22,1,0.36,1)
METAL_SHINE 5s (8s ≤1024px) — SÓ enquanto .is-visible; reduced-motion off
CARD_GLOW glow 900ms / linha 1200ms — só @media(hover)
SCROLL_REVEAL opacity+translateY 600ms ease-out, stagger 60–80ms, once
HOVER_LIFT CTA scale(1.02) 200ms
```
Assinatura (gastar a ousadia em 1 lugar): **metal-shine no hero + card-glow**. Resto, quieto.

### 10.6 Referências
Stellar (card→detalhe→CTA, badge de tier, catálogo sem preço) · Blips (hero benefit-first "comece a
faturar", CTA de verbo único, faixa de depoimentos, benefícios com ícones) · `metal-shine-effect.md`
/ `card-hover-glow-effect.md` do repo.

### 10.7 Modo
[x] **Dark only.**

### 10.8 Telas
| Tela | Propósito | Componentes | Navegação |
|---|---|---|---|
| `/` | Apresentar máquinas + converter | Header, Hero, (Por que DTF? opc.), Catalog, About, Trust, Testimonials, Faq, ContactBand, FloatingWhatsApp, Footer, CookieBanner | → `/maquinas/<slug>` ; → WhatsApp |
| `/maquinas/<slug>` | Vender 1 máquina | Header, MachineHero(galeria+CTA), MachineHighlights, MachineSpecs, ContactBand, FloatingWhatsApp, Footer | ← `/` ; → WhatsApp |
| `/politica-de-privacidade` | LGPD/Meta compliance | Header, conteúdo legal, Footer | ← `/` |
| `/404` | Erro amigável | mensagem + link p/ catálogo | → `/` |

### 10.9 COPY (texto literal — usar; claims 👤 marcados a confirmar)
**Hero** — eyebrow: "IMPRESSORAS DTF & UV-DTF". Headline (Bebas, shine em **FATURAR**):
"A MÁQUINA DTF CERTA PRA VOCÊ COMEÇAR A **FATURAR**". Subhead (Barlow): "Da iniciante A3 à industrial
de 5 cabeças — todas as impressoras DTF e UV-DTF da Brasil DTF num lugar só, com suporte, treinamento
e garantia." CTA primário "Falar no WhatsApp" · secundário "Ver máquinas".

**Por que DTF? (opcional, 3 ícones):** "Estampe qualquer tecido" · "Baixo custo por estampa, alta
margem" · "Comece em casa e escale pra produção".

**About ("Sobre", scroll-reveal):** bullets — "Revenda especializada em máquinas e insumos DTF/UV-DTF."
· "Suporte em português, em tempo real pelo WhatsApp." · "Treinamento incluso pra você operar desde
o dia 1." · "Garantia e pós-venda de verdade." · "Insumos abertos (tinta, pó, filme) — você não fica
refém de cartucho travado." · [👤 "X anos no mercado / X máquinas instaladas"]. Fecha com CTA WhatsApp.

**Trust (selos verificáveis — SEM % fabricado):** "Garantia + treinamento incluso" · "Suporte por
WhatsApp em tempo real" · "Insumos abertos" · "Parcelamento / condições facilitadas" [👤 confirmar] ·
[👤 "X anos de mercado" / nota Google / Reclame Aqui].

**FAQ (`<details>`):** "O que é DTF?" · "Preciso de experiência? (treinamento incluso)" · "Tem
garantia?" · "Vocês dão suporte? (WhatsApp)" · "Dá pra parcelar? [👤]" · "Qual a diferença de têxtil
pra UV-DTF? (têxtil = tecido; UV = superfícies rígidas / rótulos crystal)" · "Quais insumos preciso?
(abertos, a Brasil DTF fornece)". **+ "Qual máquina é pra você?"**: Começando → L8180 · Pequeno
negócio → XF-400PRO · Produção 60cm → 702E (C650SC/Z650-2) · Alto volume → C605 · UV/rótulos →
XF-420S / XF-450S.

**Testimonials:** estrutura pronta; **conteúdo 👤** (nome + cidade + foto/print do cliente). Não inventar.

### 10.10 Política de Privacidade (texto base, ajustar com o cliente)
Conteúdo mínimo: identificação do controlador (Brasil DTF, CNPJ 39.497.418/0001-91 [👤 confirmar]);
quais dados o Meta Pixel coleta (cookies `_fbp`, IP, eventos de navegação) e a finalidade (mensuração
de anúncios Meta); compartilhamento com a Meta Platforms; base legal (consentimento, LGPD Art. 7/9);
direitos do titular e canal de contato (WhatsApp/e-mail); como recusar (banner de cookies). Linkada
no Footer de todas as telas e no banner.

### 10.11 Registro de Desvios e Derivações
- **Paleta:** briefing deu 3 cores (#051a3b / #ffffff / #febf02). Derivadas p/ profundidade/cromado:
  NAVY_DEEP `#03122b`, SURFACE `#0a2350`, TEXT_MUTED `#9fb0c9`, METAL_BASE `#b8901e`, METAL_HIGHLIGHT
  `#fff3c4`, BORDER. *(Derivações técnicas, não novas cores de marca.)*
- **Fonte secundária:** Barlow (briefing delegou a escolha).
- **Features além do briefing (derivações técnicas/sugestões):** filtro Têxtil/UV (CSS-only),
  Trust/Selos, Testimonials, FAQ + guia "qual máquina", banner LGPD + Política de Privacidade
  (exigência legal/Meta), página 404, "Por que DTF?" (opcional). *(Filtro, Testimonials e FAQ são
  sugestões de conversão — confirmáveis; Política/consent são obrigatórios p/ tráfego pago.)*
- **Dados pesquisados (👤 confirmar):** CNPJ, dois números de WhatsApp, specs das máquinas.
- **Sem desvios destrutivos:** nenhum item do briefing foi descartado/trocado.

---

## 11. MANIFESTO DE SEGURANÇA — LER ANTES DE CODAR

### NÍVEL DE RISCO: **BAIXO–MÉDIO** — site estático, sem backend/DB/login. Risco em: (a) rastreamento
de terceiros (Pixel/LGPD), (b) direitos de imagem, (c) higiene de build/credenciais.

### SUPERFÍCIES: snippet de terceiro (Pixel), parâmetros de URL (hoje inexistentes), build/repo, assets.

### REGRAS IMPERATIVAS
**Credenciais/config:** NUNCA hardcode número/Pixel ID — env `PUBLIC_*`; `.env` no `.gitignore`
ANTES de qualquer commit. Sem segredo de servidor; se surgir, não usar `PUBLIC_`.
**Entradas:** sem formulário/entrada hoje (só WhatsApp). Se adicionar form depois: validar/sanitizar;
`encodeURIComponent` em qualquer parâmetro.
**Privacidade/LGPD:** Pixel é rastreamento → **banner de consentimento opt-in que gateia a injeção do
Pixel** (nada de `fbq` antes do aceite) + Política de Privacidade acessível (exigência também da
política de página de destino do Meta). Não enviar PII ao Pixel.
**Build/Deploy:** NÃO expor source maps em produção; NÃO commitar `dist/`/`node_modules/`/`.env`.
Em prod, se faltar `PUBLIC_META_PIXEL_ID`, emitir `warn` (não falhar silencioso). Cabeçalhos de
segurança recomendados na Cloudflare (CSP liberando só `connect.facebook.net` e `wa.me`, HSTS).
**Direitos de imagem:** usar fotos do cliente; imagens das páginas de origem só com autorização.

### CHECKLIST PRÉ-DEPLOY
- [ ] `.env` fora do repo; nada hardcoded
- [ ] Pixel injeta **só após consentimento** e com ID setado; evento **Contact** (com content_name) OK; PageView/ViewContent OK
- [ ] Banner de cookies + Política de Privacidade presentes e linkados
- [ ] Imagens com direito confirmado, otimizadas (AVIF/WebP), com dimensões (CLS<0,1)
- [ ] **Lighthouse ≥95 mobile e desktop em build de PRODUÇÃO com Pixel**; sem scroll horizontal 320→4K
- [ ] metal-shine visível no **in-app browser** (fallback `@supports`); sobre navy/scrim
- [ ] Sem source maps em prod; `.env`/`dist/`/`node_modules/` no `.gitignore`
- [ ] Sem commit/push sem aprovação; Cloudflare só na fase futura

---

## 12. CRITÉRIOS DE ACEITE
- 7 máquinas no catálogo (filtro Têxtil/UV) + página própria com specs + CTA cada.
- CTA → WhatsApp certo, mensagem pré-preenchida, `target=_blank`, dispara **Contact** (com content_name).
- Pixel só após consentimento; PageView em tudo; ViewContent no detalhe.
- **Lighthouse ≥95 (perf) mobile e desktop em build de PRODUÇÃO com Pixel**; CLS<0,1; sem scroll
  horizontal de **320px** a 4K; nome de máquina mais longo não estoura em 320px.
- metal-shine/card-glow/scroll-reveal funcionam, respeitam `prefers-reduced-motion`, e o título
  **não some no in-app browser** (fallback).
- Banner LGPD + Política de Privacidade presentes; nenhum claim não comprovado publicado.
- Roda em localhost (dev e preview). Sem segredo no repo. Pronto p/ GitHub (push sob aprovação). Cloudflare depois.

### Pendências 👤 (resolver antes do GO-LIVE, não antes do scaffold)
WhatsApp único · Pixel ID · domínio · fotos das máquinas · copy a confirmar (parcelamento,
depoimentos, métrica/anos, exibição do CNPJ) · texto final do "Sobre".
### Dívida 📌
Conversions API (CAPI) via Cloudflare Function + dedupe por `event_id` (pós-MVP).
