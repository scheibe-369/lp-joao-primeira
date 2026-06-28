# Metal Shine — Animated Silver Text Effect

A self-contained guide for the **silver / neutral metallic** animated text effect: a chrome
gradient clipped to the letter shapes, with a bright highlight band that sweeps across on an
infinite loop. It's the neutral recolor of this codebase's `.metallic-purple` class
(`app/globals.css`), and it reads best on a **dark background**.

> Verified in a real browser: the gradient is clipped to the glyphs (not a solid block, not
> invisible), with `-webkit-text-fill-color: transparent` and the 120° silver gradient applied.

---

## 1. The effect — final SILVER CSS

This is the complete, copy-paste CSS. It keeps every structural / performance / accessibility
detail of the original purple version — only the class name, keyframes name, and the three
gradient colors changed.

```css
.metallic-silver {
  background: linear-gradient(
    120deg,
    #71717a 40%,   /* base — dark silver */
    #ffffff 50%,   /* highlight — bright chrome band */
    #71717a 60%    /* base — dark silver */
  );
  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  animation-name: metallic-silver-shine;
  animation-duration: 5s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  /* Force a GPU compositor layer so the background-position repaint stays
     isolated and doesn't trigger paint of neighbouring elements. */
  will-change: background-position;
  transform: translateZ(0);
  backface-visibility: hidden;
}

@keyframes metallic-silver-shine {
  0%   { background-position: 100% 0%; }
  100% { background-position: -100% 0%; }
}

/* Accessibility: respect users who asked for less motion. */
@media (prefers-reduced-motion: reduce) {
  .metallic-silver { animation: none; }
}

/* Mobile: slow the loop down. The eye doesn't notice the difference in
   smoothness, but the GPU processes roughly half as many critical frames. */
@media (max-width: 1024px) {
  .metallic-silver { animation-duration: 10s; }
}
```

---

## 2. Two ready-to-use forms

### A. Plain HTML / CSS

Drop the CSS block above into your stylesheet (or a `<style>` tag), then wrap the word you want
to shine:

```html
<h1>We engineer <span class="metallic-silver">growth</span></h1>
```

Only the word inside the `<span>` shimmers; the rest of the heading keeps its normal color.
Make sure the surrounding text/background is dark so the silver reads as metal.

### B. React / Tailwind (this codebase)

This repo already applies the effect by hand with a `<span>` in
`components/sections/ai-stats-proof.tsx`:

```tsx
<h2 className="text-3xl font-light text-white md:text-5xl">
  {titleA}
  <span className="metallic-silver">{titleB}</span>
  {titleC}
</h2>
```

**Where the CSS lives:** paste the CSS block from section 1 into `app/globals.css` (the existing
`.metallic-purple` / `.shiny-text` rules sit right there around lines 76–106 — add
`.metallic-silver` alongside them). Tailwind utility classes and this raw CSS class coexist on
the same element with no conflict.

If you reuse it a lot, a one-line wrapper keeps call sites tidy (optional — the bare `<span>`
is perfectly fine):

```tsx
// components/ui/metal-shine.tsx
export function MetalShine({ children }: { children: React.ReactNode }) {
  return <span className="metallic-silver">{children}</span>;
}

// usage:
<h2>We engineer <MetalShine>growth</MetalShine></h2>
```

> Note: there's also a **different** shine in this codebase — `components/ui/shiny-text.tsx`
> (`.shiny-text`). That one is a translucent rgba-mask variant driven by a `speed` prop / CSS
> variable. This guide is specifically about the opaque **gradient-clip** `.metallic-*` effect.

---

## 3. How it works

Three ideas stacked on top of each other:

