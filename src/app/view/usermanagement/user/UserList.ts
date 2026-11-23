/*
 * Ported from app/view/usermanagement/user/UserList.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** User Management > Users: every user with their roles and status. Opens users in a pop-up entry window. */
Ext.define('GT.view.usermanagement.user.UserList', {
    extend: 'Ext.panel.Panel',
    xtype: 'gt-userlist',
    requires: ['GT.view.usermanagement.user.UserListController', 'GT.view.usermanagement.user.UserWindow',
        'GT.store.usermanagement.Users', 'GT.ux.grid.GenericGrid', 'GT.util.Format'],

    controller: 'userlist',
    viewModel: { data: { selected: null }, formulas: { canToggle: function (get) { return !!get('selected'); } } },
    layout: 'fit',
    listeners: { screenaction: 'onScreenAction' },

    items: [{
        xtype: 'gt-genericgrid',
        reference: 'userGrid',
        title: 'Users',
        iconCls: 'x-fa fa-user',
        exportFileName: 'Users',
        enableFilterRow: true,
        stateful: true,
        stateId: 'gt-users-v1',
        store: { type: 'gt-users', autoLoad: true },
        rowCls: function (rec) { return rec.get('enabled') ? '' : 'gt-row-disabled'; },
        enableContextMenu: true,
        contextMenuItems: function (rec, grid) { return grid.lookupController().contextItems(rec); },
        toolbarActions: [
            { text: 'New User', iconCls: 'x-fa fa-user-plus', handler: 'onNew', permission: 'users.manage' },
            { text: 'Edit', iconCls: 'x-fa fa-edit', handler: 'onEdit', bind: { disabled: '{!canToggle}' } },
            { text: 'Enable / Disable', iconCls: 'x-fa fa-toggle-on', handler: 'onToggle', bind: { disabled: '{!canToggle}' }, permission: 'users.manage' },
            { text: 'Delete', iconCls: 'x-fa fa-trash-alt', handler: 'onDelete', bind: { disabled: '{!canToggle}' }, permission: 'users.manage' },
            '-',
            { text: 'Roles', iconCls: 'x-fa fa-user-shield', handler: 'onRoles' }
        ],
        listeners: { linkclick: 'onLink', itemdblclick: 'onEdit', selectionchange: 'onSelectionChange' },
        columns: [
            { text: 'Username', dataIndex: 'username', xtype: 'gt-linkcolumn', width: 160, filter: 'string' },
            { text: 'Full Name', dataIndex: 'fullName', width: 200, filter: 'string' },
            { text: 'E-mail', dataIndex: 'email', flex: 1, minWidth: 220, filter: 'string' },
            { text: 'Department', dataIndex: 'department', width: 140, filter: 'list' },
            { text: 'Roles', dataIndex: 'roleNames', width: 220, filter: 'string' },
            { text: 'Permissions', dataIndex: 'permissionCount', width: 110, align: 'right', filter: 'number' },
            { text: 'Status', dataIndex: 'statusText', xtype: 'gt-statuscolumn', width: 110 },
            { text: 'Created', dataIndex: 'createdAt', width: 120, renderer: GT.util.Format.date, filterRow: false }
        ]
    }]
});
