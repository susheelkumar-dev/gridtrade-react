/*
 * Ported from app/view/contract/ContractEntry.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Contract entry: header form on the left, product components (master-detail with pop-up entry),
 * notes, validation results and linked trades in tabs, and the record's audit in a collapsible panel.
 */
Ext.define('GT.view.contract.ContractEntry', {
    extend: 'Ext.panel.Panel',
    xtype: 'gt-contractentry',
    requires: [
        'GT.view.contract.ContractEntryController', 'GT.view.contract.ContractEntryModel', 'GT.view.contract.ComponentWindow',
        'GT.store.Components', 'GT.store.Trades', 'GT.ux.form.EntryForm', 'GT.ux.form.LookupCombo', 'GT.ux.form.LookupTag',
        'GT.ux.form.DateRange', 'GT.ux.grid.GenericGrid', 'GT.ux.audit.RecentChanges', 'GT.util.Format',
        'Ext.form.field.Number', 'Ext.form.field.TextArea', 'Ext.form.field.Checkbox', 'Ext.form.field.Display'
    ],

    controller: 'contractentry',
    viewModel: 'contractentry',
    layout: 'border',
    cls: 'gt-contractentry',
    listeners: { beforeclose: 'onBeforeClose' },

    tbar: {
        cls: 'gt-screen-tbar',
        items: [
            { text: 'Save', iconCls: 'x-fa fa-save', cls: 'gt-btn-primary', handler: 'onSave', reference: 'saveBtn', permission: 'contracts.edit' },
            { text: 'Validate', iconCls: 'x-fa fa-check-circle', handler: 'onValidate', bind: { disabled: '{isNew}' }, permission: 'contracts.edit' },
            { text: 'Approve', iconCls: 'x-fa fa-thumbs-up', handler: 'onApprove', bind: { disabled: '{!canApprove}' }, permission: 'contracts.approve' },
            '-',
            { text: 'Versions', iconCls: 'x-fa fa-code-branch', handler: 'onVersions', bind: { disabled: '{isNew}' } },
            { text: 'Reload', iconCls: 'x-fa fa-sync-alt', handler: 'onReload', bind: { disabled: '{isNew}' } },
            { text: 'Delete', iconCls: 'x-fa fa-trash-alt', handler: 'onDelete', bind: { disabled: '{!canDelete}' }, permission: 'contracts.delete' },
            '->',
            { xtype: 'tbtext', bind: { html: '{headerHtml}' }, cls: 'gt-entry-status' }
        ]
    },

    items: [{
        xtype: 'gt-entryform',
        region: 'west',
        reference: 'contractForm',
        title: 'Contract',
        iconCls: 'x-fa fa-file-alt',
        width: 470,
        split: true,
        collapsible: true,
        items: [
            { xtype: 'textfield', name: 'name', fieldLabel: 'Name', allowBlank: false, maxLength: 80 },
            { xtype: 'gt-lookup', name: 'type', fieldLabel: 'Type', lookupType: 'contractTypes', allowBlank: false, reference: 'typeField',
                listeners: { change: 'onTypeChange' } },
            { xtype: 'textfield', name: 'internalRef', fieldLabel: 'Internal Reference', emptyText: 'Generated when saved' },
            { xtype: 'gt-lookup', name: 'transactionType', fieldLabel: 'Transaction Type', lookupType: 'transactionTypes', allowBlank: false },
            { xtype: 'gt-lookup', name: 'counterpartyId', fieldLabel: 'Counterparty', lookupType: 'counterparties', enabledOnly: true,
                editScreen: 'counterparties', allowBlank: false },
            { xtype: 'textfield', name: 'marketParticipant', fieldLabel: 'Market Participant', emptyText: 'e.g. MP-GTE-01' },
            { xtype: 'textfield', name: 'orderOfAccount', fieldLabel: 'Order Of Account' },
            { xtype: 'gt-lookup', name: 'legalEntityId', fieldLabel: 'Legal Entity', lookupType: 'legalEntities', enabledOnly: true,
                editScreen: 'legalEntities', allowBlank: false },
            { xtype: 'checkbox', name: 'studyContract', fieldLabel: 'Study Contract', boxLabel: 'What-if only (excluded from positions)', inputValue: true, uncheckedValue: false },
            { xtype: 'gt-lookup', name: 'timeZone', fieldLabel: 'Time Zone', lookupType: 'timeZones', allowBlank: false, editable: false },
            { xtype: 'datefield', name: 'effectiveDate', fieldLabel: 'Effective Date', allowBlank: false },
            { xtype: 'gt-daterange', fieldLabel: 'Delivery Period', startName: 'startDate', endName: 'endDate', allowBlank: false },
            { xtype: 'gt-lookuptag', name: 'commodities', fieldLabel: 'Commodities', lookupType: 'commodities', enabledOnly: true,
                editScreen: 'commodities', allowBlank: false, reference: 'commoditiesField' },
            { xtype: 'gt-lookup', name: 'nodeId', fieldLabel: 'Delivery Node', lookupType: 'nodes' },
            { xtype: 'gt-lookup', name: 'meterId', fieldLabel: 'Meter Series', lookupType: 'timeseries', editScreen: 'timeseries' },
            { xtype: 'gt-lookup', name: 'holidayCalendar', fieldLabel: 'Holiday Calendar', lookupType: 'holidayCalendars' },
            { xtype: 'numberfield', name: 'contractedMw', fieldLabel: 'Contracted MW', minValue: 0.1, decimalPrecision: 1 },
            { xtype: 'textfield', name: 'versionComment', fieldLabel: 'Change Comment', emptyText: 'Why are you changing this contract?',
                bind: { hidden: '{isNew}' }, submitValue: true },
            { xtype: 'displayfield', fieldLabel: 'Audit', bind: { value: '{auditHtml}' }, cls: 'gt-audit-stamp' }
        ]
    }, {
        xtype: 'tabpanel',
        region: 'center',
        reference: 'detailTabs',
        cls: 'gt-detail-tabs',
        items: [{
            title: 'Products & Components',
            iconCls: 'x-fa fa-cubes',
            layout: { type: 'vbox', align: 'stretch' },
            items: [{
                xtype: 'component', reference: 'validationBanner', hidden: true, cls: 'gt-banner'
            }, {
                xtype: 'gt-genericgrid',
                reference: 'componentGrid',
                flex: 1,
                exportFileName: 'Contract components',
                emptyMessage: 'No components yet. Save the contract, then add its price and volume components.',
                enableColumnFilters: false,
                store: { type: 'gt-components' },
                toolbarActions: [
                    { text: 'Add Component', iconCls: 'x-fa fa-plus', handler: 'onAddComponent', bind: { disabled: '{isNew}' }, permission: 'contracts.edit' },
                    { text: 'Edit', iconCls: 'x-fa fa-pencil-alt', handler: 'onEditComponent', bind: { disabled: '{!componentGrid.selection}' } },
                    { text: 'Remove', iconCls: 'x-fa fa-trash-alt', handler: 'onDeleteComponent', bind: { disabled: '{!componentGrid.selection}' }, permission: 'contracts.edit' }
                ],
                listeners: { linkclick: 'onComponentLink', itemdblclick: 'onEditComponent' },
                columns: [
                    { text: 'Name', dataIndex: 'name', xtype: 'gt-linkcolumn', flex: 1, minWidth: 200 },
                    { text: 'Type', dataIndex: 'type', width: 150 },
                    { text: 'Commodity', dataIndex: 'commodity', width: 150 },
                    { text: 'Product', dataIndex: 'product', width: 140 },
                    { text: 'Granularity', dataIndex: 'granularity', width: 110 },
                    { text: 'Pricing / Reference', dataIndex: 'pricing', flex: 1, minWidth: 200 },
                    { text: 'Usage', dataIndex: 'usage', width: 90 }
                ]
            }]
        }, {
            title: 'Notes',
            iconCls: 'x-fa fa-sticky-note',
            layout: 'fit',
            bodyPadding: 12,
            items: [{ xtype: 'textareafield', reference: 'notesField', emptyText: 'Free-text notes saved with the contract' }]
        }, {
            title: 'Validation',
            iconCls: 'x-fa fa-check-square',
            xtype: 'gt-genericgrid',
            toolsPosition: 'toolbar',
            enableColumnFilters: false,
            enableColumnChooser: false,
            emptyMessage: 'Run Validate to check the contract against the business rules',
            store: { fields: ['level', 'field', 'message'], data: [] },
            reference: 'validationGrid',
            columns: [
                { text: 'Level', dataIndex: 'level', xtype: 'gt-statuscolumn', width: 110 },
                { text: 'Field', dataIndex: 'field', width: 160, renderer: function (v) { return v ? GT.util.Format.label(v.replace(/Id$/, '')) : 'Contract'; } },
                { text: 'Message', dataIndex: 'message', flex: 1 }
            ]
        }, {
            title: 'Linked Trades',
            iconCls: 'x-fa fa-exchange-alt',
            xtype: 'gt-genericgrid',
            toolsPosition: 'toolbar',
            reference: 'tradeGrid',
            enableColumnFilters: false,
            emptyMessage: 'No trades are linked to this contract',
            store: { type: 'gt-trades', groupField: null },
            columns: [
                { text: 'Trade Ref', dataIndex: 'tradeRef', width: 170 },
                { text: 'Trade Date', dataIndex: 'tradeDate', xtype: 'datecolumn', width: 110 },
                { text: 'B/S', dataIndex: 'buySell', width: 64 },
                { text: 'Product', dataIndex: 'product', width: 90 },
                { text: 'Volume MW', dataIndex: 'volumeMw', xtype: 'numbercolumn', format: '0,000.0', align: 'right', width: 110 },
                { text: 'Price ₹/MWh', dataIndex: 'priceInrMwh', align: 'right', width: 120, renderer: GT.util.Format.indian },
                { text: 'Status', dataIndex: 'status', xtype: 'gt-statuscolumn' }
            ]
        }]
    }, {
        xtype: 'gt-recentchanges',
        region: 'east',
        reference: 'recentChanges',
        width: 340,
        split: true,
        collapsible: true,
        collapsed: true,
        titleCollapse: true,
        entityType: 'Contract'
    }]
});
