// Estado de consentimento (LGPD) em localStorage. Gateia a injeção do Pixel.
export const CONSENT_KEY = 'bdtf-consent-v1';
export type Consent = 'granted' | 'denied';

export function getConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Consent): void {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* localStorage indisponível (modo privado) — ignora */
  }
}
