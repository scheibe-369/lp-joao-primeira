// Wrapper do Meta Pixel. Carrega fbevents SÓ após consentimento e se houver ID.
// Eventos: PageView (no init), ViewContent (detalhe), Contact (clique WhatsApp).
// NÃO disparar Lead. Ver PRD §6 regra 8.

type Params = Record<string, unknown>;

let ready = false;
const queue: Array<[string, Params | undefined]> = [];

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    bdtfTrack?: (event: string, params?: Params) => void;
  }
}

/** Injeta o fbevents.js (adiado), inicializa o Pixel e dispara PageView. Idempotente. */
export function initPixel(id: string): void {
  if (ready || !id || typeof window === 'undefined') return;

  /* snippet oficial do Meta Pixel (loader) */
  (function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return;
    const n: any = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s.parentNode?.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq?.('init', id);
  window.fbq?.('track', 'PageView');
  ready = true;

  // descarrega eventos enfileirados durante a sessão consentida
  while (queue.length) {
    const item = queue.shift();
    if (item) window.fbq?.('track', item[0], item[1] ?? {});
  }
}

/** Dispara um evento (se o Pixel já estiver pronto) ou enfileira até o init. */
export function track(event: string, params?: Params): void {
  if (typeof window === 'undefined') return;
  if (!ready) {
    queue.push([event, params]);
    return;
  }
  window.fbq?.('track', event, params ?? {});
}

export function isPixelReady(): boolean {
  return ready;
}
