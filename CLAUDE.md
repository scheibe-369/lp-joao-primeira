# CLAUDE.md — Landing Page Brasil DTF

Instruções de como agir NESTE projeto. Valem para qualquer agente de código que trabalhar aqui.
Complementam (não substituem) o CLAUDE.md global do usuário.

> **Antes de codar, leia o PRD:** `prd/Brasil-DTF-LP-PRD.ai.md` (fonte de verdade técnica) e, se
> precisar de contexto de negócio, `prd/Brasil-DTF-LP-PRD.docx`. O relatório de auditoria está em
> `prd/AUDITORIA-prd.md`.

---

## 1. O que é este projeto (em uma frase)

Uma **landing page-portfólio estática** das impressoras DTF da **Brasil DTF**, para **tráfego pago
no Meta Ads**, que converte em **conversa no WhatsApp**. Não é e-commerce (sem carrinho/checkout/preço).

---

## 2. Regras de ouro (invioláveis)

1. **PERFORMANCE é prioridade nº 1.** Toda decisão serve à velocidade. Meta: **Lighthouse ≥ 95
   mobile e desktop**, LCP < 2,0s (4G), CLS < 0,1, JS enviado < 30KB.
2. **Não pode quebrar em NENHUM device.** Perfeita de 320px a 4K, celular fraco incluso. Sem scroll
   horizontal. Testar em 320/375/768/1024/1440 antes de dizer "pronto".
3. **NÃO fazer deploy na Cloudflare agora.** Fluxo: **localhost → GitHub
   (`scheibe-369/lp-joao-primeira`) → Cloudflare só depois** (integração GitHub, não `wrangler` direto).
4. **Não commitar/pushar sem aprovação explícita do usuário.** (Regra absoluta do CLAUDE.md global.)
5. **Stack é fixa** (Seção 4). Se algo der problema, **reporte** — não troque a tecnologia sozinho.
6. **Nada de placeholder/"temporário" que vira permanente.** Achar a causa raiz (CLAUDE.md global).

---

## 3. Fluxo de trabalho (plan-first)

- Tarefa não-trivial (3+ passos)? Entrar em **plan mode** e escrever o plano antes.
- Seguir a **ordem de implementação** da Seção 8 do `*.ai.md` (por dependência; cada passo tem teste).
- Provar que funciona antes de marcar como feito (rodar, screenshot, Lighthouse). Verificação não é opcional.
- Após correção do usuário: anotar o padrão em `tasks/lessons.md`.

---

## 4. Stack (NÃO-NEGOCIÁVEL)

**Astro (`output: 'static'`) + Tailwind CSS + TypeScript (`strict`)** · imagens via `astro:assets`
(+ sharp) · `@astrojs/sitemap` · fontes **self-hosted woff2** (Bebas Neue + Barlow) · ícones **SVG
inline** (Lucide), nunca emoji. Hospedagem futura: Cloudflare Pages.

**Proibido:** Next.js/Vite-SPA/WordPress no lugar do Astro; React/Vue/Svelte/jQuery/GSAP/Framer-Motion
como runtime (a página é estática — animação é CSS + observers vanilla). **Ilhas de JS permitidas
(só estas duas):** `scroll-reveal.ts` e `consent.ts` (banner LGPD + carregador do Pixel). O **filtro
do catálogo, o FAQ e a galeria são CSS-only** (radios/`<details>`/`scroll-snap`) — não são ilha. O
`fbevents.js` é terceiro e carrega **adiado, só após consentimento**. **Orçamento de JS first-party
< 30KB** (não conta o Pixel).

---

## 5. Arquitetura modular (skill `modular-arch` — obrigatória)

**Feature-Sliced.** Cada feature é uma vertical em `src/modules/<feature>/`. Em `src/components/ui/`
só primitivos 100% genéricos (Button, Badge, Section, Container) — **zero conhecimento de domínio**
(máquina/DTF/WhatsApp). Se um componente renderiza máquina, lê specs ou monta CTA de WhatsApp, ele
vai em `modules/`. Ver árvore na Seção 3 do `*.ai.md`. **Nunca** poluir pastas globais com lógica de
feature.

**Fonte única de dados:** `src/data/machines.ts` (7 máquinas tipadas) alimenta o card E a página de
detalhe. Zero duplicação. Páginas `/maquinas/[slug]` via `getStaticPaths()`.

---

## 6. Performance — regras concretas

- Imagens: **sempre** `astro:assets` (`<Image/>`) com fotos em **`src/assets/`** (NUNCA `public/` —
  perde otimização). Em `machines.ts` resolver via `import.meta.glob(..., {eager:true})` → `ImageMetadata`.
  AVIF/WebP, `srcset`, `width`/`height` explícitos (CLS=0). Hero `eager` + `fetchpriority="high"`
  (LCP = imagem do hero); resto `loading="lazy"`; `content-visibility:auto` abaixo da dobra.
- Animação: **só `transform`/`opacity`** (nunca `width/height/top/left`). **Exceção única:** o
  `.metal-shine` anima `background-position` — por isso é **pausado fora da viewport** (observer) e
  `will-change` só fica ativo enquanto `.is-visible`. Tudo com guarda `prefers-reduced-motion`.
- Fontes: `@font-face` self-hosted **subsetadas (latin)**; Barlow só pesos 400/600 (~30KB cada);
  Barlow `font-display: swap`, **Bebas `optional` ou `swap` com fallback ajustado** (`size-adjust`/
  `ascent-override` p/ não gerar CLS); **verificar diacríticos PT-BR na Bebas**; **preload só** da
  Bebas. Sem Google Fonts em runtime.
