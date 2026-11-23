/*
 * Ported from app/util/Screens.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Screen registry ("view" is the xtype; it is not named xtype so Sencha Cmd does not treat it as a dependency).
 * Every menu item, link and route opens a screen by key. The main view listens for the
 * 'gt-openscreen' global event, so any controller can open any screen without referencing the main view.
 */
Ext.define('GT.util.Screens', {
    singleton: true,
    requires: ['Ext.window.Window', 'Ext.Promise'],

    // wrap: true puts the view inside a plain panel so a grid screen keeps its own title bar (and the tool
    // icons in it); a tab panel hides the header of its direct children.
    registry: {
        dashboard:      { title: 'Dashboard',        permission: 'dashboard.view', iconCls: 'x-fa fa-tachometer-alt',      view: 'gt-dashboard', closable: false },
        contracts:      { title: 'Contract Summary', permission: 'contracts.view', iconCls: 'x-fa fa-file-alt',     view: 'gt-contractsummary' },
        contract:       { title: 'Contract',         permission: 'contracts.view', iconCls: 'x-fa fa-edit', view: 'gt-contractentry', perRecord: true },
        versions:       { title: 'Contract Versions', permission: 'contracts.view', iconCls: 'x-fa fa-code-branch',      view: 'gt-contractversions' },
        trades:         { title: 'Trade Blotter',    permission: 'trades.view', iconCls: 'x-fa fa-exchange-alt',        view: 'gt-tradeblotter' },
        timeseries:     { title: 'Time Series',      permission: 'data.view', iconCls: 'x-fa fa-chart-line',      view: 'gt-timeseriessummary', wrap: true,
            entry: { permission: 'data.edit', model: 'GT.model.TimeSeries', window: 'GT.view.timeseries.TimeSeriesWindow', defaults: { type: 'Input - Simple', granularity: 'Hourly', unit: 'MWh', timeZone: 'IST', enabled: true, manual: true } } },
        tsdata:         { title: 'Series Data',      permission: 'data.view', iconCls: 'x-fa fa-table',           view: 'gt-timeseriesdata', perRecord: true },
        ingestion:      { title: 'Data Ingestion',   permission: 'data.view', iconCls: 'x-fa fa-cloud-upload-alt',    view: 'gt-dataingestion' },
        counterparties: { title: 'Counterparties',   permission: 'reference.view', iconCls: 'x-fa fa-building',      view: 'gt-counterparties',
            entry: { permission: 'reference.edit', model: 'GT.model.Counterparty', window: 'GT.view.reference.ReferenceWindow', screenClass: 'GT.view.reference.Counterparties', defaults: { type: 'Industrial', region: 'North', enabled: true } } },
        legalEntities:  { title: 'Legal Entities',   permission: 'reference.view', iconCls: 'x-fa fa-university',      view: 'gt-legalentities',
            entry: { permission: 'reference.edit', model: 'GT.model.LegalEntity', window: 'GT.view.reference.ReferenceWindow', screenClass: 'GT.view.reference.LegalEntities', defaults: { country: 'India', enabled: true } } },
        commodities:    { title: 'Commodities',      permission: 'reference.view', iconCls: 'x-fa fa-cubes',           view: 'gt-commodities',
            entry: { permission: 'reference.edit', model: 'GT.model.Commodity', window: 'GT.view.reference.ReferenceWindow', screenClass: 'GT.view.reference.Commodities', defaults: { enabled: true, contractTypes: [] } } },
        users:          { title: 'Users', iconCls: 'x-fa fa-user', permission: 'users.view', view: 'gt-userlist',
            entry: { model: 'GT.model.usermanagement.User', window: 'GT.view.usermanagement.user.UserWindow', permission: 'users.manage', defaults: { enabled: true, roleIds: [] } } },
        roles:          { title: 'Roles', iconCls: 'x-fa fa-user-shield', permission: 'users.view', view: 'gt-rolelist',
            entry: { model: 'GT.model.usermanagement.Role', window: 'GT.view.usermanagement.role.RoleWindow', permission: 'users.manage', defaults: { permissions: ['dashboard.view'] } } },
        audit:          { title: 'Audit Trail',      permission: 'audit.view', iconCls: 'x-fa fa-history',         view: 'gt-audittrail' }
    },

    get: function (key) {
        return this.registry[key];
    },

    /** @param {String} key registry key  @param {Number/String} [id] record id or "new" */
    open: function (key, id) {
        Ext.GlobalEvents.fireEvent('gt-openscreen', key, id);
    },

    /**
     * Opens a screen in a modal pop-up instead of a tab (used by the "maintain list" icon on lookup fields).
     * @param {String} key registry key
     * @param {Object} [cfg] extra config for the screen, e.g. { selectId: 5 }
     * @return {Ext.window.Window}
     */
    openInWindow: function (key, cfg) {
        var reg = this.get(key);
        if (!reg) { return null; }
        var vw = Ext.Element.getViewportWidth(), vh = Ext.Element.getViewportHeight();
        var win = Ext.create('Ext.window.Window', {
            title: reg.title, iconCls: reg.iconCls, cls: 'gt-screen-window',
            width: Math.min(1280, vw - 60), height: Math.min(760, vh - 60),
            modal: true, maximizable: true, constrain: true, layout: 'fit', closeAction: 'destroy',
            items: [Ext.apply({ xtype: reg.view, screenKey: key, inWindow: true }, cfg)]
        });
        win.show();
        return win;
    },

    /**
     * Opens the entry pop-up of one record of a screen's entity: loads it for editing when an id is given,
     * otherwise starts a new record. Resolves with the window (or null when the screen has no entry window).
     */
    openEntry: function (key, id, defaults) {
        var reg = this.get(key);
        var entry = reg && reg.entry;
        if (!entry) { return Ext.Promise.resolve(null); }
        var model = Ext.ClassManager.get(entry.model);
        var show = function (rec) {
            var win = Ext.create(entry.window, { record: rec, screenClass: entry.screenClass });
            win.show();
            return win;
        };
        if (id === null || id === undefined || id === '') {
            return Ext.Promise.resolve(show(Ext.create(entry.model, Ext.apply({}, defaults, entry.defaults))));
        }
        return new Ext.Promise(function (resolve, reject) {
            model.load(id, {
                success: function (rec) { resolve(show(rec)); },
                failure: function () { reject(new Error(reg.title + ' #' + id + ' not found')); }
            });
        });
    },

    token: function (key, id) {
        return id !== undefined && id !== null && id !== '' ? key + '/' + id : key;
    }
});
