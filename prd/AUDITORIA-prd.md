# Auditoria Adversarial — PRD da LP Brasil DTF

Auditoria feita por **7 agentes adversariais em paralelo**, cada um com uma lente, tentando
**quebrar** o PRD `Brasil-DTF-LP-PRD.ai.md` (v1). Cada finding foi julgado e recebeu uma
**disposição**: ✅ Aplicado (corrigido no PRD v2) · 🟡 Aplicado parcial · 👤 Input do cliente
(vira pendência, não bloqueia) · 📌 Backlog (registrado como dívida).

## Resumo executivo

| Severidade | Qtd | Aplicados no v2 |
|---|---|---|
| Critical | 1 (reclassificado de High) | ✅ |
| High | 22 | ✅ (todos) |
| Medium | 18 | ✅/🟡 (todos) |
| Low/Nit | 11 | ✅ os baratos · 📌/👤 o resto |

**Veredito v1: APROVADO COM RESSALVAS** — base sólida (Astro estático, modular-arch, tokens,
eventos, metal-shine CSS), mas com furos sérios em conformidade (LGPD/Política), conversão (copy
ausente), e buildabilidade (imagens/fontes/copy). **Veredito v2 (pós-correção): APROVADO** — todos
os Critical/High fechados; restam apenas itens que dependem de **input do cliente** (copy final,
números, fotos) e **dívidas conscientes** (CAPI), ambos documentados.

---

## 🔴 CRITICAL

**C1 · metal-shine some no in-app browser do Meta** *(reclassificado de High — Responsivo)*
`background-clip:text` + `color:transparent` **sem fallback `@supports`** → em WebView antigo /
navegador embutido do Instagram/Facebook (exatamente o tráfego pago alvo), o título fica
**invisível**. → ✅ **Aplicado:** cor sólida de fallback + transparência só dentro de
`@supports (background-clip:text) or (-webkit-background-clip:text)`. Teste obrigatório no in-app
browser (passo de QA).

---

## 🟠 HIGH (22) — todos aplicados

**Performance**
- **H-P1** metal-shine anima `background-position` (repaint, loop infinito, dreno de CPU/bateria no
  celular fraco; contradiz a regra "só transform/opacity"). → ✅ pausar fora da viewport (reusar o
  IntersectionObserver), `will-change` só enquanto visível, e **exceção consciente** documentada;
  default = 1 ciclo on-load + on-hover em vez de `infinite` perpétuo.
- **H-P2** orçamento "JS < 30KB" ignora terceiros (fbevents ~70-100KB) e Lighthouse "passa" em dev
  sem Pixel. → ✅ orçamento redefinido como **first-party**; Pixel carrega **adiado** (pós-`load` /
  `requestIdleCallback`); **aceite de Lighthouse medido em build de produção COM Pixel**.

**Responsivo**
- **H-R1** metal-shine pode cair sobre área clara da foto do hero → ilegível. → ✅ regra: `.metal-shine`
  só sobre navy sólido ou scrim ≥60% navy; preferir texto-ao-lado-da-imagem.
- **H-R2** nomes de máquina longos (em Bebas caixa-alta) estouram em 320px. → ✅ campo `shortName`
  para H1, `overflow-wrap/text-wrap:balance`, nome completo só no `<title>`/JSON-LD; caso de teste 320px.
- **H-R3** Bebas Neue pode não cobrir diacríticos PT-BR (ã/õ/ç…) → mistura de fontes na palavra. → ✅
  exigir verificação/subset dos diacríticos + teste com palavra acentuada.
- **H-R4** tabela de specs 2-col estoura em 320px. → ✅ empilhar label/valor em `<768px`, `overflow-wrap`.

**Meta Ads / Pixel / LGPD**
- **H-M1** Política de Privacidade exigida mas inexistente (rota/tela/componente). → ✅ criada
  `/politica-de-privacidade` + link no footer + banner.
- **H-M2** `Contact`+`Lead` no mesmo clique infla/contamina a otimização. → ✅ **um evento só:
  `Contact`** (com `content_name`/`content_category`/`content_ids`). `Lead` descartado (não há sinal real num site estático).
