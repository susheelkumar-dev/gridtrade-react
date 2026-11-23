/*
 * Ported from app/ux/form/LookupTag.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** Multi-select variant of the lookup combo (tag field). */
Ext.define('GT.ux.form.LookupTag', {
    extend: 'Ext.form.field.Tag',
    xtype: 'gt-lookuptag',
    mixins: ['GT.ux.form.LookupMixin'],

    queryMode: 'local',
    displayField: 'name',
    valueField: 'id',
    forceSelection: true,
    anyMatch: true,
    filterPickList: true,
    stacked: false,

    constructor: function (config) {
        this.callParent([this.withEditTrigger(config)]);
    },

    initComponent: function () {
        this.initLookup();
        this.callParent(arguments);
    }
});
