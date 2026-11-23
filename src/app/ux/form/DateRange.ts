/*
 * Ported from app/ux/form/DateRange.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Two date fields side by side that submit as separate values (startName / endName) and validate that the
 * end is not before the start.
 */
Ext.define('GT.ux.form.DateRange', {
    extend: 'Ext.form.FieldContainer',
    xtype: 'gt-daterange',
    requires: ['Ext.form.field.Date'],

    layout: { type: 'hbox', align: 'middle' },
    startName: 'startDate',
    endName: 'endDate',
    allowBlank: true,
    startEmptyText: 'From',
    endEmptyText: 'To',

    initComponent: function () {
        var me = this;
        if (me.allowBlank === false && me.fieldLabel) {
            me.afterLabelTextTpl = '<span class="gt-required" data-qtip="Required">*</span>';
        }
        me.items = [
            { xtype: 'datefield', name: me.startName, itemId: 'start', flex: 1, allowBlank: me.allowBlank, emptyText: me.startEmptyText,
                hideLabel: true, msgTarget: 'qtip', bind: me.startBind,
                listeners: { change: me.syncLimits, scope: me } },
            { xtype: 'component', html: '&ndash;', cls: 'gt-range-sep', margin: '0 6' },
            { xtype: 'datefield', name: me.endName, itemId: 'end', flex: 1, allowBlank: me.allowBlank, emptyText: me.endEmptyText,
                hideLabel: true, msgTarget: 'qtip', bind: me.endBind,
                validator: function (v) {
                    var s = me.down('#start').getValue(), e = this.getValue();
                    return !s || !e || e >= s ? true : 'End date is before start date';
                },
                listeners: { change: me.syncLimits, scope: me } }
        ];
        me.callParent(arguments);
    },

    syncLimits: function () {
        var end = this.down('#end');
        if (end) { end.validate(); }
    },

    /** Convenience for filters: { from: 'Y-m-d', to: 'Y-m-d' } */
    getRange: function () {
        var f = function (d) { return d ? Ext.Date.format(d, 'Y-m-d') : null; };
        return { from: f(this.down('#start').getValue()), to: f(this.down('#end').getValue()) };
    }
});
