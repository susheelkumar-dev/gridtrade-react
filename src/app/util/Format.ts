/*
 * Ported from app/util/Format.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** Shared renderers and number/date formatting (Indian digit grouping for INR). */
Ext.define('GT.util.Format', {
    singleton: true,

    dateFormat: 'd-M-Y',
    dateTimeFormat: 'd-M-Y H:i',

    date: function (v) {
        if (!v) { return ''; }
        if (!Ext.isDate(v)) { v = Ext.Date.parse(v, 'Y-m-d') || Ext.Date.parse(v, 'c') || new Date(v); }
        return Ext.Date.format(v, GT.util.Format.dateFormat);
    },

    dateTime: function (v) {
        if (!v) { return ''; }
        if (!Ext.isDate(v)) { v = Ext.Date.parse(v, 'c') || new Date(v); }
        return Ext.Date.format(v, GT.util.Format.dateTimeFormat);
    },

    /** 1234567.8 -> "12,34,568" */
    indian: function (n, decimals) {
        if (n === null || n === undefined || n === '' || isNaN(n)) { return ''; }
        var neg = n < 0;
        var fixed = Math.abs(Number(n)).toFixed(decimals || 0);
        var parts = fixed.split('.');
        var whole = parts[0];
        var last3 = whole.slice(-3);
        var rest = whole.slice(0, -3);
        if (rest) {
            last3 = ',' + last3;
            rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
        }
        return (neg ? '-' : '') + rest + last3 + (parts[1] ? '.' + parts[1] : '');
    },

    inr: function (v) {
        return v === null || v === undefined || v === '' ? '' : '₹ ' + GT.util.Format.indian(v);
    },

    mw: function (v) {
        return v === null || v === undefined || v === '' ? '' : Ext.util.Format.number(v, '0,000.0');
    },

    yesNo: function (v) {
        return v ? 'Yes' : 'No';
    },

    statusCls: {
        Draft: 'grey', Validated: 'blue', Approved: 'green',
        New: 'blue', Confirmed: 'green', Settled: 'grey', Cancelled: 'red',
        Completed: 'green', 'Completed with warnings': 'amber', Failed: 'red', Running: 'blue',
        INSERT: 'green', UPDATE: 'blue', DELETE: 'red',
        Error: 'red', Warning: 'amber', Actual: 'green', Manual: 'amber', Forecast: 'grey',
        Active: 'green', Disabled: 'grey'
    },

    chip: function (v) {
        if (!v) { return ''; }
        var cls = GT.util.Format.statusCls[v] || 'grey';
        return '<span class="gt-chip gt-chip-' + cls + '">' + Ext.String.htmlEncode(v) + '</span>';
    },

    /** Readable label for a camelCase field name: "counterpartyId" -> "Counterparty Id". */
    label: function (field) {
        return Ext.String.capitalize(String(field).replace(/([a-z])([A-Z])/g, '$1 $2'));
    }
});
