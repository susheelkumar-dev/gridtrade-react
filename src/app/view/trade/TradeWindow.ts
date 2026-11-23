/*
 * Ported from app/view/trade/TradeWindow.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** Pop-up trade ticket with a live notional value. Settled and cancelled trades open read-only. */
Ext.define('GT.view.trade.TradeWindow', {
    extend: 'GT.ux.window.EntryWindow',
    xtype: 'gt-tradewindow',
    requires: ['GT.ux.form.LookupCombo', 'GT.ux.form.DateRange', 'GT.util.Format', 'Ext.form.RadioGroup', 'Ext.form.field.Radio',
        'Ext.form.field.Number', 'Ext.form.field.TextArea', 'Ext.form.field.Display', 'Ext.form.field.ComboBox'],

    width: 780,
    height: 600,
    iconCls: 'x-fa fa-exchange-alt',
    editPermission: 'trades.edit',
    auditEntityType: 'Trade',
    successMessage: 'Trade saved',

    initComponent: function () {
        var me = this;
        var rec = me.record;
        var status = rec.get('status');
        me.readOnly = status === 'Settled' || status === 'Cancelled';
        me.title = rec.phantom ? 'New Trade' : 'Trade ' + rec.get('tradeRef') + ' · ' + status;
        me.formItems = [
            { xtype: 'datefield', name: 'tradeDate', fieldLabel: 'Trade Date', allowBlank: false, width: 330, anchor: null },
            { xtype: 'radiogroup', fieldLabel: 'Buy / Sell', columns: 2, width: 330, anchor: null, allowBlank: false,
                items: [{ boxLabel: 'Buy', name: 'buySell', inputValue: 'Buy' }, { boxLabel: 'Sell', name: 'buySell', inputValue: 'Sell' }] },
            { xtype: 'gt-lookup', name: 'counterpartyId', fieldLabel: 'Counterparty', lookupType: 'counterparties', enabledOnly: true, editScreen: 'counterparties', allowBlank: false },
            { xtype: 'gt-lookup', name: 'product', fieldLabel: 'Product', lookupType: 'marketProducts', allowBlank: false, editable: false, width: 330, anchor: null },
            { xtype: 'gt-daterange', fieldLabel: 'Delivery', startName: 'deliveryStart', endName: 'deliveryEnd', allowBlank: false },
            { xtype: 'combobox', name: 'block', fieldLabel: 'Time Block', editable: false, width: 330, anchor: null,
                store: ['00:00-24:00', '00:00-06:00', '06:00-18:00', '18:00-23:00', '09:00-17:00'] },
            { xtype: 'numberfield', name: 'volumeMw', fieldLabel: 'Volume (MW)', allowBlank: false, minValue: 0.1, decimalPrecision: 1, width: 330, anchor: null },
            { xtype: 'numberfield', name: 'priceInrMwh', fieldLabel: 'Price (₹/MWh)', allowBlank: false, minValue: 0, maxValue: 10000, width: 330, anchor: null,
                maxText: 'Above the ₹ 10,000/MWh exchange price cap' },
            { xtype: 'displayfield', fieldLabel: 'Notional', itemId: 'notional', cls: 'gt-notional' },
            { xtype: 'gt-lookup', name: 'contractId', fieldLabel: 'Linked Contract', lookupType: 'contracts', emptyText: 'Optional' },
            { xtype: 'textareafield', name: 'comments', fieldLabel: 'Comments', height: 70 }
        ];
        me.callParent(arguments);
        me.form.getForm().getFields().each(function (f) { f.on('change', me.updateNotional, me, { buffer: 50 }); });
        me.updateNotional();
    },

    afterRecordSaved: function (rec) {
        this.setTitle('Trade ' + rec.get('tradeRef') + ' \u00B7 ' + rec.get('status'));
    },

    /** Volume x hours in the block x delivery days x price. Mirrors the server's notional. */
    updateNotional: function () {
        var form = this.form && this.form.getForm();
        if (!form) { return; }
        var v = form.getFieldValues();
        var m = /^(\d\d):\d\d-(\d\d):\d\d$/.exec(v.block || '');
        var hours = m ? Number(m[2]) - Number(m[1]) : 24;
        var days = v.deliveryStart && v.deliveryEnd ? Math.max(1, Math.round((v.deliveryEnd - v.deliveryStart) / 86400000) + 1) : 1;
        var notional = (v.volumeMw || 0) * hours * days * (v.priceInrMwh || 0);
        var mwh = (v.volumeMw || 0) * hours * days;
        this.down('#notional').setValue(notional
            ? '<b>' + GT.util.Format.inr(notional) + '</b> <span class="gt-muted">(' + GT.util.Format.indian(mwh, 1) + ' MWh over ' + days + ' day' + (days > 1 ? 's' : '') + ')</span>'
            : '<span class="gt-muted">Enter volume and price</span>');
    }
});
