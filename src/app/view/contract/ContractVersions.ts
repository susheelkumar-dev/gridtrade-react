/*
 * Ported from app/view/contract/ContractVersions.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** Every saved version of every contract. Tick two or more versions of one contract to compare them. */
Ext.define('GT.view.contract.ContractVersions', {
    extend: 'Ext.panel.Panel',
    xtype: 'gt-contractversions',
    requires: ['GT.view.contract.ContractVersionsController', 'GT.store.ContractVersions', 'GT.ux.grid.GenericGrid',
        'GT.ux.form.LookupCombo', 'GT.ux.form.DateRange', 'GT.util.Format', 'Ext.selection.CheckboxModel'],

    controller: 'contractversions',
    viewModel: true,
    layout: 'fit',
    listeners: { screenaction: 'onScreenAction' },

    items: [{
        xtype: 'gt-genericgrid',
        reference: 'versionGrid',
        title: 'Contract Versions',
        exportFileName: 'Contract versions',
        enableFilterRow: true,
        filterPanel: {
            items: [
                { xtype: 'gt-lookup', name: 'contractId', fieldLabel: 'Contract', lookupType: 'contracts', emptyText: 'All' },
                { xtype: 'gt-lookup', name: 'legalEntityId', fieldLabel: 'Legal Entity', lookupType: 'legalEntities', emptyText: 'All' },
                { xtype: 'gt-daterange', fieldLabel: 'Created', startName: 'from', endName: 'to' }
            ]
        },
        store: { type: 'gt-versions', sorters: [{ property: 'createdAt', direction: 'DESC' }] },
        selModel: { type: 'checkboxmodel', checkOnly: false },
        toolbarActions: [
            { text: 'Compare selected', iconCls: 'x-fa fa-columns', handler: 'onCompare', bind: { disabled: '{!versionGrid.selection}' } }
        ],
        listeners: { linkclick: 'onLink' },
        columns: [
            { text: 'Contract', dataIndex: 'contractName', xtype: 'gt-linkcolumn', width: 230, filter: 'list' },
            { text: 'Version', dataIndex: 'version', width: 90, align: 'right', filter: 'number' },
            { text: 'Legal Entity', dataIndex: 'legalEntityName', width: 220, filter: 'list' },
            { text: 'Effective Date', dataIndex: 'effectiveDate', xtype: 'datecolumn', width: 130, filter: 'date' },
            { text: 'Created', dataIndex: 'createdAt', width: 150, renderer: GT.util.Format.dateTime, filter: 'date' },
            { text: 'Created By', dataIndex: 'createdBy', width: 130, filter: 'list' },
            { text: 'Comment', dataIndex: 'comment', flex: 1, minWidth: 220, filter: 'string' }
        ]
    }]
});
