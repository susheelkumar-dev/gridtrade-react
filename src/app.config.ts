import type { AppConfig } from '@extreact/framework';

/** GridTrade on the React shell: the API, the display registry, and the display that opens first. */
export const appConfig: AppConfig = {
  appId: 'gridtrade',
  title: 'GridTrade Contracts',
  subtitle: 'Energy contracts, trades and market data',
  // Local: Vite proxies /api and /registry. Hosted in the portfolio (npm run build:portfolio): the site's
  // same-origin proxy and registry under /lab/gridtrade.
  apiBase: import.meta.env.VITE_API_BASE || '/api',
  registryBase: import.meta.env.VITE_REGISTRY_BASE || '/registry/api/v1',
  home: 'dashboard',
};
