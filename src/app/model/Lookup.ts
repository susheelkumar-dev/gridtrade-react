/*
 * Ported from app/model/Lookup.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** Item of a reference list. ids are numbers for entities and strings for fixed lists (e.g. contract types). */
Ext.define('GT.model.Lookup', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: [
        { name: 'id', type: 'auto' },
        { name: 'name', type: 'string' },
        { name: 'code', type: 'string' },
        { name: 'enabled', type: 'boolean', defaultValue: true },
        { name: 'status', type: 'string' },
        { name: 'unit', type: 'string' },
        { name: 'region', type: 'string' },
        { name: 'contractTypes', type: 'auto' },
        // Entity id when the list's id is a name (commodities)
        { name: 'recordId', type: 'int', allowNull: true }
    ]
});
