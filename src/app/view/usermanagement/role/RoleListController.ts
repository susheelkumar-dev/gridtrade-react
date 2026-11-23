/*
 * Ported from app/view/usermanagement/role/RoleListController.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.view.usermanagement.role.RoleListController', {
    extend: 'GT.core.BaseController',
    alias: 'controller.rolelist',
    requires: ['GT.model.usermanagement.Role', 'GT.util.Lookups'],

    grid: function () { return this.lookup('roleGrid'); },

    onScreenAction: function (view, action) {
        if (action === 'new') { this.onNew(); }
    },

    onSelectionChange: function (sm, sel) {
        this.getViewModel().set('selected', sel[0] || null);
    },

    openRole: function (rec) {
        var me = this;
        Ext.create('GT.view.usermanagement.role.RoleWindow', {
            record: rec,
            listeners: { saved: function () { me.refresh(); } }
        }).show();
    },

    refresh: function () {
        this.grid().getStore().load();
        GT.util.Lookups.reload('roles');
        Ext.GlobalEvents.fireEvent('gt-usersChanged');
    },

    onNew: function () {
        this.openRole(Ext.create('GT.model.usermanagement.Role', { permissions: ['dashboard.view'] }));
    },

    onEdit: function () {
        var rec = this.grid().getSelectedRecord();
        if (rec) { this.openRole(rec); }
    },

    onLink: function (grid, rec) {
        this.openRole(rec);
    },

    /** Starts a new role from the selected one's permissions. */
    onCopy: function () {
        var rec = this.grid().getSelectedRecord();
        if (!rec) { return; }
        this.openRole(Ext.create('GT.model.usermanagement.Role', {
            name: rec.get('name') + ' (copy)', description: rec.get('description'), permissions: Ext.Array.clone(rec.get('permissions'))
        }));
    },

    onDelete: function () {
        var me = this, rec = me.grid().getSelectedRecord();
        if (!rec) { return; }
        me.confirm('Delete role', 'Delete the <b>' + Ext.String.htmlEncode(rec.get('name')) + '</b> role?').then(function (yes) {
            if (!yes) { return; }
            return rec.erasePromise().then(function () { me.toast('Role deleted'); me.refresh(); });
        }).catch(me.ignore);
    },

    onUsers: function () {
        this.openScreen('users');
    }
});
