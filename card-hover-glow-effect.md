# Card Hover — Soft Glow + Bottom-Line Fill

A self-contained guide to the hover effect used on the **"O QUE CONSTRUÍMOS"** (services
overview) cards.

On hover, each card:

1. **Lights its border** (faint white → purple).
2. **Tints its background** with a barely-there purple wash.
3. Casts a **big, soft outer glow** (a wide-spread, low-opacity `box-shadow`).
4. Fades in a **radial glow that rises from just below the card** (a gradient overlay).
5. **Glows the icon box** (border + bg + its own little shadow).
6. Turns the **top-right index number** purple.
7. Fills a **thin line along the bottom edge, left → right**.

Everything runs on slow, premium-feeling easing (`900ms` for the glows, `1200ms` for the line)
with a single shared timing function: `cubic-bezier(0.22, 1, 0.36, 1)`.

> Source of truth in this repo: `components/sections/services-overview.tsx` → the `ServiceCard`
> function (lines ~76–110). The plain-CSS version below is a faithful 1:1 translation.

---

## 1. How it works

### The `group` / `group-hover` pattern

In Tailwind, you mark the card container with the `group` class. Children then react to the
**parent's** hover state with `group-hover:*` utilities:

```html
<div class="group ...">
  <div class="... group-hover:opacity-100">…the glow…</div>
  <div class="... group-hover:scale-x-100">…the bottom line…</div>
</div>
```

There is no JavaScript. `group-hover` compiles down to a CSS descendant selector driven by the
parent's `:hover`. The vanilla-CSS equivalent is literally:

```css
.card:hover .card-line { transform: scaleX(1); }
.card:hover .card-glow { opacity: 1; }
```

So one `:hover` on the card drives **every** sub-animation at once — they all start together and
share the same easing, which is what makes the whole thing read as a single, cohesive motion.

### `overflow-hidden` clips the glow & line to the rounded card

The radial-glow overlay is `absolute inset-0` (it fills the whole card) and the bottom line is
`inset-x-0 bottom-0` (full width). Both would spill past the card's rounded corners. The container's
`overflow: hidden` (`rounded-xl` + `overflow-hidden`) clips them cleanly to the 12px corner radius,
so the line and glow never poke out of the rounded rectangle.

### The bottom line uses `scaleX`, not `width`

The line is a 1px-tall element spanning the full width, but it starts collapsed:

```css
transform: scaleX(0);
transform-origin: left;   /* collapse point is the LEFT edge */
```

On hover it animates to `scaleX(1)`. Because `transform-origin` is `left`, it grows from the left
edge to the right — a "drawing-in" feel.

Why `scaleX` instead of animating `width`?

- **`transform` is GPU-composited** — it doesn't trigger layout (reflow) or paint on every frame.
- Animating `width` would force the browser to re-lay-out the element each frame (expensive, janky).
- `transform` + `opacity` are the two "free" properties to animate; everything here sticks to them
  (plus `box-shadow`/`background-color`, which are paint-only and acceptable for a one-shot hover).

The full-width element is always 100% wide; we only ever scale it. No reflow, buttery on any device.

### The soft glow = `box-shadow` + a radial-gradient overlay

Two layers stack to make the glow feel deep and directional:

1. **Outer glow — `box-shadow`:** `0 0 80px -20px rgba(139,92,246,0.55)`.
   The `80px` blur with a `-20px` spread (negative = shrink the shadow box) gives a wide, soft,
   tight-to-the-card halo at low alpha. Big & faint reads as "glow", not "drop shadow".

2. **Inner radial glow — gradient overlay:** an `absolute inset-0` div whose background is
   `radial-gradient(130% 80% at 50% 110%, rgba(139,92,246,0.28) 0%, rgba(139,92,246,0) 65%)`.
   The center is at `50% 110%` — i.e. horizontally centered but **10% below the card's bottom
   edge** — so the brightest part of the gradient sits off-screen below and only its upper falloff
   bleeds up into the card. That's what makes the glow look like it's **rising from the bottom**.
   It's `opacity: 0` at rest and `opacity: 1` on hover, fading via opacity (cheap).

