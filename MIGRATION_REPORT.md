# Migration report: GT (Ext JS classic) to React + TypeScript

- Source: `D:\ExtJsToReactTool\gridtrade-contracts-extjs\web`
- Output: `D:\repos\gridtrade-react` (hosted by @extreact/framework: sign-in, menus from the display registry)
- Classes: **101** in **101** modules (app 2, controller 13, mixin 1, model 16, override 5, plugin 1, proxy 1, store 15, util 8, view 37, viewmodel 2)
- Framework usage: 73 classes, 51 aliases (xtypes, layouts, plugins ...), 81 Ext.* APIs
- Findings: 1 info

## How the code was ported

Every Ext JS file became one ES module under `src/` written against `@extreact/runtime`, the shared library with
the Ext JS-style class system, stores and components for React (a package, not copied into the app). The modules are imported in load order
(what a class extends, mixes in, overrides or requires comes first). The app's SCSS is compiled by Vite, and its
theme variables drive the runtime theme through CSS variables. Code that cannot run as an ES module, or uses
an Ext API the runtime lacks, was reported, and with `--llm` sent to a local model for a checked rewrite.

## Coverage

- classes: 73 used, all supported
- aliases: 51 used, all supported
- apis: 81 used, all supported

## Screens loaded on first use

22 views (screens and windows) are not part of the startup bundle. Each is downloaded the first time
a display shows it (`Ext.require`, registered in `src/ext-modules.ts`; chunks in `src/ext-screens/`):

- `gt-audittrail`: 2 module(s)
- `gt-commodities`: 1 module(s)
- `gt-componentwindow`: 1 module(s)
- `gt-contractentry`: 4 module(s)
- `gt-contractsummary`: 2 module(s)
- `gt-contractversions`: 2 module(s)
- `gt-counterparties`: 1 module(s)
- `gt-dashboard`: 2 module(s)
- `gt-dataingestion`: 2 module(s)
- `gt-legalentities`: 1 module(s)
- `gt-main`: 3 module(s)
- `gt-permissionmatrix`: 1 module(s)
- `gt-referencewindow`: 4 module(s)
- `gt-rolelist`: 4 module(s)
- `gt-rolewindow`: 2 module(s)
- `gt-timeseriesdata`: 2 module(s)
- `gt-timeseriessummary`: 3 module(s)
- `gt-timeserieswindow`: 1 module(s)
- `gt-tradeblotter`: 3 module(s)
- `gt-tradewindow`: 1 module(s)
- `gt-userlist`: 3 module(s)
- `gt-userwindow`: 1 module(s)

## Modules that keep @ts-nocheck

These ported modules still have type errors, so they start with `// @ts-nocheck`. Every other module is
checked by `tsc`. Fix the errors (run `npx tsc --noEmit` after removing the line) when you work on them:

- `src/app/util/Api.ts`
- `src/app/ux/audit/AuditCompare.ts`
- `src/app/core/BaseModel.ts`
- `src/app/view/main/MainController.ts`

## Verification

**Passed**
- `npm install`: ok
- `tsc --noEmit`: ok
- `vite build`: ok

## LLM pass

Nothing needed an LLM rewrite.

## Findings

| Level | Code | Where | Message |
|---|---|---|---|
| info | top-level-code | app.js | 1 statement(s) outside Ext.define |

## Classes

