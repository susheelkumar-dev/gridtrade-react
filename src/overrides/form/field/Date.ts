/*
 * Ported from overrides/form/field/Date.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** One date format across the app; still accepts ISO input and always submits ISO. */
Ext.define('GT.overrides.form.field.Date', {
    override: 'Ext.form.field.Date',

    format: 'd-M-Y',
    altFormats: 'Y-m-d|d/m/Y|d-m-Y|d M Y|j-M-Y|Ymd',
    submitFormat: 'Y-m-d',
    startDay: 1
});
