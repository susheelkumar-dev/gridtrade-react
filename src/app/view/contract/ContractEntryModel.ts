/*
 * Ported from app/view/contract/ContractEntryModel.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.view.contract.ContractEntryModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.contractentry',
    requires: ['GT.util.Format'],

    data: {
        contract: null,
        status: 'Draft',
        version: 1,
        isNew: true,
        audit: null
    },

    formulas: {
        canApprove: function (get) { return !get('isNew') && get('status') === 'Validated'; },
        canDelete: function (get) { return !get('isNew') && get('status') !== 'Approved'; },
        headerHtml: function (get) {
            if (get('isNew')) { return GT.util.Format.chip('Draft') + ' <span class="gt-muted">Not saved yet</span>'; }
            return GT.util.Format.chip(get('status')) + ' <span class="gt-muted">Version ' + get('version') + '</span>';
        },
        auditHtml: function (get) {
            var a = get('audit');
            if (!a) { return '<span class="gt-muted">New contract</span>'; }
            var F = GT.util.Format;
            return 'Created by ' + a.createdBy + ', ' + F.dateTime(a.createdAt) +
                (a.updatedBy ? '<br>Last change by ' + a.updatedBy + ', ' + F.dateTime(a.updatedAt) : '') +
                (a.approvedBy ? '<br>Approved by ' + a.approvedBy : '');
        }
    }
});
