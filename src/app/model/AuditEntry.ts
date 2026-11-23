/*
 * Ported from app/model/AuditEntry.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.model.AuditEntry', {
    extend: 'GT.core.BaseModel',
    fields: [
        { name: 'entityType', type: 'string' },
        { name: 'entityId', type: 'int' },
        { name: 'entityName', type: 'string' },
        { name: 'action', type: 'string' },
        { name: 'user', type: 'string' },
        { name: 'ip', type: 'string' },
        { name: 'reason', type: 'string' },
        { name: 'at', type: 'date', dateFormat: 'c' },
        { name: 'changed', type: 'string' }
    ],
    proxy: { type: 'gt-rest', url: 'api/audit' }
});
