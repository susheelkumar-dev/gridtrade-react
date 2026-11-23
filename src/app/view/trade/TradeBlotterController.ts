/*
 * Ported from app/view/trade/TradeBlotterController.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Loads trades with the filter bar's values (controller-driven, unlike the summary screens that use a
 * filter panel), runs the confirm/cancel workflow through the API, and opens trades in pop-ups.
 */
Ext.define('GT.view.trade.TradeBlotterController', {
    extend: 'GT.core.BaseController',
    alias: 'controller.tradeblotter',
    requires: ['GT.model.Trade'],

    init: function () {
        this.onClearFilters();
        Ext.GlobalEvents.on('gt-datachanged', this.onDataChanged, this);
    },

    destroy: function () {
        Ext.GlobalEvents.un('gt-datachanged', this.onDataChanged, this);
        this.callParent();
    },

    onDataChanged: function (entity) {
        if (entity === 'Trade') { this.loadTrades(); }
    },

    onScreenAction: function (view, action) {
        if (action === 'new') { this.onNew(); }
    },

    onClearFilters: function () {
        this.lookup('fromDate').setValue(Ext.Date.add(new Date(), Ext.Date.DAY, -14));
        this.lookup('toDate').setValue(new Date());
        this.lookup('productFilter').setValue(null);
        this.lookup('statusFilter').setValue(null);
        this.lookup('cpFilter').setValue(null);
        this.loadTrades();
    },

    loadTrades: function () {
        var f = function (d) { return d ? Ext.Date.format(d, 'Y-m-d') : undefined; };
        var params = {
            from: f(this.lookup('fromDate').getValue()),
            to: f(this.lookup('toDate').getValue()),
            product: this.lookup('productFilter').getValue() || undefined,
            status: this.lookup('statusFilter').getValue() || undefined,
            counterpartyId: this.lookup('cpFilter').getValue() || undefined
        };
        this.lookup('tradeGrid').getStore().loadWith(Ext.Object.merge({}, params));
    },

    /** Extra right-click items for a trade (the grid adds Copy first). */
    contextItems: function (rec) {
        var me = this;
        var status = rec.get('status');
        var items = [
            { text: 'Open trade ticket', iconCls: 'x-fa fa-folder-open', handler: function () { me.openTrade(rec); } },
            { text: 'Confirm', iconCls: 'x-fa fa-check', permission: 'trades.approve', disabled: status !== 'New', handler: function () { me.selectAnd(rec, me.onConfirm); } },
            { text: 'Cancel trade', iconCls: 'x-fa fa-ban', permission: 'trades.approve', disabled: !(status === 'New' || status === 'Confirmed'), handler: function () { me.selectAnd(rec, me.onCancelTrade); } }
        ];
        if (rec.get('contractId')) {
            items.push({ text: 'Open contract ' + rec.get('contractName'), iconCls: 'x-fa fa-file-alt', handler: function () { me.openScreen('contract', rec.get('contractId')); } });
        }
        return items;
    },

    selectAnd: function (rec, fn) {
        this.lookup('tradeGrid').getSelectionModel().select(rec);
        fn.call(this);
    },

    onSelectionChange: function (sm, selected) {
        this.getViewModel().set('selectedStatus', selected.length ? selected[0].get('status') : null);
    },

    selected: function () {
        return this.lookup('tradeGrid').getSelectedRecord();
    },

    openTrade: function (rec) {
        var me = this;
        Ext.create('GT.view.trade.TradeWindow', {
            record: rec,
            listeners: { saved: function () { me.loadTrades(); } }
        }).show();
    },

    onNew: function () {
        var today = Ext.Date.clearTime(new Date());
        var tomorrow = Ext.Date.add(today, Ext.Date.DAY, 1);
        this.openTrade(Ext.create('GT.model.Trade', { tradeDate: today, deliveryStart: tomorrow, deliveryEnd: tomorrow, buySell: 'Buy', product: 'DAM' }));
    },

    onOpen: function () {
        var rec = this.selected();
        if (rec) { this.openTrade(rec); }
    },

    onLink: function (grid, rec, column) {
        if (column.dataIndex === 'contractName') {
            this.openScreen('contract', rec.get('contractId'));
        } else {
            this.openTrade(rec);
        }
    },

    onConfirm: function () {
        var me = this, rec = me.selected();
        if (!rec) { return; }
        me.busy('Confirming...', function () { return me.api().post('/trades/' + rec.getId() + '/confirm'); }).then(function (data) {
            rec.set(data, { dirty: false });
            me.onSelectionChange(null, [rec]);
            me.toast('Trade ' + rec.get('tradeRef') + ' confirmed');
        }).catch(me.ignore);
    },

    onCancelTrade: function () {
        var me = this, rec = me.selected();
        if (!rec) { return; }
        me.prompt('Cancel trade ' + rec.get('tradeRef'), 'Reason for cancellation (required, kept in the audit trail):', true).then(function (reason) {
            if (reason === null) { return; }
            if (!Ext.String.trim(reason)) {
                me.toast('A reason is required to cancel a trade', 'warning');
                return;
            }
            return me.busy('Cancelling...', function () {
                return me.api().post('/trades/' + rec.getId() + '/cancel', { reason: reason }, { reason: reason });
            }).then(function (data) {
                rec.set(data, { dirty: false });
                me.onSelectionChange(null, [rec]);
                me.toast('Trade cancelled');
            });
        }).catch(me.ignore);
    },

    onDelete: function () {
        var me = this, rec = me.selected();
        if (!rec) { return; }
        me.confirm('Delete trade', 'Delete trade <b>' + rec.get('tradeRef') + '</b>? Only New trades can be deleted.').then(function (yes) {
            if (!yes) { return; }
            return rec.erasePromise().then(function () { me.toast('Trade deleted'); });
        }).catch(me.ignore);
    }
});
