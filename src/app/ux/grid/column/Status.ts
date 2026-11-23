/*
 * Ported from app/ux/grid/column/Status.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** Renders a status value as a coloured chip and offers a list filter of the values present. */
Ext.define('GT.ux.grid.column.Status', {
    extend: 'Ext.grid.column.Column',
    xtype: 'gt-statuscolumn',
    requires: ['GT.util.Format'],

    align: 'center',
    width: 120,
    filter: { type: 'list' },

    defaultRenderer: function (value) {
        return GT.util.Format.chip(value);
    },

    exportRenderer: function (value) {
        return value;
    }
});
