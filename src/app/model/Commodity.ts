/*
 * Ported from app/model/Commodity.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.model.Commodity', {
    extend: 'GT.core.BaseModel',
    fields: [
        { name: 'name', type: 'string' },
        { name: 'enabled', type: 'boolean', defaultValue: true },
        { name: 'isSystem', type: 'boolean', persist: false },
        { name: 'contractTypes', type: 'auto', defaultValue: [] },
        { name: 'contractTypeList', persist: false, depends: ['contractTypes'], calculate: function (d) { return (d.contractTypes || []).join(', '); } }
    ],
    proxy: { type: 'gt-rest', url: 'api/commodities' }
});
