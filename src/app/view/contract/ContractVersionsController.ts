/*
 * Ported from app/view/contract/ContractVersionsController.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.view.contract.ContractVersionsController', {
    extend: 'GT.core.BaseController',
    alias: 'controller.contractversions',
    requires: ['GT.ux.audit.CompareWindow'],

    onLink: function (grid, rec) {
        this.openScreen('contract', rec.get('contractId'));
    },

    onCompare: function () {
        var sel = this.lookup('versionGrid').getSelection();
        var contracts = Ext.Array.unique(Ext.Array.map(sel, function (r) { return r.get('contractId'); }));
        if (sel.length < 2) {
            this.toast('Tick at least two versions of the same contract', 'warning');
            return;
        }
        if (contracts.length > 1) {
            this.toast('The selected versions belong to different contracts', 'warning');
            return;
        }
        GT.ux.audit.CompareWindow.showVersions(Ext.Array.map(sel, function (r) { return r.getId(); }));
    },

    /** Opened from a contract: filter to that contract. */
    onScreenAction: function (view, action) {
        var m = /^contract:(\d+)$/.exec(action || '');
        if (m) {
            this.lookup('versionGrid').getFilterPanel().applyValues({ contractId: Number(m[1]) }, true);
        }
    }
});