| Class | Category | Extends | Module |
|---|---|---|---|
| `GT.$application` | app | `GT.Application` | `src/app.ts` |
| `GT.Application` | app | `Ext.app.Application` | `src/app/Application.ts` |
| `GT.core.BaseController` | controller | `Ext.app.ViewController` | `src/app/core/BaseController.ts` |
| `GT.core.BaseModel` | model | `Ext.data.Model` | `src/app/core/BaseModel.ts` |
| `GT.core.BaseStore` | store | `Ext.data.Store` | `src/app/core/BaseStore.ts` |
| `GT.core.RestProxy` | proxy | `Ext.data.proxy.Rest` | `src/app/core/RestProxy.ts` |
| `GT.model.AuditEntry` | model | `GT.core.BaseModel` | `src/app/model/AuditEntry.ts` |
| `GT.model.Commodity` | model | `GT.core.BaseModel` | `src/app/model/Commodity.ts` |
| `GT.model.Component` | model | `GT.core.BaseModel` | `src/app/model/Component.ts` |
| `GT.model.Contract` | model | `GT.core.BaseModel` | `src/app/model/Contract.ts` |
| `GT.model.ContractVersion` | model | `GT.core.BaseModel` | `src/app/model/ContractVersion.ts` |
| `GT.model.Counterparty` | model | `GT.core.BaseModel` | `src/app/model/Counterparty.ts` |
| `GT.model.IngestionError` | model | `Ext.data.Model` | `src/app/model/IngestionError.ts` |
| `GT.model.IngestionJob` | model | `GT.core.BaseModel` | `src/app/model/IngestionJob.ts` |
| `GT.model.IntervalValue` | model | `Ext.data.Model` | `src/app/model/IntervalValue.ts` |
| `GT.model.LegalEntity` | model | `GT.core.BaseModel` | `src/app/model/LegalEntity.ts` |
| `GT.model.Lookup` | model | `Ext.data.Model` | `src/app/model/Lookup.ts` |
| `GT.model.TimeSeries` | model | `GT.core.BaseModel` | `src/app/model/TimeSeries.ts` |
| `GT.model.Trade` | model | `GT.core.BaseModel` | `src/app/model/Trade.ts` |
| `GT.model.usermanagement.Role` | model | `GT.core.BaseModel` | `src/app/model/usermanagement/Role.ts` |
| `GT.model.usermanagement.User` | model | `GT.core.BaseModel` | `src/app/model/usermanagement/User.ts` |
| `GT.overrides.Component` | override | `Ext.Component` | `src/overrides/Component.ts` |
| `GT.overrides.draw.Container` | override | `Ext.draw.Container` | `src/overrides/draw/Container.ts` |
| `GT.overrides.form.field.Base` | override | `Ext.form.field.Base` | `src/overrides/form/field/Base.ts` |
| `GT.overrides.form.field.Date` | override | `Ext.form.field.Date` | `src/overrides/form/field/Date.ts` |
| `GT.overrides.grid.column.Date` | override | `Ext.grid.column.Date` | `src/overrides/grid/column/Date.ts` |
| `GT.store.AuditEntries` | store | `GT.core.BaseStore` | `src/app/store/AuditEntries.ts` |
| `GT.store.Commodities` | store | `GT.core.BaseStore` | `src/app/store/Commodities.ts` |
| `GT.store.Components` | store | `GT.core.BaseStore` | `src/app/store/Components.ts` |
| `GT.store.ContractVersions` | store | `GT.core.BaseStore` | `src/app/store/ContractVersions.ts` |
| `GT.store.Contracts` | store | `GT.core.BaseStore` | `src/app/store/Contracts.ts` |
| `GT.store.Counterparties` | store | `GT.core.BaseStore` | `src/app/store/Counterparties.ts` |
| `GT.store.IngestionErrors` | store | `GT.core.BaseStore` | `src/app/store/IngestionErrors.ts` |
| `GT.store.IngestionJobs` | store | `GT.core.BaseStore` | `src/app/store/IngestionJobs.ts` |
| `GT.store.IntervalValues` | store | `GT.core.BaseStore` | `src/app/store/IntervalValues.ts` |
| `GT.store.LegalEntities` | store | `GT.core.BaseStore` | `src/app/store/LegalEntities.ts` |
| `GT.store.TimeSeries` | store | `GT.core.BaseStore` | `src/app/store/TimeSeries.ts` |
| `GT.store.Trades` | store | `GT.core.BaseStore` | `src/app/store/Trades.ts` |
| `GT.store.usermanagement.Roles` | store | `GT.core.BaseStore` | `src/app/store/usermanagement/Roles.ts` |
| `GT.store.usermanagement.Users` | store | `GT.core.BaseStore` | `src/app/store/usermanagement/Users.ts` |
| `GT.util.Api` | util | `Ext.Base` | `src/app/util/Api.ts` |
| `GT.util.Csv` | util | `Ext.Base` | `src/app/util/Csv.ts` |
| `GT.util.Format` | util | `Ext.Base` | `src/app/util/Format.ts` |
| `GT.util.Lookups` | util | `Ext.Base` | `src/app/util/Lookups.ts` |
| `GT.util.Screens` | util | `Ext.Base` | `src/app/util/Screens.ts` |
| `GT.util.Session` | util | `Ext.Base` | `src/app/util/Session.ts` |
| `GT.util.Toast` | util | `Ext.Base` | `src/app/util/Toast.ts` |
| `GT.util.Xlsx` | util | `Ext.Base` | `src/app/util/Xlsx.ts` |
| `GT.ux.audit.AuditCompare` | view | `Ext.grid.Panel` | `src/app/ux/audit/AuditCompare.ts` |
| `GT.ux.audit.CompareWindow` | view | `Ext.window.Window` | `src/app/ux/audit/CompareWindow.ts` |
| `GT.ux.audit.RecentChanges` | view | `Ext.grid.Panel` | `src/app/ux/audit/RecentChanges.ts` |
| `GT.ux.filter.FilterPanel` | view | `Ext.form.Panel` | `src/app/ux/filter/FilterPanel.ts` |
| `GT.ux.form.DateRange` | view | `Ext.form.FieldContainer` | `src/app/ux/form/DateRange.ts` |
| `GT.ux.form.EntryForm` | view | `Ext.form.Panel` | `src/app/ux/form/EntryForm.ts` |
| `GT.ux.form.LookupCombo` | view | `Ext.form.field.ComboBox` | `src/app/ux/form/LookupCombo.ts` |
| `GT.ux.form.LookupMixin` | mixin | `Ext.Mixin` | `src/app/ux/form/LookupMixin.ts` |
| `GT.ux.form.LookupTag` | view | `Ext.form.field.Tag` | `src/app/ux/form/LookupTag.ts` |
| `GT.ux.grid.BaseGrid` | view | `Ext.grid.Panel` | `src/app/ux/grid/BaseGrid.ts` |
| `GT.ux.grid.GenericGrid` | view | `GT.ux.grid.BaseGrid` | `src/app/ux/grid/GenericGrid.ts` |
| `GT.ux.grid.IntervalGrid` | view | `GT.ux.grid.GenericGrid` | `src/app/ux/grid/IntervalGrid.ts` |
| `GT.ux.grid.column.Link` | view | `Ext.grid.column.Column` | `src/app/ux/grid/column/Link.ts` |
| `GT.ux.grid.column.Status` | view | `Ext.grid.column.Column` | `src/app/ux/grid/column/Status.ts` |
| `GT.ux.grid.plugin.RangeFill` | plugin | `Ext.plugin.Abstract` | `src/app/ux/grid/plugin/RangeFill.ts` |
| `GT.ux.panel.MasterDetail` | view | `Ext.panel.Panel` | `src/app/ux/panel/MasterDetail.ts` |
| `GT.ux.window.EntryWindow` | view | `Ext.window.Window` | `src/app/ux/window/EntryWindow.ts` |
| `GT.view.audit.AuditTrail` | view | `Ext.panel.Panel` | `src/app/view/audit/AuditTrail.ts` |
| `GT.view.audit.AuditTrailController` | controller | `GT.core.BaseController` | `src/app/view/audit/AuditTrailController.ts` |
| `GT.view.contract.ComponentWindow` | view | `GT.ux.window.EntryWindow` | `src/app/view/contract/ComponentWindow.ts` |
| `GT.view.contract.ContractEntry` | view | `Ext.panel.Panel` | `src/app/view/contract/ContractEntry.ts` |
| `GT.view.contract.ContractEntryController` | controller | `GT.core.BaseController` | `src/app/view/contract/ContractEntryController.ts` |
| `GT.view.contract.ContractEntryModel` | viewmodel | `Ext.app.ViewModel` | `src/app/view/contract/ContractEntryModel.ts` |
| `GT.view.contract.ContractSummary` | view | `Ext.panel.Panel` | `src/app/view/contract/ContractSummary.ts` |
| `GT.view.contract.ContractSummaryController` | controller | `GT.core.BaseController` | `src/app/view/contract/ContractSummaryController.ts` |
| `GT.view.contract.ContractVersions` | view | `Ext.panel.Panel` | `src/app/view/contract/ContractVersions.ts` |
| `GT.view.contract.ContractVersionsController` | controller | `GT.core.BaseController` | `src/app/view/contract/ContractVersionsController.ts` |
| `GT.view.dashboard.Dashboard` | view | `Ext.container.Container` | `src/app/view/dashboard/Dashboard.ts` |
| `GT.view.dashboard.DashboardController` | controller | `GT.core.BaseController` | `src/app/view/dashboard/DashboardController.ts` |
| `GT.view.ingestion.DataIngestion` | view | `Ext.panel.Panel` | `src/app/view/ingestion/DataIngestion.ts` |
| `GT.view.ingestion.DataIngestionController` | controller | `GT.core.BaseController` | `src/app/view/ingestion/DataIngestionController.ts` |
| `GT.view.main.Main` | view | `Ext.container.Viewport` | `src/app/view/main/Main.ts` |
| `GT.view.main.MainController` | controller | `GT.core.BaseController` | `src/app/view/main/MainController.ts` |
| `GT.view.main.MainModel` | viewmodel | `Ext.app.ViewModel` | `src/app/view/main/MainModel.ts` |
| `GT.view.reference.Commodities` | view | `GT.ux.panel.MasterDetail` | `src/app/view/reference/Commodities.ts` |
| `GT.view.reference.Counterparties` | view | `GT.ux.panel.MasterDetail` | `src/app/view/reference/Counterparties.ts` |
| `GT.view.reference.LegalEntities` | view | `GT.ux.panel.MasterDetail` | `src/app/view/reference/LegalEntities.ts` |
| `GT.view.reference.ReferenceWindow` | view | `GT.ux.window.EntryWindow` | `src/app/view/reference/ReferenceWindow.ts` |
| `GT.view.timeseries.TimeSeriesData` | view | `Ext.panel.Panel` | `src/app/view/timeseries/TimeSeriesData.ts` |
| `GT.view.timeseries.TimeSeriesDataController` | controller | `GT.core.BaseController` | `src/app/view/timeseries/TimeSeriesDataController.ts` |
| `GT.view.timeseries.TimeSeriesSummary` | view | `GT.ux.grid.GenericGrid` | `src/app/view/timeseries/TimeSeriesSummary.ts` |
| `GT.view.timeseries.TimeSeriesSummaryController` | controller | `GT.core.BaseController` | `src/app/view/timeseries/TimeSeriesSummaryController.ts` |
| `GT.view.timeseries.TimeSeriesWindow` | view | `GT.ux.window.EntryWindow` | `src/app/view/timeseries/TimeSeriesWindow.ts` |
| `GT.view.trade.TradeBlotter` | view | `Ext.panel.Panel` | `src/app/view/trade/TradeBlotter.ts` |
| `GT.view.trade.TradeBlotterController` | controller | `GT.core.BaseController` | `src/app/view/trade/TradeBlotterController.ts` |
| `GT.view.trade.TradeWindow` | view | `GT.ux.window.EntryWindow` | `src/app/view/trade/TradeWindow.ts` |
| `GT.view.usermanagement.role.PermissionMatrix` | view | `Ext.grid.Panel` | `src/app/view/usermanagement/role/PermissionMatrix.ts` |
| `GT.view.usermanagement.role.RoleList` | view | `Ext.panel.Panel` | `src/app/view/usermanagement/role/RoleList.ts` |
| `GT.view.usermanagement.role.RoleListController` | controller | `GT.core.BaseController` | `src/app/view/usermanagement/role/RoleListController.ts` |
| `GT.view.usermanagement.role.RoleWindow` | view | `GT.ux.window.EntryWindow` | `src/app/view/usermanagement/role/RoleWindow.ts` |
| `GT.view.usermanagement.user.UserList` | view | `Ext.panel.Panel` | `src/app/view/usermanagement/user/UserList.ts` |
| `GT.view.usermanagement.user.UserListController` | controller | `GT.core.BaseController` | `src/app/view/usermanagement/user/UserListController.ts` |
| `GT.view.usermanagement.user.UserWindow` | view | `GT.ux.window.EntryWindow` | `src/app/view/usermanagement/user/UserWindow.ts` |

## Next steps

1. Start the display registry (display-registry) and register registration/*.manifest.json with agentctl display register; the menu comes from there.
2. Run the app: API_TARGET=http://host:port REGISTRY_TARGET=http://host:8130 npm run dev, sign in, walk every screen.
3. Read docs/DEVELOPER-GUIDE.md: where everything is, how a display is registered and how to add one.
4. Keep the Ext-style code, or rewrite a screen as a template / React display when you want to; each module is independent.