### The slow easing is the "premium" feel

Durations are deliberately long — `900ms` for the glows/colors, `1200ms` for the line — and all
share `cubic-bezier(0.22, 1, 0.36, 1)` (a strong "ease-out": fast start, long gentle settle).
Short/linear transitions feel snappy and cheap; this long ease-out makes the glow *bloom* and the
line *draw* in a way that feels expensive and intentional. The easing is the effect.

---

## 2. Ready-to-use implementations

### A. Plain HTML / CSS

The vanilla equivalent of `group-hover`: a `.card:hover` drives `.card-glow`, `.card-line`, the icon
and the number via descendant selectors. Hex values match the design tokens.

```html
<article class="card">
  <div class="card-glow" aria-hidden="true"></div>
  <span class="card-num">01</span>
  <div class="card-body">
    <div class="card-icon" aria-hidden="true">
      <!-- any 22x22 icon / svg -->
    </div>
    <h3>Custom Development</h3>
    <p>Software sob medida, construído do zero para o seu fluxo.</p>
  </div>
  <div class="card-line" aria-hidden="true"></div>
</article>
```

```css
:root {
  --purple-primary: #8B5CF6;        /* rgb(139,92,246) */
  --purple-deep:    #6B2FBF;
  --purple-glow:    #4A1F8C;
  --text-secondary: #A0A0A0;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
}

/* ---- the card ---- */
.card {
  position: relative;
  height: 100%;
  overflow: hidden;                            /* clips glow + line to rounded corners */
  border-radius: 12px;                         /* rounded-xl */
  border: 1px solid rgba(255, 255, 255, 0.06);
  background-color: rgba(255, 255, 255, 0.015);
  padding: 40px;                               /* p-10 (use 32px for p-8) */
  transition: background-color 900ms var(--ease),
              border-color     900ms var(--ease),
              box-shadow       900ms var(--ease);
}

/* ---- radial glow overlay (rises from 50% 110%, just below the card) ---- */
.card-glow {
  pointer-events: none;
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 900ms var(--ease);
  background: radial-gradient(130% 80% at 50% 110%,
              rgba(139, 92, 246, 0.28) 0%,
              rgba(139, 92, 246, 0)    65%);
}

/* ---- top-right index number ---- */
.card-num {
  position: absolute;
  top: 24px;
  right: 24px;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 10px;
  letter-spacing: 0.25em;
  color: rgba(160, 160, 160, 0.4);             /* text-secondary / 40% */
  transition: color 900ms var(--ease);
}

.card-body { position: relative; }             /* keep content above the glow overlay */

/* ---- icon box ---- */
.card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;                                 /* h-11 w-11 */
  height: 44px;
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid rgba(139, 92, 246, 0.25);
  background-color: rgba(139, 92, 246, 0.08);
  color: var(--purple-primary);
  transition: border-color      900ms var(--ease),
              background-color   900ms var(--ease),
              box-shadow         900ms var(--ease);
}
.card-icon svg { width: 22px; height: 22px; display: block; }

.card h3 { margin: 0 0 12px; font-size: 20px; font-weight: 500; color: #fff; }
.card p  { margin: 0; font-size: 14px; line-height: 1.625; color: var(--text-secondary); }

/* ---- the bottom line: collapsed at the left edge, grows right on hover ---- */
.card-line {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 1px;                                 /* h-px */
  transform: scaleX(0);
  transform-origin: left;
  background: linear-gradient(to right,
              var(--purple-primary),
              var(--purple-primary),
              rgba(107, 47, 191, 0.4));         /* purple-deep / 40% */
  transition: transform 1200ms var(--ease);
}

/* ---- HOVER STATE (vanilla equivalent of group-hover) ---- */
@media (hover: hover) {                         /* don't stick on touch devices */
  .card:hover {
    border-color: rgba(139, 92, 246, 0.5);
    background-color: rgba(139, 92, 246, 0.05);
    box-shadow: 0 0 80px -20px rgba(139, 92, 246, 0.55);
  }
  .card:hover .card-glow { opacity: 1; }
  .card:hover .card-num  { color: rgba(139, 92, 246, 0.6); }
  .card:hover .card-icon {
    border-color: rgba(139, 92, 246, 0.6);
    background-color: rgba(139, 92, 246, 0.2);
    box-shadow: 0 0 30px rgba(139, 92, 246, 0.4);
  }
  .card:hover .card-line { transform: scaleX(1); }
}

@media (prefers-reduced-motion: reduce) {
  .card, .card-glow, .card-num, .card-icon, .card-line { transition: none; }
}
```

