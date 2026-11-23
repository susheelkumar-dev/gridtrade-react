/*
 * Ported from app/view/trade/TradeBlotter.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** Trade blotter grouped by product with subtotals; trades open in a pop-up entry window. */
Ext.define('GT.view.trade.TradeBlotter', {
    extend: 'Ext.panel.Panel',
    xtype: 'gt-tradeblotter',
    requires: ['GT.view.trade.TradeBlotterController', 'GT.view.trade.TradeWindow', 'GT.store.Trades', 'GT.ux.grid.GenericGrid',
        'GT.ux.form.LookupCombo', 'GT.util.Format', 'Ext.form.field.Date'],

    controller: 'tradeblotter',
    viewModel: {
        data: { selectedStatus: null },
        formulas: {
            canConfirm: function (get) { return get('selectedStatus') === 'New'; },
            canCancel: function (get) { var s = get('selectedStatus'); return s === 'New' || s === 'Confirmed'; }
        }
    },
    layout: 'fit',
    listeners: { screenaction: 'onScreenAction' },

    items: [{
        xtype: 'gt-genericgrid',
        reference: 'tradeGrid',
        title: 'Trade Blotter',
        exportFileName: 'Trades',
        stateful: true,
        stateId: 'gt-trade-blotter-v2',
        enableFilterRow: true,
        enableContextMenu: true,
        contextMenuItems: function (rec, grid) { return grid.lookupController().contextItems(rec); },
        rowCls: function (rec) { return rec.get('status') === 'Cancelled' ? 'gt-row-cancelled' : ''; },
        store: { type: 'gt-trades' },
        enableGrouping: true,
        groupHeaderTpl: '{name} · {rows.length} trade{[values.rows.length === 1 ? "" : "s"]}',
        groupByOptions: [['product', 'Product'], ['counterpartyName', 'Counterparty'], ['status', 'Status'], ['buySell', 'Buy / Sell'], ['trader', 'Trader']],
        enableSummaryRow: true,
        rowBodyTpl: [
            '<div class="gt-row-detail">',
            '<b>{tradeRef}</b> · {buySell} {volumeMw:number("0,000.0")} MW {product} for {block} with <b>{counterpartyName}</b>',
            '<br>Delivery {deliveryStart:date("d-M-Y")} → {deliveryEnd:date("d-M-Y")} · entered by {trader} ({source})',
            '<tpl if="contractName"><br>Linked contract: {contractName}</tpl>',
            '<tpl if="comments"><br><i>{comments}</i></tpl>',
            '</div>'
        ],
        toolbarActions: [
            { text: 'New Trade', iconCls: 'x-fa fa-plus', handler: 'onNew', permission: 'trades.edit' },
            { text: 'Confirm', iconCls: 'x-fa fa-check', handler: 'onConfirm', bind: { disabled: '{!canConfirm}' }, permission: 'trades.approve' },
            { text: 'Cancel Trade', iconCls: 'x-fa fa-ban', handler: 'onCancelTrade', bind: { disabled: '{!canCancel}' }, permission: 'trades.approve' },
            { text: 'Delete', iconCls: 'x-fa fa-trash-alt', handler: 'onDelete', bind: { disabled: '{!canConfirm}' }, permission: 'trades.delete' }
        ],
        dockedItems: [{
            xtype: 'toolbar', dock: 'top', cls: 'gt-filter-bar', reference: 'filterBar',
            defaults: { labelAlign: 'right', labelWidth: 70 },
            items: [
                { xtype: 'datefield', reference: 'fromDate', fieldLabel: 'Traded', labelWidth: 52, width: 200 },
                { xtype: 'datefield', reference: 'toDate', fieldLabel: 'to', labelWidth: 20, width: 168 },
                { xtype: 'gt-lookup', reference: 'productFilter', fieldLabel: 'Product', labelWidth: 56, width: 180, lookupType: 'marketProducts', emptyText: 'All' },
                { xtype: 'gt-lookup', reference: 'statusFilter', fieldLabel: 'Status', labelWidth: 50, width: 170, lookupType: 'tradeStatuses', emptyText: 'All' },
                { xtype: 'gt-lookup', reference: 'cpFilter', fieldLabel: 'Counterparty', labelWidth: 90, width: 290, lookupType: 'counterparties', emptyText: 'All' },
                { text: 'Apply', iconCls: 'x-fa fa-search', handler: 'loadTrades' },
                { text: 'Clear', iconCls: 'x-fa fa-undo', handler: 'onClearFilters' }
            ]
        }],
        listeners: { linkclick: 'onLink', itemdblclick: 'onOpen', selectionchange: 'onSelectionChange' },
        columns: [
            { text: 'Trade Ref', dataIndex: 'tradeRef', xtype: 'gt-linkcolumn', width: 170, filter: 'string', locked: true,
                summaryType: 'count', summaryRenderer: function (v) { return '<b>' + v + ' trade' + (v === 1 ? '' : 's') + '</b>'; } },
            { text: 'Trade Date', dataIndex: 'tradeDate', xtype: 'datecolumn', width: 112, filter: 'date' },
            { text: 'B/S', dataIndex: 'buySell', width: 70, filter: 'list', renderer: function (v) { return '<span class="gt-side gt-side-' + String(v).toLowerCase() + '">' + v + '</span>'; } },
            { text: 'Counterparty', dataIndex: 'counterpartyName', width: 190, filter: 'list' },
            { text: 'Product', dataIndex: 'product', width: 90, filter: 'list' },
            { text: 'Delivery', dataIndex: 'deliveryStart', width: 190, renderer: function (v, m, r) {
                var F = GT.util.Format;
                return F.date(v) + (r.get('deliveryEnd') && +r.get('deliveryEnd') !== +v ? ' – ' + F.date(r.get('deliveryEnd')) : '');
            } },
            { text: 'Block', dataIndex: 'block', width: 110 },
            { text: 'Volume MW', dataIndex: 'volumeMw', xtype: 'numbercolumn', format: '0,000.0', align: 'right', width: 110, filter: 'number',
                summaryType: 'sum', summaryRenderer: function (v) { return '<b>' + Ext.util.Format.number(v, '0,000.0') + '</b>'; } },
            { text: 'Price ₹/MWh', dataIndex: 'priceInrMwh', align: 'right', width: 120, renderer: GT.util.Format.indian, filter: 'number',
                summaryType: 'average', summaryRenderer: function (v) { return 'avg ' + GT.util.Format.indian(v); } },
            { text: 'Notional ₹', dataIndex: 'notionalInr', align: 'right', width: 150, renderer: GT.util.Format.indian, filter: 'number',
                summaryType: 'sum', summaryRenderer: function (v) { return '<b>' + GT.util.Format.indian(v) + '</b>'; } },
            { text: 'Status', dataIndex: 'status', xtype: 'gt-statuscolumn', width: 110 },
            { text: 'Contract', dataIndex: 'contractName', xtype: 'gt-linkcolumn', width: 180, filter: 'string' },
            { text: 'Trader', dataIndex: 'trader', width: 120, filter: 'list' },
            { text: 'Source', dataIndex: 'source', width: 100, filter: 'list', hidden: true },
            { text: 'Comments', dataIndex: 'comments', width: 200, hidden: true }
        ]
    }]
});
