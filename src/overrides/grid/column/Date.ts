/*
 * Ported from overrides/grid/column/Date.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.overrides.grid.column.Date', {
    override: 'Ext.grid.column.Date',
    format: 'd-M-Y'
});
