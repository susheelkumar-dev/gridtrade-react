/*
 * Ported from app/view/audit/AuditTrailController.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.view.audit.AuditTrailController', {
    extend: 'GT.core.BaseController',
    alias: 'controller.audittrail',
    requires: ['GT.ux.audit.CompareWindow'],

    onSelectionChange: function (sm, selected) {
        this.getViewModel().set('selCount', selected.length);
    },

    onView: function () {
        var rec = this.lookup('auditGrid').getSelectedRecord();
        if (rec) { GT.ux.audit.CompareWindow.showEntry(rec.getId()); }
    },

    onRowDblClick: function (view, rec) {
        GT.ux.audit.CompareWindow.showEntry(rec.getId());
    },

    onCompare: function () {
        var ids = Ext.Array.map(this.lookup('auditGrid').getSelection(), function (r) { return r.getId(); });
        GT.ux.audit.CompareWindow.showEntries(ids);
    },

    /** Contracts and series open their screens; everything else shows the change itself. */
    onLink: function (grid, rec) {
        var type = rec.get('entityType');
        if (rec.get('action') !== 'DELETE' && (type === 'Contract')) {
            this.openScreen('contract', rec.get('entityId'));
        } else if (type === 'Time Series Data' || type === 'Time Series') {
            this.openScreen('tsdata', rec.get('entityId'));
        } else {
            GT.ux.audit.CompareWindow.showEntry(rec.getId());
        }
    }
});
