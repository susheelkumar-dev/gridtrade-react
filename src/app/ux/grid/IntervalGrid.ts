/*
 * Ported from app/ux/grid/IntervalGrid.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Editable interval grid for one day of a time series (24 hourly or 96 quarter-hour values) with day
 * navigation, a totals row, manual-edit marking and access to the changed intervals.
 * Fires 'datechange' (grid, date) when the user moves to another day.
 */
Ext.define('GT.ux.grid.IntervalGrid', {
    extend: 'GT.ux.grid.GenericGrid',
    xtype: 'gt-intervalgrid',
    requires: ['Ext.form.field.Number', 'Ext.form.field.Date'],

    enableColumnFilters: false,
    toolsPosition: 'toolbar',
    enableSearch: false,
    editable: true,
    valueHeader: 'Value',
    unit: '',
    decimals: 3,
    /** @cfg {Array} extraActions extra toolbar items after the date navigator */
    extraActions: null,

    initComponent: function () {
        var me = this;
        var fmt = '0,000.' + new Array(me.decimals + 1).join('0');
        me.currentDate = me.currentDate || Ext.Date.clearTime(new Date());
        me.editing = me.editable ? 'cell' : null;
        me.clicksToEdit = 1;
        me.enableRangeFill = me.editable;
        me.enableSummaryRow = true;
        me.columns = [
            { text: 'Date', dataIndex: 'date', width: 120, renderer: GT.util.Format.date, summaryRenderer: function () { return '<b>Day total</b>'; } },
            { text: 'Interval', dataIndex: 'interval', width: 90, align: 'right' },
            { text: 'Start', dataIndex: 'label', width: 80 },
            { text: me.valueHeader + (me.unit ? ' (' + me.unit + ')' : ''), dataIndex: 'value', flex: 1, minWidth: 140, align: 'right', tdCls: me.editable ? 'gt-editable' : '',
                editor: me.editable ? { xtype: 'numberfield', decimalPrecision: me.decimals, hideTrigger: true, keyNavEnabled: false, mouseWheelEnabled: false } : null,
                renderer: function (v) { return v === null || v === undefined ? '' : Ext.util.Format.number(v, fmt); },
                summaryType: me.unit === 'INR/MWh' || me.unit === '%' ? 'average' : 'sum',
                summaryRenderer: function (v) { return '<b>' + Ext.util.Format.number(v, fmt) + '</b>' + (me.unit === 'INR/MWh' || me.unit === '%' ? ' avg' : ''); } },
            { text: 'Quality', dataIndex: 'quality', xtype: 'gt-statuscolumn', width: 110, filter: null }
        ];
        me.toolbarActions = [
            { iconCls: 'x-fa fa-chevron-left', tooltip: 'Previous day', handler: function () { me.shiftDate(-1); } },
            { xtype: 'datefield', itemId: 'dayField', width: 130, value: me.currentDate, allowBlank: false,
                listeners: { select: me.onPickDate, specialkey: function (f, e) { if (e.getKey() === e.ENTER) { me.onPickDate(f); } }, scope: me } },
            { iconCls: 'x-fa fa-chevron-right', tooltip: 'Next day', handler: function () { me.shiftDate(1); } },
            { text: 'Today', handler: function () { me.setDate(new Date()); } }
        ].concat(me.extraActions || []);
        me.callParent(arguments);
        me.on({ edit: me.onCellEdit, rangefill: me.onRangeFill, scope: me });
    },

    /** Values filled over a range of intervals are manual entries too. */
    onRangeFill: function (grid, records) {
        Ext.Array.each(records, function (r) { if (r.isModified('value')) { r.set('quality', 'Manual'); } });
    },

    onCellEdit: function (editor, ctx) {
        if (ctx.originalValue !== ctx.value) {
            ctx.record.set('quality', 'Manual');
        }
    },

    onPickDate: function (field) {
        // The date field can fire 'select' while it is being initialised; only react to the user.
        if (!this.rendered) { return; }
        if (field && field.isValid && field.isValid() && Ext.isDate(field.getValue())) { this.setDate(field.getValue()); }
    },

    shiftDate: function (days) {
        this.setDate(Ext.Date.add(this.currentDate, Ext.Date.DAY, days));
    },

    setDate: function (date) {
        date = Ext.Date.clearTime(date, true);
        if (this.currentDate && +date === +this.currentDate && this.loadedOnce) { return; }
        if (this.getChanges().length && this.fireEvent('beforedatechange', this, date) === false) { return; }
        this.currentDate = date;
        this.loadedOnce = true;
        var field = this.down('#dayField');
        if (field && +field.getValue() !== +date) { field.setValue(date); }
        this.fireEvent('datechange', this, date);
    },

    getDateString: function () {
        return Ext.Date.format(this.currentDate, 'Y-m-d');
    },

    /** [{ interval, value }] for every edited row. */
    getChanges: function () {
        return Ext.Array.map(this.getStore().getModifiedRecords(), function (r) {
            return { interval: r.get('interval'), value: r.get('value') };
        });
    }
});
