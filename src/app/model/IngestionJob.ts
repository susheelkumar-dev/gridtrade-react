/*
 * Ported from app/model/IngestionJob.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.model.IngestionJob', {
    extend: 'GT.core.BaseModel',
    fields: [
        { name: 'fileName', type: 'string' },
        { name: 'target', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'total', type: 'int' },
        { name: 'accepted', type: 'int' },
        { name: 'rejected', type: 'int' },
        { name: 'warnings', type: 'int' },
        { name: 'errorCount', type: 'int' },
        { name: 'user', type: 'string' },
        { name: 'startedAt', type: 'date', dateFormat: 'c' },
        { name: 'finishedAt', type: 'date', dateFormat: 'c' },
        { name: 'durationMs', persist: false, depends: ['startedAt', 'finishedAt'], calculate: function (d) {
            return d.startedAt && d.finishedAt ? d.finishedAt.getTime() - d.startedAt.getTime() : null;
        } }
    ],
    proxy: { type: 'gt-rest', url: 'api/ingestion/jobs' }
});
