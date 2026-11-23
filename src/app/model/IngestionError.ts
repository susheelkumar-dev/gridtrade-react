/*
 * Ported from app/model/IngestionError.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.model.IngestionError', {
    extend: 'Ext.data.Model',
    requires: ['GT.core.RestProxy'],
    fields: [
        { name: 'id', type: 'int' },
        { name: 'jobId', type: 'int' },
        { name: 'row', type: 'int' },
        { name: 'column', type: 'string' },
        { name: 'severity', type: 'string' },
        { name: 'message', type: 'string' }
    ],
    proxy: { type: 'gt-rest', url: 'api/ingestion/jobs/{jobId}/errors' }
});
