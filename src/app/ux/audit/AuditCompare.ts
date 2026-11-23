// @ts-nocheck: type errors remain in this ported module (see MIGRATION_REPORT.md); remove when fixed
/*
 * Ported from app/ux/audit/AuditCompare.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Side-by-side attribute comparison of two or more snapshots of a record. Cells that differ from the
 * previous column are highlighted; "Show only changed" hides unchanged attributes. Foreign keys are shown
 * with their names using the cached lookups.
 *
 *   { xtype: 'gt-auditcompare', versions: [{ label: 'Version 1', sub: 'demo.trader', data: {...} }, ...] }
 */
Ext.define('GT.ux.audit.AuditCompare', {
    extend: 'Ext.grid.Panel',
    xtype: 'gt-auditcompare',
    requires: ['GT.util.Format', 'GT.util.Lookups', 'Ext.form.field.Checkbox'],

    cls: 'gt-auditcompare',
    columnLines: true,
    versions: null,
    hiddenFields: ['base'],
    /** Field name -> lookup type, used to show names instead of ids. */
    references: {
        counterpartyId: 'counterparties', legalEntityId: 'legalEntities', nodeId: 'nodes', meterId: 'timeseries',
        referenceSeriesId: 'timeseries', indexSeriesId: 'timeseries', contractId: 'contracts'
    },

    initComponent: function () {
        var me = this;
        var versions = me.versions || [];
        var rows = me.buildRows(versions);
        var fields = ['key', 'attribute', 'changed'];
        var columns = [{ text: 'Attribute', dataIndex: 'attribute', width: 190, tdCls: 'gt-attr-cell',
            renderer: function (v, meta, rec) { if (rec.get('changed')) { meta.tdCls += ' gt-attr-changed'; } return Ext.String.htmlEncode(v); } }];

        Ext.Array.each(versions, function (v, i) {
            fields.push('v' + i, 'c' + i);
            columns.push({
                text: '<div class="gt-cmp-head">' + Ext.String.htmlEncode(v.label) + (v.sub ? '<div class="gt-muted">' + Ext.String.htmlEncode(v.sub) + '</div>' : '') + '</div>',
                dataIndex: 'v' + i, flex: 1, minWidth: 170, sortable: false, cellWrap: true,
                renderer: function (val, meta, rec) {
                    if (i > 0 && rec.get('c' + i)) { meta.tdCls += ' gt-changed'; }
                    return val === null ? '<span class="gt-muted">&mdash;</span>' : Ext.String.htmlEncode(val);
                }
            });
        });

        me.store = Ext.create('Ext.data.Store', { fields: fields, data: rows });
        me.columns = { items: columns, defaults: { menuDisabled: true } };
        var changedCount = Ext.Array.filter(rows, function (r) { return r.changed; }).length;
        me.tbar = [
            { xtype: 'checkbox', boxLabel: 'Show only changed attributes', itemId: 'onlyChanged',
                handler: function (cb, checked) {
                    me.store.clearFilter();
                    if (checked) { me.store.filter('changed', true); }
                } },
            '->',
            { xtype: 'tbtext', html: versions.length > 1 ? changedCount + ' attribute' + (changedCount === 1 ? '' : 's') + ' changed' : '' }
        ];
        me.callParent(arguments);
    },

    buildRows: function (versions) {
        var me = this, keys = [], seen = {};
        Ext.Array.each(versions, function (v) {
            Ext.Object.each(v.data || {}, function (k) {
                if (!seen[k] && me.hiddenFields.indexOf(k) < 0) { seen[k] = true; keys.push(k); }
            });
        });
        return Ext.Array.map(keys, function (k) {
            var row = { key: k, attribute: me.labelFor(k), changed: false };
            var prev;
            Ext.Array.each(versions, function (v, i) {
                var present = v.data && Object.prototype.hasOwnProperty.call(v.data, k);
                var val = present ? me.formatValue(k, v.data[k]) : null;
                row['v' + i] = val;
                row['c' + i] = i > 0 && val !== prev;
                if (row['c' + i]) { row.changed = true; }
                prev = val;
            });
            return row;
        });
    },

    labelFor: function (key) {
        var k = this.references[key] ? key.replace(/Id$/, '') : key;
        return GT.util.Format.label(k);
    },

    formatValue: function (key, v) {
        if (v === null || v === undefined || v === '') { return null; }
        if (this.references[key]) {
            var name = GT.util.Lookups.name(this.references[key], v);
            return name ? name + ' (#' + v + ')' : '#' + v;
        }
        if (Ext.isArray(v)) { return v.join(', '); }
        if (Ext.isObject(v)) { return Ext.encode(v); }
        if (typeof v === 'boolean') { return v ? 'Yes' : 'No'; }
        if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) { return GT.util.Format.dateTime(v); }
        if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) { return GT.util.Format.date(v); }
        return String(v);
    }
});
