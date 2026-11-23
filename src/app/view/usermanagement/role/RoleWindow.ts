/*
 * Ported from app/view/usermanagement/role/RoleWindow.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** Create or edit a role: name, description and the permission matrix. The Administrator role is read only. */
Ext.define('GT.view.usermanagement.role.RoleWindow', {
    extend: 'GT.ux.window.EntryWindow',
    xtype: 'gt-rolewindow',
    requires: ['GT.model.usermanagement.Role', 'GT.view.usermanagement.role.PermissionMatrix', 'Ext.form.field.TextArea', 'Ext.form.field.Display'],

    width: 900,
    height: 640,
    iconCls: 'x-fa fa-user-shield',
    auditEntityType: 'Role',
    editPermission: 'users.manage',
    successMessage: 'Role saved',

    initComponent: function () {
        var me = this;
        var system = !!me.record.get('isSystem');
        me.title = me.buildTitle(me.record);
        me.formConfig = { layout: { type: 'vbox', align: 'stretch' }, scrollable: false };
        me.formItems = [
            { xtype: 'textfield', name: 'name', fieldLabel: 'Role Name', allowBlank: false, maxLength: 60, readOnly: system },
            { xtype: 'textareafield', name: 'description', fieldLabel: 'Description', height: 56 },
            { xtype: 'displayfield', fieldLabel: 'Users', name: 'userNames', renderer: function (v) { return v || '<span class="gt-muted">Nobody has this role yet</span>'; } },
            { xtype: 'gt-permissionmatrix', itemId: 'matrix', flex: 1, margin: '6 0 0 0', title: 'Permissions', iconCls: 'x-fa fa-key' }
        ];
        me.callParent(arguments);
        me.matrix = me.down('#matrix');
        me.matrix.setPermissions(me.record.get('permissions'));
        me.matrix.ready.then(function () {
            me.matrix.setPermissions(me.record.get('permissions'));
            if (system || me.readOnly) { me.matrix.setReadOnly(true); }
        });
        if (system) { me.setStatus('System role: name and permissions are fixed'); }
    },

    buildTitle: function (rec) {
        return rec.phantom ? 'New Role' : 'Role – ' + rec.get('name');
    },

    beforeRecordSave: function (rec) {
        rec.set('permissions', this.matrix.getPermissions());
    },

    afterRecordSaved: function (rec) {
        this.setTitle(this.buildTitle(rec));
        this.matrix.setPermissions(rec.get('permissions'));
    },

    isWindowDirty: function () {
        return this.callParent() || (this.matrix && this.matrix.isDirty());
    }
});