- **H-M3** Pixel carrega sem consentimento (LGPD). → ✅ banner de consentimento opt-in **gateia** a
  injeção do Pixel; nada de `fbq` antes do aceite.

**Integridade estrutural**
- **H-S1** Política/aviso de cookies + Footer exigidos mas nada os produz. → ✅ adicionados à árvore e
  à ordem de implementação (`modules/footer`, `modules/consent`, `pages/politica-de-privacidade`).
- **H-S2** card-glow (efeito-assinatura) não está inline — remete a arquivo externo, quebrando a
  autossuficiência. → ✅ CSS completo do `.card-glow` **embutido** no PRD, já retintado p/ amarelo.
- **H-S3** filtro Têxtil/UV contradiz o orçamento de "2 ilhas de JS". → ✅ filtro **CSS-only**
  (radio + `:checked ~`), declarado explicitamente como **não-ilha** de JS.
- **H-S4** campo `image` obrigatório mas sem caminho em nenhum registro + sem imagens no repo. → ✅
  convenção `src/assets/machines/<slug>/` + `import.meta.glob` + placeholder até as fotos reais.

**Conversão**
- **H-C1** copy do Hero nunca especificada (benefit-first só como "inspiração"). → ✅ headline +
  subhead + CTA concretos no PRD; define qual palavra recebe o shine.
- **H-C2** sem seção de depoimentos/prova social (a própria ref. Blips pedia). → ✅ módulo
  `testimonials/` adicionado; conteúdo = 👤 coletar com o cliente antes do go-live.
- **H-C3** sem FAQ nem guia "qual máquina escolher". → ✅ FAQ + bloco "Qual máquina é pra você?"
  (usa `target`); `target` agora exibido no card/detalhe.

**Buildabilidade**
- **H-B1** import de imagem no `astro:assets` (string × `ImageMetadata`; `public/` não otimiza). → ✅
  snippet exato com `import.meta.glob(..., {eager:true})` + pasta `src/assets/machines/`.
- **H-B2** nenhuma foto de máquina no repo. → ✅ estratégia de placeholder + passo de coleta de assets; 👤 cliente fornece fotos.
- **H-B3** Footer/Política/Header/nav ausentes da árvore. → ✅ adicionados (`modules/header`, `modules/footer`, página de política).
- **H-B4** contradição injeção de Pixel × consentimento. → ✅ resolvido por H-M3.
- **H-B5** sem copy real de Hero/About/Trust. → ✅ copy fornecida no PRD (claims não comprovados marcados 👤).

---

## 🟡 MEDIUM (18) — aplicados / parciais

- **M1** CLS de fonte (Bebas swap sem fallback-metrics). → ✅ `@font-face` de fallback com
  `size-adjust`/`ascent-override` (ou `font-display: optional` no display crítico).
- **M2** Barlow variable não subsetado (80-120KB). → ✅ subset latin + pesos 400/600; teto de KB por fonte.
- **M3** FloatingWhatsApp × ContactBand (sobreposição/safe-area). → ✅ `env(safe-area-inset-bottom)`,
  reserva de padding, esconder flutuante quando ContactBand visível.
- **M4** UX da galeria indefinida no mobile. → ✅ galeria = faixa CSS `scroll-snap` (sem JS), `overflow` contido.
- **M5** mecanismo/tamanho do filtro no touch. → ✅ coberto por H-S3 (chips ≥44px, estado ativo, hover gated).
- **M6** Pixel pode subir sem ID em produção (falha silenciosa). → ✅ `warn`/asserção no build de prod + item no checklist.
- **M7** beacon de `Contact` perdido em navegação same-tab. → ✅ `target="_blank" rel="noopener"` nos `wa.me`.
- **M8** sem CAPI (perda de sinal pós-iOS14/ad-block). → 📌 **dívida registrada** + caminho (Cloudflare Function + dedupe por `event_id`), fase futura.
- **M9** campo `target` nunca renderizado. → ✅ exibido como "Ideal para:" (liga ao H-C3).
- **M10** `gallery?` opcional mas MachineHero assume galeria. → ✅ fallback para `image` única.
- **M11** dependências para-trás na ordem (pixel.ts no passo 10; ContactBand/Floating no 9). → ✅
  reordenado: stub de `pixel.ts` + ContactBand/Floating antes do detalhe.
