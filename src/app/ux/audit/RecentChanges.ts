/*
 * Ported from app/ux/audit/RecentChanges.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Compact audit list for one record (like a "Recent Changes" side tab). The eye icon opens the before/after
 * view of a single change; ticking two or more rows enables "Compare selected".
 */
Ext.define('GT.ux.audit.RecentChanges', {
    extend: 'Ext.grid.Panel',
    xtype: 'gt-recentchanges',
    requires: ['GT.store.AuditEntries', 'GT.ux.audit.CompareWindow', 'GT.util.Format', 'Ext.selection.CheckboxModel', 'Ext.grid.column.Action'],

    title: 'Recent Changes',
    iconCls: 'x-fa fa-history',
    cls: 'gt-recentchanges',
    entityType: null,
    entityId: null,
    columnLines: false,

    initComponent: function () {
        var me = this;
        me.store = Ext.create('GT.store.AuditEntries');
        me.selModel = { type: 'checkboxmodel', checkOnly: true, mode: 'SIMPLE' };
        me.viewConfig = { emptyText: '<div class="gt-empty">Saved changes will appear here</div>', deferEmptyText: false };
        me.columns = [
            { xtype: 'actioncolumn', width: 32, menuDisabled: true, items: [{
                iconCls: 'x-fa fa-eye', tooltip: 'View this change',
                handler: function (view, rowIndex, colIndex, item, e, rec) { GT.ux.audit.CompareWindow.showEntry(rec.getId()); }
            }] },
            { text: 'Action', dataIndex: 'action', width: 86, renderer: GT.util.Format.chip },
            { text: 'User', dataIndex: 'user', flex: 1, minWidth: 90 },
            { text: 'When', dataIndex: 'at', width: 116, renderer: GT.util.Format.dateTime }
        ];
        me.bbar = [
            { text: 'Compare selected', iconCls: 'x-fa fa-columns', itemId: 'compareBtn', disabled: true, handler: me.compareSelected, scope: me },
            '->',
            { iconCls: 'x-fa fa-sync-alt', tooltip: 'Refresh', handler: me.reload, scope: me }
        ];
        me.callParent(arguments);
        me.on('selectionchange', function (sm, sel) { me.down('#compareBtn').setDisabled(sel.length < 2); });
        me.on('itemdblclick', function (view, rec) { GT.ux.audit.CompareWindow.showEntry(rec.getId()); });
        if (me.entityId) {
            me.on('afterrender', me.reload, me, { single: true });
        }
    },

    setEntity: function (entityType, entityId) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.reload();
    },

    reload: function () {
        if (!this.entityId) {
            this.getStore().removeAll();
            return;
        }
        this.getStore().loadWith({ entityType: this.entityType, entityId: this.entityId });
    },

    compareSelected: function () {
        var ids = Ext.Array.map(this.getSelection(), function (r) { return r.getId(); });
        GT.ux.audit.CompareWindow.showEntries(ids);
    }
});
