// Ilha de JS #1 (~1KB): revela [data-reveal] ao entrar na viewport e pausa o
// .metal-shine fora da viewport (alterna .is-visible). Respeita reduced-motion.

function init(): void {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- scroll reveal ----
  const reveals = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (prefersReduced) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else if (reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.revealDelay ?? 0);
          window.setTimeout(() => el.classList.add('is-visible'), delay);
          io.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  }

  // ---- metal-shine: roda só enquanto visível ----
  const shines = Array.from(document.querySelectorAll<HTMLElement>('.metal-shine'));
  if (shines.length) {
    const so = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          (entry.target as HTMLElement).classList.toggle('is-visible', entry.isIntersecting);
        }
      },
      { threshold: 0 }
    );
    shines.forEach((el) => so.observe(el));
  }

  // ---- botão flutuante de WhatsApp: some quando a ContactBand está visível ----
  const fab = document.getElementById('floating-wa');
  const band = document.querySelector('[data-contactband]');
  if (fab && band) {
    const fo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          fab.classList.toggle('is-hidden', entry.isIntersecting);
        }
      },
      { threshold: 0.2 }
    );
    fo.observe(band);
  }

  // ---- navbar: ganha destaque (cinza claro + linha + sombra) após o 1º scroll ----
  const header = document.getElementById('site-header');
  const sentinel = document.getElementById('top-sentinel');
  if (header && sentinel) {
    const ho = new IntersectionObserver(
      ([entry]) => header.classList.toggle('is-scrolled', !entry.isIntersecting),
      { threshold: 0 }
    );
    ho.observe(sentinel);
  }
}

if (document.readyState !== 'loading') init();
else document.addEventListener('DOMContentLoaded', init);
