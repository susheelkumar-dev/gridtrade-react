/*
 * Ported from app/view/contract/ContractSummaryController.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.view.contract.ContractSummaryController', {
    extend: 'GT.core.BaseController',
    alias: 'controller.contractsummary',

    init: function () {
        // Refresh when contracts change in another tab (save, validate, approve, delete).
        Ext.GlobalEvents.on('gt-datachanged', this.onDataChanged, this);
    },

    destroy: function () {
        Ext.GlobalEvents.un('gt-datachanged', this.onDataChanged, this);
        this.callParent();
    },

    onDataChanged: function (entity) {
        if (entity === 'Contract') {
            this.lookup('contractGrid').getStore().load();
        }
    },

    /** Right-click items for a contract (the grid adds Copy first). */
    contextItems: function (rec) {
        var me = this;
        return [
            { text: 'Open contract', iconCls: 'x-fa fa-folder-open', handler: function () { me.openScreen('contract', rec.getId()); } },
            { text: 'Show versions', iconCls: 'x-fa fa-code-branch', handler: function () { Ext.GlobalEvents.fireEvent('gt-openscreen', 'versions', null, 'contract:' + rec.getId()); } },
            { text: 'Show change history', iconCls: 'x-fa fa-history', handler: function () {
                var win = GT.util.Screens.openInWindow('audit');
                if (win) { win.down('gt-genericgrid').getFilterPanel().applyValues({ entityType: 'Contract', query: rec.get('name') }, true); }
            } }
        ];
    },

    onLink: function (grid, rec) {
        this.openScreen('contract', rec.getId());
    },

    onOpen: function () {
        var rec = this.lookup('contractGrid').getSelectedRecord();
        if (rec) { this.openScreen('contract', rec.getId()); }
    },

    onNew: function () {
        this.openScreen('contract', 'new');
    },

    onVersions: function () {
        var rec = this.lookup('contractGrid').getSelectedRecord();
        if (rec) { Ext.GlobalEvents.fireEvent('gt-openscreen', 'versions', null, 'contract:' + rec.getId()); }
    },

    /** Dashboard shortcut: "contracts awaiting approval". */
    onScreenAction: function (view, action) {
        if (action === 'pending') {
            this.lookup('contractGrid').getFilterPanel().applyValues({ status: 'Pending' }, true);
        }
    }
});
