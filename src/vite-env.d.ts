/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API base when hosted elsewhere than the dev server, e.g. /lab/gridtrade/api */
  readonly VITE_API_BASE?: string;
  /** display registry base, e.g. /lab/gridtrade/registry/api/v1 */
  readonly VITE_REGISTRY_BASE?: string;
}
interface ImportMeta { readonly env: ImportMetaEnv }