### B. React + Tailwind (matches this codebase)

A trimmed `ServiceCard` — these are the **real class strings** from
`components/sections/services-overview.tsx`. Note `group` on the container and `group-hover:*`
on each piece.

```tsx
function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <div className="group relative h-full overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.015] p-8 transition-[background-color,border-color,box-shadow] duration-[900ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:border-purple-primary/50 hover:bg-purple-primary/[0.05] hover:shadow-[0_0_80px_-20px_rgba(139,92,246,0.55)] md:p-10">
      {/* radial glow overlay — fades in on hover, rises from 50% 110% */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[900ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(130% 80% at 50% 110%, rgba(139,92,246,0.28) 0%, rgba(139,92,246,0) 65%)",
        }}
      />

      {/* top-right index number */}
      <span className="absolute right-6 top-6 font-mono text-[10px] tracking-[0.25em] text-text-secondary/40 transition-colors duration-[900ms] group-hover:text-purple-primary/60">
        0{index + 1}
      </span>

      {/* content sits above the glow via relative */}
      <div className="relative">
        <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-purple-primary/25 bg-purple-primary/[0.08] transition-all duration-[900ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:border-purple-primary/60 group-hover:bg-purple-primary/20 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]">
          <service.icon className="h-[22px] w-[22px] text-purple-primary" />
        </div>
        <h3 className="mb-3 text-lg font-medium text-white md:text-xl">{service.title}</h3>
        <p className="text-sm leading-relaxed text-text-secondary">{service.description}</p>
      </div>

      {/* bottom line — scaleX(0)→scaleX(1) from the left */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-purple-primary via-purple-primary to-purple-deep/40 transition-transform duration-[1200ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
      />
    </div>
  );
}
```

Token reference (defined in `app/globals.css`):

| Token             | Hex / value        | RGB                |
| ----------------- | ------------------ | ------------------ |
| `--purple-primary`| `#8B5CF6`          | `rgb(139,92,246)`  |
| `--purple-deep`   | `#6B2FBF`          | `rgb(107,47,191)`  |
| `--purple-glow`   | `#4A1F8C`          | `rgb(74,31,140)`   |
| `--text-secondary`| `#A0A0A0`          | `rgb(160,160,160)` |
| card border       | `rgba(255,255,255,0.06)` | —            |
| card background   | `rgba(255,255,255,0.015)` | —           |

---

## 3. Customize

### Swap the color (purple → silver / neutral)

Change the accent everywhere the purple appears. For a cool silver/neutral look:

```css
/* line */            background: linear-gradient(to right, #ffffff, #ffffff, #a1a1aa);
/* outer glow */      box-shadow: 0 0 80px -20px rgba(255,255,255,0.18);
/* radial overlay */  background: radial-gradient(130% 80% at 50% 110%,
                         rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 65%);
/* border on hover */ border-color: rgba(255,255,255,0.35);
/* icon glow */       box-shadow: 0 0 30px rgba(255,255,255,0.25);
```

Tip: keep neutral/white glows at **lower alpha** than the purple ones (white reads much brighter),
e.g. `0.18` instead of `0.55`. In Tailwind, swap `purple-primary`/`purple-deep` for
`zinc-50`/`zinc-400` and dial the arbitrary-value alphas down.

### Speed

The two knobs are the `900ms` (glow/colors) and `1200ms` (line) durations. Make it snappier with
`400ms`/`600ms`, or even slower/dreamier with `1200ms`/`1600ms`. Keep the line **slightly slower
than** the glow so the line finishes drawing just after the glow blooms — that stagger reads as
deliberate. The shared `cubic-bezier(0.22,1,0.36,1)` is what gives the soft settle; swapping it for
`ease` or `linear` removes most of the "premium" feel.

