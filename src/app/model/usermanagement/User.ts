/*
 * Ported from app/model/usermanagement/User.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** Application user. No password: the demo picks the acting user from the user menu. */
Ext.define('GT.model.usermanagement.User', {
    extend: 'GT.core.BaseModel',
    fields: [
        { name: 'username', type: 'string' },
        { name: 'fullName', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'department', type: 'string' },
        { name: 'roleIds', type: 'auto', defaultValue: [] },
        { name: 'enabled', type: 'boolean', defaultValue: true },
        { name: 'createdAt', type: 'date', dateFormat: 'c', persist: false },
        { name: 'roleNames', type: 'string', persist: false },
        { name: 'permissionCount', type: 'int', persist: false },
        { name: 'statusText', persist: false, depends: ['enabled'], calculate: function (d) { return d.enabled ? 'Active' : 'Disabled'; } }
    ],
    validators: {
        username: [{ type: 'presence' }, { type: 'format', matcher: /^[a-z][a-z0-9._-]{2,30}$/, message: 'Lower-case letters, digits, dot, dash or underscore' }],
        fullName: 'presence',
        email: { type: 'format', matcher: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid e-mail address' }
    },
    proxy: { type: 'gt-rest', url: 'api/users' }
});
