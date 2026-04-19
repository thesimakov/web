/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_DEMO_USER_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