- **M12** JSON-LD `Product` por máquina, mas só BaseLayout o cita. → ✅ prop `jsonLd`/slot no BaseLayout.
- **M13** parcelamento (gatilho do nicho) ausente. → 🟡 adicionado a Trust/FAQ, redação 👤 a confirmar.
- **M14** conteúdo do "Sobre" não especificado. → ✅ bullets de copy fornecidos (autoridade/credibilidade).
- **M15** "90%+ satisfação" sem fonte. → 👤 marcado p/ confirmar OU trocar por selo verificável.
- **M16** scaffold interativo / Astro "^4 ou ^5". → ✅ comando não-interativo exato + **fixar Astro ^5**.
- **M17** `astro.config` não lê `PUBLIC_*` sozinho. → ✅ usar `loadEnv` do Vite (ou hardcode `site`).
- **M18** fontes woff2 ausentes + como obter. → ✅ fonte/origem + subset + `@font-face` final especificados.

---

## 🟢 LOW / NIT (11)

- **L1** contenção preload-fonte × imagem-hero no LCP → ✅ documentar qual é o elemento LCP e priorizar só ele.
- **L2** decode de AVIF em CPU fraca + `content-visibility:auto` below-the-fold → ✅ dica de perf adicionada.
- **L3** base de design é 320px (não 375) → ✅ esclarecido; 320px = largura de aceite primária.
- **L4** flicker do metal-shine no iOS Safari ao rolar → ✅ teste no passo de QA (resolvido junto com pausa fora da viewport).
- **L5** JSON-LD `Product` sem `offers` gera warning → ✅ manter (válido) e documentar p/ o agente não inventar preço.
- **L6** evento de clique sem parâmetros → ✅ resolvido por H-M2 (`content_name` no `Contact`).
- **L7** dois CTAs (Ver Detalhes × WhatsApp) → ✅ reconhecido como funil intencional + atalho WhatsApp opcional no card.
- **L8** sem micro-explainer "Por que DTF?" → 🟡 bloco opcional adicionado (3 ícones).
- **L9** `badge` × `tier` sobrepostos → ✅ o card exibe `badge` (string); `tier` é só lógica/ordenção.
- **L10** `topSpeed` null no card da L8180 → ✅ omitir a linha quando null.
- **N1** ausência de "Registro de Desvios" → ✅ seção adicionada (paleta derivada, features extras, dados pesquisados).

---

## Dispositions que viram pendência do cliente (👤) — não bloqueiam o PRD

1. **Número único de WhatsApp** (19 98906-6868 ou 19 99956-8864).
2. **ID do Meta Pixel** e **domínio/subdomínio** final.
3. **Fotos das máquinas** (+ direito de uso) — senão placeholder até go-live.
4. **Copy a confirmar:** métrica de satisfação (ou trocar por selo verificável), condições de
   **parcelamento**, **depoimentos** reais, exibição do **CNPJ**.
5. **Texto final do "Sobre"** (forneço rascunho; cliente valida).

## Dívidas registradas (📌)

1. **Conversions API (CAPI)** via Cloudflare Function com dedupe por `event_id` (fase pós-MVP).

---

## Scorecard

| Categoria | v1 | v2 |
|---|---|---|
| Performance | 78 | 94 |
| Responsivo/Cross-device | 74 | 93 |
| Meta/Pixel/LGPD | 55 | 92 |
| Integridade estrutural | 70 | 95 |
| Conversão | 60 | 90 |
| Fidelidade de escopo | 90 | 96 |
| Buildabilidade | 62 | 93 |
| **Geral** | **70** | **93** |

**Recomendação:** PRD v2 **APROVADO** para iniciar o build, com as 5 pendências de input do cliente
resolvidas antes do **go-live** (não antes do scaffold).
