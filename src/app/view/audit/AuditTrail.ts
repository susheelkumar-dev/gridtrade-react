/*
 * Ported from app/view/audit/AuditTrail.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Audit trail across all entities: who changed what, when, from where and why. View one change as
 * before/after, or tick several changes of the same record to compare them side by side.
 */
Ext.define('GT.view.audit.AuditTrail', {
    extend: 'Ext.panel.Panel',
    xtype: 'gt-audittrail',
    requires: ['GT.view.audit.AuditTrailController', 'GT.store.AuditEntries', 'GT.ux.grid.GenericGrid',
        'GT.ux.form.LookupCombo', 'GT.ux.form.DateRange', 'GT.util.Format', 'Ext.selection.CheckboxModel'],

    controller: 'audittrail',
    viewModel: {
        data: { selCount: 0 },
        formulas: {
            oneSelected: function (get) { return get('selCount') === 1; },
            manySelected: function (get) { return get('selCount') > 1; }
        }
    },
    layout: 'fit',

    items: [{
        xtype: 'gt-genericgrid',
        reference: 'auditGrid',
        title: 'Audit Trail',
        exportFileName: 'Audit trail',
        stateful: true,
        stateId: 'gt-audit-trail-v3',
        enableFilterRow: true,
        rowBodyTpl: [
            '<div class="gt-row-detail">',
            '<b>{action}</b> of {entityType} <b>{entityName}</b> (#{entityId}) by {user} from {ip} on {at:date("d-M-Y H:i:s")}',
            '<tpl if="reason"><br>Reason: <i>{reason}</i></tpl>',
            '<tpl if="changed"><br>Changed: {changed}</tpl>',
            '</div>'
        ],
        filterPanel: {
            stateKey: 'audit',
            items: [
                { xtype: 'gt-lookup', name: 'entityType', fieldLabel: 'Record type', lookupType: 'entityTypes', emptyText: 'All' },
                { xtype: 'textfield', name: 'query', fieldLabel: 'Record name contains' },
                { xtype: 'gt-lookup', name: 'user', fieldLabel: 'User', lookupType: 'users', emptyText: 'All' },
                { xtype: 'combobox', name: 'action', fieldLabel: 'Action', editable: false, emptyText: 'All', store: ['INSERT', 'UPDATE', 'DELETE'] },
                { xtype: 'gt-daterange', fieldLabel: 'Changed between', startName: 'from', endName: 'to' }
            ]
        },
        store: { type: 'gt-audit', sorters: [{ property: 'at', direction: 'DESC' }] },
        selModel: { type: 'checkboxmodel', checkOnly: false },
        toolbarActions: [
            { text: 'View change', iconCls: 'x-fa fa-eye', handler: 'onView', bind: { disabled: '{!oneSelected}' } },
            { text: 'Compare selected', iconCls: 'x-fa fa-columns', handler: 'onCompare', bind: { disabled: '{!manySelected}' } }
        ],
        listeners: { linkclick: 'onLink', selectionchange: 'onSelectionChange', itemdblclick: 'onRowDblClick' },
        columns: [
            { text: 'When', dataIndex: 'at', width: 150, renderer: GT.util.Format.dateTime, filter: 'date' },
            { text: 'Record Type', dataIndex: 'entityType', width: 150, filter: 'list' },
            { text: 'Record', dataIndex: 'entityName', xtype: 'gt-linkcolumn', width: 240, filter: 'string' },
            { text: 'Id', dataIndex: 'entityId', width: 70, align: 'right', filter: 'number' },
            { text: 'Action', dataIndex: 'action', xtype: 'gt-statuscolumn', width: 100 },
            { text: 'User', dataIndex: 'user', width: 120, filter: 'list' },
            { text: 'IP Address', dataIndex: 'ip', width: 120 },
            { text: 'Reason', dataIndex: 'reason', width: 220, filter: 'string' },
            { text: 'Changed Fields', dataIndex: 'changed', flex: 1, minWidth: 220, filter: 'string' }
        ]
    }]
});
