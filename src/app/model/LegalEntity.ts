/*
 * Ported from app/model/LegalEntity.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.model.LegalEntity', {
    extend: 'GT.core.BaseModel',
    fields: [
        { name: 'code', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'country', type: 'string', defaultValue: 'India' },
        { name: 'taxId', type: 'string' },
        { name: 'enabled', type: 'boolean', defaultValue: true },
        { name: 'isSystem', type: 'boolean', persist: false }
    ],
    proxy: { type: 'gt-rest', url: 'api/legal-entities' }
});
