/*
 * Ported from app/view/usermanagement/role/PermissionMatrix.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Permission matrix for a role: one row per module, one tick column per action (View, Create & edit, Delete,
 * Approve, Manage). Cells an action does not apply to are blank and cannot be ticked.
 * The catalogue comes from GET /api/permissions, so new modules appear without UI changes.
 */
Ext.define('GT.view.usermanagement.role.PermissionMatrix', {
    extend: 'Ext.grid.Panel',
    xtype: 'gt-permissionmatrix',
    requires: ['GT.util.Api', 'Ext.grid.column.Check'],

    cls: 'gt-permissionmatrix',
    columnLines: true,
    sortableColumns: false,
    enableColumnHide: false,
    enableColumnMove: false,
    readOnly: false,

    permActions: [
        { key: 'view', text: 'View' },
        { key: 'edit', text: 'Create & edit' },
        { key: 'delete', text: 'Delete' },
        { key: 'approve', text: 'Approve / confirm' },
        { key: 'manage', text: 'Manage' }
    ],

    initComponent: function () {
        var me = this;
        me.store = Ext.create('Ext.data.Store', { fields: ['module', 'label', 'actions', 'view', 'edit', 'delete', 'approve', 'manage'], data: [] });
        me.columns = [{ text: 'Module', dataIndex: 'label', flex: 1, minWidth: 200, menuDisabled: true }].concat(Ext.Array.map(me.permActions, function (a) {
            return {
                xtype: 'checkcolumn', text: a.text, dataIndex: a.key, width: 118, menuDisabled: true,
                renderer: function (value, meta, rec) {
                    if (!Ext.Array.contains(rec.get('actions') || [], a.key)) { meta.tdCls = 'gt-perm-na'; return ''; }
                    return this.defaultRenderer(value, meta);
                },
                listeners: {
                    beforecheckchange: function (col, rowIndex, checked, rec) {
                        return !me.readOnly && Ext.Array.contains(rec.get('actions') || [], a.key);
                    },
                    checkchange: function (col, rowIndex, checked, rec) { me.onCheck(rec, a.key, checked); }
                }
            };
        }));
        me.tbar = [
            { text: 'Select all', iconCls: 'x-fa fa-check-double', itemId: 'allBtn', handler: function () { me.setAll(true); } },
            { text: 'View only', iconCls: 'x-fa fa-eye', itemId: 'viewBtn', handler: function () { me.setAll(false); me.setViewAll(); } },
            { text: 'Clear', iconCls: 'x-fa fa-times', itemId: 'clearBtn', handler: function () { me.setAll(false); } },
            '->', { xtype: 'tbtext', itemId: 'countText', cls: 'gt-muted' }
        ];
        me.callParent(arguments);
        me.ready = GT.util.Api.get('/permissions').then(function (modules) {
            me.store.loadData(Ext.Array.map(modules, function (m) { return { module: m.module, label: m.label, actions: m.actions }; }));
            if (me.pending) { me.setPermissions(me.pending); }
            return me;
        });
    },

    /** Ticking an action also ticks View (you cannot edit what you cannot see); unticking View clears the row. */
    onCheck: function (rec, key, checked) {
        if (checked && key !== 'view') { rec.set('view', true); }
        if (!checked && key === 'view') { Ext.Array.each(this.permActions, function (a) { rec.set(a.key, false); }); }
        rec.commit();
        this.updateCount();
        this.fireEvent('permissionchange', this, this.getPermissions());
    },

    setAll: function (on) {
        var me = this;
        if (me.readOnly) { return; }
        me.store.each(function (r) {
            Ext.Array.each(me.permActions, function (a) { r.set(a.key, on && Ext.Array.contains(r.get('actions'), a.key)); });
            r.commit();
        });
        me.updateCount();
    },

    setViewAll: function () {
        if (this.readOnly) { return; }
        this.store.each(function (r) { if (r.get('module') !== 'users') { r.set('view', true); r.commit(); } });
        this.updateCount();
    },

    setPermissions: function (list) {
        var me = this;
        list = list || [];
        me.pending = list;
        me.store.each(function (r) {
            Ext.Array.each(me.permActions, function (a) { r.set(a.key, Ext.Array.contains(list, r.get('module') + '.' + a.key)); });
            r.commit();
        });
        me.original = me.getPermissions().join('|');
        me.updateCount();
    },

    getPermissions: function () {
        var me = this, out = [];
        me.store.each(function (r) {
            Ext.Array.each(me.permActions, function (a) { if (r.get(a.key)) { out.push(r.get('module') + '.' + a.key); } });
        });
        return out.sort();
    },

    isDirty: function () {
        return this.original !== undefined && this.original !== this.getPermissions().join('|');
    },

    setReadOnly: function (ro) {
        this.readOnly = ro;
        Ext.Array.each(['#allBtn', '#viewBtn', '#clearBtn'], function (s) { this.down(s).setDisabled(ro); }, this);
    },

    updateCount: function () {
        var n = this.getPermissions().length, t = this.down('#countText');
        if (t) { t.setHtml(n + ' permission' + (n === 1 ? '' : 's') + (this.readOnly ? ' · read only' : '')); }
    }
});
