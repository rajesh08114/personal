/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** REST API for server mode. Empty = Local Share Mode (IndexedDB). */
  readonly VITE_BIRTHDAY_API_URL?: string;
  /** Optional endpoint that receives uncaught-error reports (no birthday content). */
  readonly VITE_ERROR_REPORT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
