// Monta o link do WhatsApp (wa.me) com mensagem pré-preenchida.
// Número via env PUBLIC_WHATSAPP_NUMBER (nunca hardcode).

const NUMBER = (import.meta.env.PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '');

export const DEFAULT_WHATSAPP_MESSAGE =
  'Olá! Vim pela landing page e quero saber mais sobre as impressoras DTF da Brasil DTF.';

export function whatsappUrl(message: string = DEFAULT_WHATSAPP_MESSAGE): string {
  const base = NUMBER ? `https://wa.me/${NUMBER}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(message)}`;
}
