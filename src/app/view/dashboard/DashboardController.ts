/*
 * Ported from app/view/dashboard/DashboardController.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.view.dashboard.DashboardController', {
    extend: 'GT.core.BaseController',
    alias: 'controller.dashboard',
    requires: ['GT.util.Format', 'GT.ux.audit.CompareWindow'],

    init: function () {
        this.getView().on('afterrender', this.load, this, { single: true });
    },

    onScreenAction: function (view, action) {
        if (action === 'refresh') { this.load(); }
    },

    load: function () {
        var me = this;
        var F = GT.util.Format;
        return me.busy('Loading dashboard...', function () {
            return me.api().get('/dashboard');
        }).then(function (d) {
            var k = d.kpis;
            me.lookup('kpis').update([
                { label: 'Active approved contracts', value: k.activeContracts, icon: 'fa-file-alt', tone: 'teal', screen: 'contracts' },
                { label: 'Contracts awaiting approval', value: k.pendingApproval, icon: 'fa-hourglass-half', tone: 'amber', screen: 'contracts:pending' },
                { label: 'Trades today', value: k.tradesToday, icon: 'fa-exchange-alt', tone: 'blue', screen: 'trades' },
                { label: 'Open volume (MW)', value: F.indian(k.openVolumeMw), icon: 'fa-bolt', tone: 'violet', screen: 'trades' },
                { label: 'Issues in last file load', value: k.ingestionIssues, icon: 'fa-exclamation-triangle', tone: k.ingestionIssues ? 'red' : 'teal', screen: 'ingestion' }
            ]);
            me.lookup('volumeChart').getStore().loadData(d.volumeByProduct);
            me.lookup('notices').update(d.notices);
            me.lookup('activityGrid').getStore().loadData(d.recentActivity);
        }).catch(me.ignore);
    },

    onKpiClick: function (e, el) {
        var parts = String(el.getAttribute('data-screen')).split(':');
        Ext.GlobalEvents.fireEvent('gt-openscreen', parts[0], null, parts[1]);
    },

    onQuickAction: function (btn) {
        Ext.GlobalEvents.fireEvent('gt-openscreen', btn.screen, btn.screenId, btn.action);
    },

    onActivityLink: function (grid, rec) {
        if (rec.get('entityType') === 'Contract' && rec.get('action') !== 'DELETE') {
            this.openScreen('contract', rec.get('entityId'));
        } else {
            GT.ux.audit.CompareWindow.showEntry(rec.get('id'));
        }
    }
});