- **Lighthouse ≥95 medido em build de PRODUÇÃO com o Pixel ativo** (não em dev sem Pixel — passa falso).

---

## 7. Efeitos visuais (reaproveitar os specs do repo)

- `metal-shine-effect.md` → `.metal-shine` no `globals.css`, **retintado para a marca** (ouro
  `#b8901e→#fff3c4→#b8901e` default). **Obrigatório:** cor sólida de fallback + transparência só
  dentro de `@supports (background-clip:text)` (senão o título **some no in-app browser do
  Instagram/Facebook** — o tráfego pago!). Só sobre navy sólido ou scrim ≥60% navy. Pausar fora da viewport.
- `card-hover-glow-effect.md` → hover dos `ProductCard`, **retintado roxo→amarelo `#febf02`**, dentro
  de `@media (hover:hover)` (não grudar em touch).
- Scroll-reveal no "Sobre" (e seções): `[data-reveal]` + IntersectionObserver (`scroll-reveal.ts`),
  600ms ease-out, stagger 60–80ms, `once`, reduced-motion = revela imediato.
- Assinatura visual (gastar a ousadia em 1 lugar): metal-shine no hero + card-glow. Resto, quieto.

---

## 8. Identidade da marca

- Cores: `#051a3b` (navy base) · `#febf02` (amarelo, CTA/acento) · `#ffffff` (texto). Derivados:
  `#03122b` (navy deep) · `#0a2350` (surface) · `#9fb0c9` (texto muted). **Dark-first**, sem toggle.
- **Texto sobre amarelo = navy `#051a3b`** (nunca branco — contraste).
- Tipografia: **Bebas Neue** (display, UPPERCASE) + **Barlow** (corpo/UI, variable). Escala na
  Seção 10.2 do `*.ai.md`.
- Logo: `logo/BrasilDTF logo.png` (otimizar p/ WebP; usar SVG se houver).

---

## 9. WhatsApp & Meta Pixel

- WhatsApp: sempre via `lib/whatsapp.ts` → `https://wa.me/${PUBLIC_WHATSAPP_NUMBER}?text=...` com
  mensagem pré-preenchida da máquina. Link com **`target="_blank" rel="noopener"`** (mantém a LP viva
  p/ o beacon do Pixel). CTA: **"Falar no WhatsApp"**.
- Pixel: `PUBLIC_META_PIXEL_ID` via env; injeta **só após consentimento** E se ID preenchido; carrega
  **adiado** (`requestIdleCallback`/pós-load). Eventos: `PageView` (após consentimento), `ViewContent`
  (detalhe, com `content_name`), **`Contact`** no clique do WhatsApp (com `content_name`). **NÃO
  disparar `Lead`** (clique não é lead qualificado — inflaria a métrica). Em prod sem ID → `console.warn`.
- **LGPD:** banner de consentimento **opt-in que gateia a injeção do Pixel** (nada de `fbq` antes do
  aceite) + Política de Privacidade (`/politica-de-privacidade`) linkada no footer/banner (exigência
  também da política de página de destino do Meta).

---

## 10. Variáveis de ambiente

Em `.env` (no `.gitignore`; ver `.env.example`): `PUBLIC_WHATSAPP_NUMBER`, `PUBLIC_META_PIXEL_ID`,
`PUBLIC_SITE_URL`. `PUBLIC_*` é exposto ao cliente de propósito (pixel/whatsapp são públicos). Não há
segredo de servidor; se surgir, **não** usar prefixo `PUBLIC_`.

---

## 11. Anti-padrões (NÃO faça)

Trocar a stack · adicionar framework JS de runtime · 3ª ilha de JS (filtro/FAQ/galeria são CSS-only) ·
emoji como ícone · animar layout (`width/height/top/left`) · `metal-shine` sem fallback `@supports` ou
sobre foto clara · `<img>` sem dimensão / imagem de máquina em `public/` · Google Fonts via `<link>` /
fonte não-subsetada · Inter / tudo-centralizado / gradiente roxo genérico (AI-slop) · lógica de domínio
em `components/ui/` · exibir preço · hover grudando em touch · hardcode de número/Pixel ID · disparar
`Lead` ou Pixel **sem consentimento** · publicar claim não comprovado (ex: "90% satisfação") ·
commitar `.env`/`dist/`/`node_modules/` · deploy na Cloudflare agora · commit/push sem aprovação.

---

## 12. Verificação antes de "pronto"

- `npm run build` limpo; `npm run preview` == dev.
- Lighthouse **≥95** perf (mobile + desktop) **em build de PRODUÇÃO com o Pixel ativo**; CLS<0,1.
- Playwright (skill `webapp-testing`): screenshots em **320**/375/768/1024/1440, sem scroll horizontal,
  foco visível, teclado, reduced-motion; **título mais longo (#4) não estoura em 320px**.
- **In-app browser:** o `.metal-shine` NÃO some (fallback `@supports`) no navegador do Instagram/FB.
- Pixel: PageView + ViewContent (detalhe) + **Contact** (clique WhatsApp) conferidos no Meta Pixel
  Helper, e **só após aceitar o consentimento**.
- Banner LGPD + Política de Privacidade presentes; nenhum claim não comprovado publicado.
- Checklist de segurança/LGPD da Seção 11 do `*.ai.md` passa.
