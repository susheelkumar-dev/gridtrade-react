/*
 * Ported from app/view/usermanagement/role/RoleList.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** User Management > Roles: roles with their users and permissions. Expand a row to see its permissions. */
Ext.define('GT.view.usermanagement.role.RoleList', {
    extend: 'Ext.panel.Panel',
    xtype: 'gt-rolelist',
    requires: ['GT.view.usermanagement.role.RoleListController', 'GT.view.usermanagement.role.RoleWindow',
        'GT.store.usermanagement.Roles', 'GT.ux.grid.GenericGrid'],

    controller: 'rolelist',
    viewModel: { data: { selected: null }, formulas: {
        hasSelection: function (get) { return !!get('selected'); },
        canDelete: function (get) { var r = get('selected'); return !!r && !r.get('isSystem'); }
    } },
    layout: 'fit',
    listeners: { screenaction: 'onScreenAction' },

    items: [{
        xtype: 'gt-genericgrid',
        reference: 'roleGrid',
        title: 'Roles',
        iconCls: 'x-fa fa-user-shield',
        exportFileName: 'Roles',
        enableFilterRow: true,
        store: { type: 'gt-roles', autoLoad: true },
        rowBodyTpl: ['<div class="gt-row-detail"><b>Permissions:</b> {permissionText}<tpl if="userNames"><br><b>Users:</b> {userNames}</tpl></div>'],
        toolbarActions: [
            { text: 'New Role', iconCls: 'x-fa fa-plus', handler: 'onNew', permission: 'users.manage' },
            { text: 'Edit', iconCls: 'x-fa fa-edit', handler: 'onEdit', bind: { disabled: '{!hasSelection}' } },
            { text: 'Copy', iconCls: 'x-fa fa-copy', handler: 'onCopy', bind: { disabled: '{!hasSelection}' }, permission: 'users.manage' },
            { text: 'Delete', iconCls: 'x-fa fa-trash-alt', handler: 'onDelete', bind: { disabled: '{!canDelete}' }, permission: 'users.manage' },
            '-',
            { text: 'Users', iconCls: 'x-fa fa-user', handler: 'onUsers' }
        ],
        listeners: { linkclick: 'onLink', itemdblclick: 'onEdit', selectionchange: 'onSelectionChange' },
        columns: [
            { text: 'Role', dataIndex: 'name', xtype: 'gt-linkcolumn', width: 180, filter: 'string' },
            { text: 'Description', dataIndex: 'description', flex: 1, minWidth: 260, filter: 'string' },
            { text: 'Users', dataIndex: 'userCount', width: 90, align: 'right', filter: 'number' },
            { text: 'Permissions', dataIndex: 'permissionCount', width: 120, align: 'right', filter: 'number' },
            { text: 'System', dataIndex: 'isSystem', xtype: 'booleancolumn', trueText: 'Yes', falseText: 'No', width: 90, align: 'center' },
            { text: 'Assigned To', dataIndex: 'userNames', width: 260, filter: 'string' }
        ]
    }]
});