1. **Paint the text with a gradient instead of a flat color.**
   `background: linear-gradient(...)` paints the element's box, and
   `background-clip: text` + `-webkit-background-clip: text` clips that paint to the *shape of
   the glyphs*. Setting `color: transparent` / `-webkit-text-fill-color: transparent` hides the
   normal text fill so the gradient shows through the letters. (If you forget the transparent
   fill, you just see solid-colored text and no gradient — that's the #1 mistake.)

2. **Make the gradient wider than the box so there's room to slide.**
   `background-size: 200% 100%` paints the gradient at twice the element's width. That extra
   width is the runway the highlight band travels along.

3. **Animate the gradient's position to move the highlight.**
   The keyframes animate `background-position` from `100% 0%` to `-100% 0%`. Because the bright
   stop sits at `50%` of a 200%-wide gradient, sliding the position drags that bright band
   across the letters — the "shine" sweeping over chrome. `iteration-count: infinite` +
   `timing-function: linear` make it a smooth, never-ending loop. Nothing about the layout
   moves; only a background offset changes, which is cheap to animate.

---

## 4. Customize the color

The gradient has exactly **three stops**, and the pattern is always **base → highlight → base**:

```
linear-gradient(120deg,  BASE 40%,  HIGHLIGHT 50%,  BASE 60%)
                         └─ dark ─┘  └─ bright ─┘    └─ dark ─┘
```

- The two **base** colors (40% and 60%) are the "metal" body — keep them identical.
- The middle **highlight** (50%) is the glint — make it noticeably brighter than the base.

Swap those three colors to retint the metal. Some drop-in palettes:

| Look              | Base       | Highlight  | Base       |
| ----------------- | ---------- | ---------- | ---------- |
| Silver (default)  | `#71717a`  | `#ffffff`  | `#71717a`  |
| Warm gold         | `#7c6f3f`  | `#fff7d6`  | `#7c6f3f`  |
| Cool steel        | `#475569`  | `#f1f5f9`  | `#475569`  |
| Pure neutral grey | `#6b7280`  | `#f9fafb`  | `#6b7280`  |

```css
/* Example: warm gold */
.metallic-silver {
  background: linear-gradient(120deg, #7c6f3f 40%, #fff7d6 50%, #7c6f3f 60%);
  /* ...everything else stays the same... */
}
```

**Two more knobs:**

- **Speed** → `animation-duration`. Lower = faster sweep. `5s` is a calm, premium pace; `2.5s`
  is energetic; `10s` is a slow, luxurious glint. (The mobile media query already doubles it.)
- **Band tightness** → the `40% / 50% / 60%` stop positions. Pulling them closer together (e.g.
  `46% / 50% / 54%`) makes a **thin, sharp** highlight streak; spreading them apart (e.g.
  `30% / 50% / 70%`) makes a **soft, wide** sheen. The `120deg` angle controls the diagonal
  tilt of the band — raise it toward `160deg` for a more vertical wipe, lower it toward `90deg`
  for a horizontal one.

---

## 5. Accessibility & performance notes

- **`prefers-reduced-motion`** — the `@media (prefers-reduced-motion: reduce)` block disables
  the animation entirely for users who've asked their OS for less motion. The text stays
  perfectly legible because the gradient still renders; it just stops sweeping. Always ship
  this guard with any looping animation.
- **GPU layer (`transform: translateZ(0)` + `backface-visibility: hidden`)** — these promote
  the element to its own compositor layer. The per-frame `background-position` repaint is then
  isolated to that layer and won't force the browser to repaint neighbouring content, which
  keeps the rest of the page smooth.
- **`will-change: background-position`** — hints to the browser exactly which property is going
  to animate, so it can prepare the optimization (the GPU layer) ahead of time instead of
  reacting on the first frame. Use it deliberately on the few animating elements — slapping
  `will-change` on everything wastes memory and backfires.
- **Mobile slowdown** — doubling `animation-duration` to `10s` under `max-width: 1024px` halves
  the number of critical frames the GPU renders. Visually imperceptible, measurably lighter on
  battery and lower-end mobile GPUs.
- **Contrast** — because the fill is transparent and the gradient dips to a mid grey, only use
  this on a **dark** background; on a light background the dark base stops can drop below
  comfortable contrast. Reserve it for short, decorative highlight words, not body copy.

---

## 6. Standalone demo (copy-paste, open directly)

Save this as `metal-shine-demo.html` and open it in any browser. It's a full dark page showing
the silver shine on a headline — no build step, no dependencies.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Metal Shine — Silver Animated Text</title>
  <style>
    :root { color-scheme: dark; }

    html, body {
      margin: 0;
      min-height: 100%;
      background: radial-gradient(ellipse at 50% 0%, #15151b 0%, #07070a 60%, #050507 100%);
      color: #e5e7eb;
      font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    .wrap {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2.5rem;
      padding: 2rem;
      text-align: center;
    }

    .eyebrow {
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      font-size: 0.75rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #9ca3af;
    }

    h1 {
      margin: 0;
      font-size: clamp(2.5rem, 9vw, 6rem);
      font-weight: 300;
      line-height: 1.05;
      letter-spacing: -0.02em;
      color: #ffffff;
    }

    .sub {
      max-width: 38rem;
      font-size: 1rem;
      line-height: 1.6;
      color: #9ca3af;
    }

    /* ===== The effect ===== */
    .metallic-silver {
      background: linear-gradient(
        120deg,
        #71717a 40%,
        #ffffff 50%,
        #71717a 60%
      );
      background-size: 200% 100%;
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      -webkit-text-fill-color: transparent;
      animation-name: metallic-silver-shine;
      animation-duration: 5s;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
      /* Force a GPU compositor layer so the background-position repaint
         stays isolated and doesn't trigger paint of neighbouring elements. */
      will-change: background-position;
      transform: translateZ(0);
      backface-visibility: hidden;
    }

    @keyframes metallic-silver-shine {
      0%   { background-position: 100% 0%; }
      100% { background-position: -100% 0%; }
    }

    @media (prefers-reduced-motion: reduce) {
      .metallic-silver { animation: none; }
    }

    /* Mobile: slow the loop down — the eye doesn't notice, the GPU does. */
    @media (max-width: 1024px) {
      .metallic-silver { animation-duration: 10s; }
    }
  </style>
</head>
<body>
  <main class="wrap">
    <p class="eyebrow">Metal Shine</p>
    <h1>We engineer <span class="metallic-silver">growth</span></h1>
    <p class="sub">
      The word above uses a silver chrome gradient clipped to the text, with a bright
      highlight band that slides across on an infinite loop. Reads best on a dark background.
    </p>
  </main>
</body>
</html>
```

---

### Source of truth

The original purple version lives in `app/globals.css` (`.metallic-purple`, around lines
76–106, plus the reduced-motion guard and the `max-width: 1024px` slowdown). The usage pattern
— a title split into parts with the highlighted word in a `<span>` — is in
`components/sections/ai-stats-proof.tsx`.
