/*
 * Ported from app/Application.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Application entry. Loads the shared lookup lists, then shows the main view. Everything the build needs is
 * listed in requires so Sencha Cmd bundles it (views are opened later by xtype).
 */
Ext.define('GT.Application', {
    extend: 'Ext.app.Application',
    name: 'GT',

    requires: [
        'Ext.tip.QuickTipManager', 'Ext.state.Manager', 'Ext.state.LocalStorageProvider',
        'GT.util.Session', 'GT.util.Api', 'GT.util.Toast', 'GT.util.Format', 'GT.util.Csv', 'GT.util.Lookups', 'GT.util.Screens',
        'GT.view.main.Main',
        'GT.view.dashboard.Dashboard',
        'GT.view.contract.ContractSummary', 'GT.view.contract.ContractEntry', 'GT.view.contract.ContractVersions',
        'GT.view.trade.TradeBlotter',
        'GT.view.timeseries.TimeSeriesSummary', 'GT.view.timeseries.TimeSeriesData',
        'GT.view.ingestion.DataIngestion',
        'GT.view.reference.Counterparties', 'GT.view.reference.LegalEntities', 'GT.view.reference.Commodities', 'GT.view.reference.ReferenceWindow',
        'GT.view.timeseries.TimeSeriesWindow',
        'GT.view.audit.AuditTrail',
        'GT.view.usermanagement.user.UserList', 'GT.view.usermanagement.role.RoleList'
    ],

    defaultToken: 'dashboard',

    launch: function () {
        var me = this;
        Ext.tip.QuickTipManager.init();
        // Grids with stateful: true remember column width, order, visibility, sort and filters per browser.
        try {
            Ext.state.Manager.setProvider(new Ext.state.LocalStorageProvider({ prefix: 'gt-state-' }));
        } catch (e) { /* storage blocked: grids simply do not remember their layout */ }
        GT.util.Api.init();
        me.setSplash('Loading reference data...');
        GT.util.Session.load().then(function () {
            return GT.util.Lookups.preload();
        }).then(function () {
            me.removeSplash();
            me.setMainView('GT.view.main.Main');
        }, function () {
            me.setSplash('Cannot reach the GridTrade API. Start it with <code>npm start</code>, then <a href="javascript:location.reload()">reload</a>.', true);
        });
    },

    setSplash: function (html, isError) {
        var el = document.getElementById('gt-splash-msg');
        if (el) {
            el.innerHTML = html;
            el.className = isError ? 'gt-splash-error' : '';
        }
    },

    removeSplash: function () {
        var splash = Ext.get('gt-splash');
        if (splash) {
            splash.fadeOut({ duration: 250, remove: true });
        }
    },

    onAppUpdate: function () {
        Ext.Msg.confirm('Application update', 'A new version of this application is available. Reload?', function (choice) {
            if (choice === 'yes') { window.location.reload(); }
        });
    }
});
