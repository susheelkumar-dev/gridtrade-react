/*
 * Ported from app/model/ContractVersion.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.model.ContractVersion', {
    extend: 'GT.core.BaseModel',
    fields: [
        { name: 'contractId', type: 'int' },
        { name: 'contractName', type: 'string' },
        { name: 'legalEntityName', type: 'string' },
        { name: 'version', type: 'int' },
        { name: 'effectiveDate', type: 'date', dateFormat: 'Y-m-d' },
        { name: 'createdAt', type: 'date', dateFormat: 'c' },
        { name: 'createdBy', type: 'string' },
        { name: 'comment', type: 'string' }
    ],
    proxy: { type: 'gt-rest', url: 'api/versions' }
});
