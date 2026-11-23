# GridTrade (React)

GridTrade Contracts, migrated automatically from Ext JS 7.2 classic to React 18 + TypeScript + Vite by the
`extjs-migration-agent` (see `MIGRATION_REPORT.md`): 101 classes → 101 modules, type-checked and built, on
`@extreact/runtime` (a React implementation of the Ext JS API) inside the `@extreact/framework` shell
(sign-in, registry-driven menus, Summary / Entry / Master-Slave templates).

Live: the portfolio serves it at `/lab/gridtrade/` (read-only demo login shown on `/lab`).

| Path | What |
|---|---|
| `src/app/`, `src/overrides/`, `src/ext-screens/` | ported Ext JS code (from the migration) |
| `src/app.config.ts`, `src/app-bridge.ts`, `src/displays.ts`, `src/modules/` | application-owned code and displays |
| `registration/*.manifest.json` | menus and displays this app registers |
| `vendor/*.tgz` | the `@extreact` runtime and framework packages |

## Run

```bash
npm ci
npm run dev                 # proxies /api to GridTrade API :5080 and /registry to a display registry :8130
npm run build               # dist/ for a standalone host
npm run build:portfolio     # dist/ for the portfolio: API and registry under /lab/gridtrade, manifests included
```

A `v*` tag publishes `gridtrade-react-portfolio.zip` as a release asset; the portfolio's
`scripts/stage-gridtrade.ps1 -Repo <owner>/gridtrade-react` downloads it.
