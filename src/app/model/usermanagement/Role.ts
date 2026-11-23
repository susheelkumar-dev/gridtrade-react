/*
 * Ported from app/model/usermanagement/Role.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** A role is a named set of permissions ("module.action", e.g. "contracts.approve"). Users can have several. */
Ext.define('GT.model.usermanagement.Role', {
    extend: 'GT.core.BaseModel',
    fields: [
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'permissions', type: 'auto', defaultValue: [] },
        { name: 'isSystem', type: 'boolean', persist: false },
        { name: 'userCount', type: 'int', persist: false },
        { name: 'userNames', type: 'string', persist: false },
        { name: 'permissionCount', type: 'int', persist: false },
        { name: 'permissionText', persist: false, depends: ['permissions'], calculate: function (d) { return (d.permissions || []).join(', '); } }
    ],
    proxy: { type: 'gt-rest', url: 'api/roles' }
});
