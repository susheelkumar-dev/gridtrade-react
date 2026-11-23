/*
 * Ported from app/view/usermanagement/user/UserListController.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.view.usermanagement.user.UserListController', {
    extend: 'GT.core.BaseController',
    alias: 'controller.userlist',
    requires: ['GT.model.usermanagement.User', 'GT.util.Lookups', 'GT.util.Session'],

    grid: function () { return this.lookup('userGrid'); },

    onScreenAction: function (view, action) {
        if (action === 'new') { this.onNew(); }
    },

    onSelectionChange: function (sm, sel) {
        this.getViewModel().set('selected', sel[0] || null);
    },

    contextItems: function (rec) {
        var me = this;
        return [
            { text: 'Edit user', iconCls: 'x-fa fa-edit', handler: function () { me.openUser(rec); } },
            { text: rec.get('enabled') ? 'Disable' : 'Enable', iconCls: 'x-fa fa-toggle-on', permission: 'users.manage', handler: function () { me.toggle(rec); } },
            { text: 'Act as this user', iconCls: 'x-fa fa-user-secret', disabled: !rec.get('enabled'), handler: function () { GT.util.Session.setUser(rec.get('username')); } }
        ];
    },

    openUser: function (rec) {
        var me = this;
        Ext.create('GT.view.usermanagement.user.UserWindow', {
            record: rec,
            listeners: { saved: function () { me.refresh(); } }
        }).show();
    },

    refresh: function () {
        this.grid().getStore().load();
        GT.util.Lookups.reload('users');
        Ext.GlobalEvents.fireEvent('gt-usersChanged');
    },

    onNew: function () {
        this.openUser(Ext.create('GT.model.usermanagement.User', { enabled: true, department: 'Front Office', roleIds: [] }));
    },

    onEdit: function () {
        var rec = this.grid().getSelectedRecord();
        if (rec) { this.openUser(rec); }
    },

    onLink: function (grid, rec) {
        this.openUser(rec);
    },

    onToggle: function () {
        var rec = this.grid().getSelectedRecord();
        if (rec) { this.toggle(rec); }
    },

    toggle: function (rec) {
        var me = this;
        var enable = !rec.get('enabled');
        me.confirm(enable ? 'Enable user' : 'Disable user', (enable ? 'Enable ' : 'Disable ') + '<b>' + Ext.String.htmlEncode(rec.get('username')) + '</b>?' +
            (enable ? '' : ' A disabled user keeps their history but can no longer act.')).then(function (yes) {
            if (!yes) { return; }
            rec.set('enabled', enable);
            return rec.savePromise().then(function () {
                me.toast('User ' + (enable ? 'enabled' : 'disabled'));
                me.refresh();
            }, function () { rec.reject(); });
        }).catch(me.ignore);
    },

    onDelete: function () {
        var me = this, rec = me.grid().getSelectedRecord();
        if (!rec) { return; }
        me.confirm('Delete user', 'Delete <b>' + Ext.String.htmlEncode(rec.get('username')) + '</b>? Users with contracts or trades on record can only be disabled.').then(function (yes) {
            if (!yes) { return; }
            return rec.erasePromise().then(function () { me.toast('User deleted'); me.refresh(); });
        }).catch(me.ignore);
    },

    onRoles: function () {
        this.openScreen('roles');
    }
});
