/*
 * Ported from app/store/usermanagement/Roles.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.store.usermanagement.Roles', {
    extend: 'GT.core.BaseStore',
    alias: 'store.gt-roles',
    model: 'GT.model.usermanagement.Role',
    sorters: ['name']
});
