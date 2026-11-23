/*
 * Ported from app/store/usermanagement/Users.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.store.usermanagement.Users', {
    extend: 'GT.core.BaseStore',
    alias: 'store.gt-users',
    model: 'GT.model.usermanagement.User',
    sorters: ['username']
});
