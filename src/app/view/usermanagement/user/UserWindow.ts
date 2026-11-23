/*
 * Ported from app/view/usermanagement/user/UserWindow.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** Create or edit a user: identity, department, roles (several allowed) and enabled flag, with the resulting permissions. */
Ext.define('GT.view.usermanagement.user.UserWindow', {
    extend: 'GT.ux.window.EntryWindow',
    xtype: 'gt-userwindow',
    requires: ['GT.model.usermanagement.User', 'GT.store.usermanagement.Roles', 'GT.ux.form.LookupCombo', 'GT.ux.form.LookupTag',
        'Ext.form.field.Checkbox', 'Ext.form.field.Display'],

    width: 760,
    height: 560,
    iconCls: 'x-fa fa-user',
    auditEntityType: 'User',
    editPermission: 'users.manage',
    successMessage: 'User saved',

    initComponent: function () {
        var me = this;
        var isNew = me.record.phantom;
        me.title = me.buildTitle(me.record);
        me.formItems = [
            { xtype: 'textfield', name: 'username', fieldLabel: 'Username', allowBlank: false, readOnly: !isNew, maxLength: 31,
                regex: /^[a-z][a-z0-9._-]{2,30}$/, regexText: 'Lower-case letters, digits, dot, dash or underscore; starts with a letter',
                emptyText: 'e.g. jane.doe', fieldStyle: isNew ? '' : 'background:#f1f5f9' },
            { xtype: 'textfield', name: 'fullName', fieldLabel: 'Full Name', allowBlank: false, maxLength: 80 },
            { xtype: 'textfield', name: 'email', fieldLabel: 'E-mail', allowBlank: false, regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, regexText: 'Enter an e-mail address such as name@company.com' },
            { xtype: 'gt-lookup', name: 'department', fieldLabel: 'Department', lookupType: 'departments', editable: false },
            { xtype: 'gt-lookuptag', name: 'roleIds', fieldLabel: 'Roles', lookupType: 'roles', allowBlank: false, editScreen: 'roles',
                listeners: { change: me.showPermissions, scope: me } },
            { xtype: 'checkbox', name: 'enabled', fieldLabel: 'Status', boxLabel: 'Active (disabled users cannot act or be switched to)', inputValue: true, uncheckedValue: false },
            { xtype: 'displayfield', fieldLabel: 'Permissions', itemId: 'permissionsText', cls: 'gt-perm-summary' }
        ];
        me.callParent(arguments);
        me.roles = Ext.create('GT.store.usermanagement.Roles');
        me.roles.loadPromise().then(function () { me.showPermissions(); });
    },

    buildTitle: function (rec) {
        return rec.phantom ? 'New User' : 'User – ' + rec.get('fullName') + ' (' + rec.get('username') + ')';
    },

    afterRecordSaved: function (rec) {
        this.setTitle(this.buildTitle(rec));
        this.form.getForm().findField('username').setReadOnly(true);
    },

    /** Lists the permissions the selected roles add up to, grouped by module. */
    showPermissions: function () {
        var me = this;
        var out = me.down('#permissionsText');
        if (!out || !me.roles || !me.roles.isLoaded()) { return; }
        var ids = Ext.Array.from(me.form.getForm().findField('roleIds').getValue());
        var byModule = {};
        Ext.Array.each(ids, function (id) {
            var role = me.roles.getById(id);
            Ext.Array.each(role ? role.get('permissions') : [], function (p) {
                var parts = p.split('.');
                (byModule[parts[0]] = byModule[parts[0]] || {})[parts[1]] = true;
            });
        });
        var lines = Ext.Array.map(Ext.Object.getKeys(byModule).sort(), function (m) {
            return '<b>' + Ext.String.capitalize(m) + '</b>: ' + Ext.Object.getKeys(byModule[m]).join(', ');
        });
        out.setValue(lines.length ? lines.join('<br>') : '<span class="gt-muted">No roles selected: the user can do nothing</span>');
    }
});