### Glow intensity

- **Outer glow:** tune the `box-shadow` blur/spread/alpha — `0 0 80px -20px rgba(…,0.55)`. Bigger
  blur (`100px`) or higher alpha (`0.7`) = stronger halo; more-negative spread (`-30px`) tightens it.
- **Radial overlay:** raise the gradient's center alpha (`0.28` → `0.4`) for a more visible inner
  bloom, or push the stop (`65%`) outward to spread it further up the card.

### Line thickness

`height: 1px` (`h-px`) → `height: 2px` (Tailwind `h-0.5`) for a bolder underline. Heights of 1–3px
look best; beyond that it stops reading as a "line".

### Direction of the line fill

`transform-origin` controls where the line grows from:

- `left`  → draws **left → right** (the default here).
- `right` → draws **right → left**.
- `center`→ grows **outward from the middle** to both edges (`origin-center` in Tailwind).

Only the origin changes; the `scaleX(0) → scaleX(1)` animation stays identical.

---

## 4. Accessibility & performance notes

- **Transform/opacity-first.** The line uses `transform: scaleX()` and the glows use `opacity` /
  `box-shadow` — `transform` and `opacity` are GPU-composited and never trigger layout. The line
  animation in particular causes **zero reflow**. Avoid animating `width`/`height`/`top`/`left` for
  the same effect; those are expensive.
- **`overflow: hidden` clips cheaply.** It keeps the full-bleed glow overlay and the full-width line
  inside the rounded corners without extra masks or clip-paths.
- **Wrap hover styling in `@media (hover: hover)`.** Touch devices emulate `:hover` on tap and can
  leave a card **stuck** in the hovered (glowing, line-filled) state until you tap elsewhere. Gating
  the hover rules behind `@media (hover: hover)` (and optionally `pointer: fine`) means only real
  pointers get the effect. (Tailwind's `hover:`/`group-hover:` variants already do this when
  `hoverOnlyWhenSupported` is on — the default in modern Tailwind.)
- **Respect `prefers-reduced-motion`.** Users who request reduced motion shouldn't get the long
  bloom/draw. Disable the transitions (they still get the final hover *state*, just instantly):

  ```css
  @media (prefers-reduced-motion: reduce) {
    .card, .card-glow, .card-num, .card-icon, .card-line { transition: none; }
  }
  ```

- **Decorative only.** The glow, number, line and icon box are purely visual — mark them
  `aria-hidden` (the React version does) so screen readers skip them. Hover is not the only way to
  perceive the card's content; the text is always visible.

---

## 5. Complete standalone demo (copy-paste)

