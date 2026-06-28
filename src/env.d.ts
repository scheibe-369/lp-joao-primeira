/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_WHATSAPP_NUMBER: string;
  readonly PUBLIC_META_PIXEL_ID: string;
  readonly PUBLIC_SITE_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
