/*
 * Ported from app/view/contract/ContractSummary.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Contract Summary: all contracts in a generic grid; the filter icon in its title bar opens the filter pop-up. The contract name is a link
 * that opens the contract entry tab; the component count opens the same tab on its components.
 */
Ext.define('GT.view.contract.ContractSummary', {
    extend: 'Ext.panel.Panel',
    xtype: 'gt-contractsummary',
    requires: [
        'GT.view.contract.ContractSummaryController', 'GT.store.Contracts', 'GT.ux.grid.GenericGrid',
        'GT.ux.form.LookupCombo', 'GT.ux.form.DateRange', 'GT.util.Format', 'Ext.form.field.ComboBox', 'Ext.form.field.Text'
    ],

    controller: 'contractsummary',
    viewModel: true,
    layout: 'fit',
    listeners: { screenaction: 'onScreenAction' },

    items: [{
        xtype: 'gt-genericgrid',
        reference: 'contractGrid',
        title: 'Contract Summary',
        exportFileName: 'Contracts',
        stateful: true,
        stateId: 'gt-contract-summary-v3',
        enableFilterRow: true,
        enableGrouping: true,
        groupHeaderTpl: '{name} · {rows.length} contract{[values.rows.length === 1 ? "" : "s"]}',
        groupByOptions: [['type', 'Contract type'], ['status', 'Status'], ['counterpartyName', 'Counterparty'], ['legalEntityName', 'Legal entity']],
        enableContextMenu: true,
        contextMenuItems: function (rec, grid) { return grid.lookupController().contextItems(rec); },
        filterPanel: {
            stateKey: 'contracts',
            items: [
                { xtype: 'textfield', name: 'name', fieldLabel: 'Name contains' },
                { xtype: 'gt-lookup', name: 'counterpartyId', fieldLabel: 'Counterparty', lookupType: 'counterparties', emptyText: 'All' },
                { xtype: 'gt-lookup', name: 'legalEntityId', fieldLabel: 'Legal Entity', lookupType: 'legalEntities', emptyText: 'All' },
                { xtype: 'gt-lookup', name: 'type', fieldLabel: 'Contract Type', lookupType: 'contractTypes', emptyText: 'All' },
                { xtype: 'combobox', name: 'status', fieldLabel: 'Status', emptyText: 'All', editable: false,
                    store: [['Draft', 'Draft'], ['Validated', 'Validated'], ['Approved', 'Approved'], ['Pending', 'Pending (not approved)']] },
                { xtype: 'gt-daterange', fieldLabel: 'Delivery overlaps', startName: 'from', endName: 'to' },
                { xtype: 'combobox', name: 'studyContract', fieldLabel: 'Study contracts', editable: false, value: 'ALL',
                    store: [['ALL', 'All'], ['false', 'Exclude study'], ['true', 'Only study']] }
            ]
        },
        store: { type: 'gt-contracts' },
        toolbarActions: [
            { text: 'New Contract', iconCls: 'x-fa fa-plus', handler: 'onNew', permission: 'contracts.edit' },
            { text: 'Open', iconCls: 'x-fa fa-folder-open', handler: 'onOpen', bind: { disabled: '{!contractGrid.selection}' } },
            { text: 'Versions', iconCls: 'x-fa fa-code-branch', handler: 'onVersions', bind: { disabled: '{!contractGrid.selection}' } }
        ],
        listeners: { linkclick: 'onLink', itemdblclick: 'onOpen' },
        columns: {
            defaults: { filter: 'string' },
            items: [
                { text: 'Name', dataIndex: 'name', xtype: 'gt-linkcolumn', width: 210, locked: true },
                { text: 'Ver.', dataIndex: 'version', width: 64, align: 'right', filter: 'number' },
                { text: 'Status', dataIndex: 'status', xtype: 'gt-statuscolumn', width: 110 },
                { text: 'Counterparty', dataIndex: 'counterpartyName', width: 190, filter: 'list' },
                { text: 'Legal Entity', dataIndex: 'legalEntityName', width: 210, filter: 'list' },
                { text: 'Type', dataIndex: 'type', width: 150, filter: 'list' },
                { text: 'Txn', dataIndex: 'transactionType', width: 90, filter: 'list' },
                { text: 'Start', dataIndex: 'startDate', xtype: 'datecolumn', width: 110, filter: 'date' },
                { text: 'End', dataIndex: 'endDate', xtype: 'datecolumn', width: 110, filter: 'date' },
                { text: 'MW', dataIndex: 'contractedMw', width: 80, align: 'right', xtype: 'numbercolumn', format: '0,000.0', filter: 'number',
                    summaryType: 'sum', summaryRenderer: function (v) { return '<b>' + Ext.util.Format.number(v, '0,000.0') + '</b>'; } },
                { text: 'Validated', dataIndex: 'validated', xtype: 'booleancolumn', trueText: 'Yes', falseText: 'No', width: 96, align: 'center', filter: 'boolean' },
                { text: 'Study', dataIndex: 'studyContract', xtype: 'booleancolumn', trueText: 'Yes', falseText: 'No', width: 80, align: 'center', filter: 'boolean' },
                { text: 'Delivery Node', dataIndex: 'nodeName', width: 170, filter: 'list' },
                { text: 'Commodities', dataIndex: 'commodityList', width: 220 },
                { text: 'Components', dataIndex: 'componentCount', width: 104, align: 'right', filter: 'number' },
                { text: 'Internal Ref', dataIndex: 'internalRef', width: 130, hidden: true },
                { text: 'Updated', dataIndex: 'updatedAt', width: 140, renderer: GT.util.Format.dateTime, filter: 'date', hidden: true },
                { text: 'Updated By', dataIndex: 'updatedBy', width: 120, hidden: true }
            ]
        }
    }]
});