Save as `card-hover-demo.html` and open in a browser. Black page, 3-column grid; hover a card to see
the soft purple glow bloom and the bottom line draw in.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Card Hover Glow Effect — Demo</title>
<style>
  :root {
    --purple-primary: #8B5CF6;
    --purple-deep: #6B2FBF;
    --purple-glow: #4A1F8C;
    --text-secondary: #A0A0A0;
    --ease: cubic-bezier(0.22, 1, 0.36, 1);
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; background: #050505; color: #fff;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased; padding: 80px 24px;
  }
  .wrap { max-width: 1120px; margin: 0 auto; }
  .eyebrow {
    font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 12px;
    letter-spacing: 0.2em; text-transform: uppercase; color: var(--purple-primary); margin: 0 0 20px;
  }
  h1 { font-size: 44px; font-weight: 300; line-height: 0.95; margin: 0 0 48px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  @media (max-width: 860px) { .grid { grid-template-columns: 1fr; } }

  .card {
    position: relative; height: 100%; overflow: hidden; border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.06); background-color: rgba(255,255,255,0.015);
    padding: 40px;
    transition: background-color 900ms var(--ease), border-color 900ms var(--ease),
                box-shadow 900ms var(--ease);
  }
  .card-glow {
    pointer-events: none; position: absolute; inset: 0; opacity: 0;
    transition: opacity 900ms var(--ease);
    background: radial-gradient(130% 80% at 50% 110%,
                rgba(139,92,246,0.28) 0%, rgba(139,92,246,0) 65%);
  }
  .card-num {
    position: absolute; top: 24px; right: 24px;
    font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 10px;
    letter-spacing: 0.25em; color: rgba(160,160,160,0.4); transition: color 900ms var(--ease);
  }
  .card-body { position: relative; }
  .card-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 44px; height: 44px; margin-bottom: 24px; border-radius: 12px;
    border: 1px solid rgba(139,92,246,0.25); background-color: rgba(139,92,246,0.08);
    color: var(--purple-primary);
    transition: border-color 900ms var(--ease), background-color 900ms var(--ease),
                box-shadow 900ms var(--ease);
  }
  .card-icon svg { width: 22px; height: 22px; display: block; }
  .card h3 { margin: 0 0 12px; font-size: 20px; font-weight: 500; color: #fff; }
  .card p  { margin: 0; font-size: 14px; line-height: 1.625; color: var(--text-secondary); }
  .card-line {
    position: absolute; left: 0; right: 0; bottom: 0; height: 1px;
    transform: scaleX(0); transform-origin: left;
    background: linear-gradient(to right, var(--purple-primary), var(--purple-primary),
                rgba(107,47,191,0.4));
    transition: transform 1200ms var(--ease);
  }
  @media (hover: hover) {
    .card:hover {
      border-color: rgba(139,92,246,0.5); background-color: rgba(139,92,246,0.05);
      box-shadow: 0 0 80px -20px rgba(139,92,246,0.55);
    }
    .card:hover .card-glow { opacity: 1; }
    .card:hover .card-num  { color: rgba(139,92,246,0.6); }
    .card:hover .card-icon {
      border-color: rgba(139,92,246,0.6); background-color: rgba(139,92,246,0.2);
      box-shadow: 0 0 30px rgba(139,92,246,0.4);
    }
    .card:hover .card-line { transform: scaleX(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    .card, .card-glow, .card-num, .card-icon, .card-line { transition: none; }
  }
</style>
</head>
<body>
  <div class="wrap">
    <p class="eyebrow">What we build</p>
    <h1>O que construímos</h1>
    <div class="grid">

      <article class="card">
        <div class="card-glow" aria-hidden="true"></div>
        <span class="card-num">01</span>
        <div class="card-body">
          <div class="card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </div>
          <h3>Custom Development</h3>
          <p>Software sob medida, construído do zero para o seu fluxo — sem amarras de plataformas genéricas.</p>
        </div>
        <div class="card-line" aria-hidden="true"></div>
      </article>

      <article class="card">
        <div class="card-glow" aria-hidden="true"></div>
        <span class="card-num">02</span>
        <div class="card-body">
          <div class="card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="14" rx="1.5"></rect>
              <rect x="14" y="3" width="7" height="9" rx="1.5"></rect>
            </svg>
          </div>
          <h3>Workflow Automation</h3>
          <p>Pipelines que conectam suas ferramentas e eliminam o trabalho manual repetitivo do dia a dia.</p>
        </div>
        <div class="card-line" aria-hidden="true"></div>
      </article>

      <article class="card">
        <div class="card-glow" aria-hidden="true"></div>
        <span class="card-num">03</span>
        <div class="card-body">
          <div class="card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <h3>Full-Stack Platforms</h3>
          <p>Da infraestrutura à interface, sistemas completos que escalam junto com o seu negócio.</p>
        </div>
        <div class="card-line" aria-hidden="true"></div>
      </article>

    </div>
  </div>
</body>
</html>
```

---

### Verified

This effect was tested in a real browser (Playwright). At rest the cards are flat — computed
`box-shadow: none`, glow `opacity: 0`, line `transform: matrix(0,0,0,1,0,0)` (`scaleX(0)`, invisible).
On hover the measured values were exactly: card `box-shadow: rgba(139,92,246,0.55) 0 0 80px -20px`,
border `rgba(139,92,246,0.5)`, glow `opacity: 1`, icon `box-shadow: rgba(139,92,246,0.4) 0 0 30px`,
and the bottom line `transform: matrix(1,0,0,1,0,0)` (`scaleX(1)` — fully drawn across the card).
