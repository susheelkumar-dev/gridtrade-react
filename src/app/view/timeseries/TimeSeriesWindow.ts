/*
 * Ported from app/view/timeseries/TimeSeriesWindow.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.view.timeseries.TimeSeriesWindow', {
    extend: 'GT.ux.window.EntryWindow',
    xtype: 'gt-timeserieswindow',
    requires: ['GT.ux.form.LookupCombo', 'Ext.form.field.Checkbox', 'Ext.form.field.TextArea', 'Ext.form.field.ComboBox'],

    width: 640,
    height: 480,
    iconCls: 'x-fa fa-chart-line',
    editPermission: 'data.edit',
    auditEntityType: 'Time Series',
    successMessage: 'Time series saved',

    initComponent: function () {
        var isNew = this.record.phantom;
        this.title = isNew ? 'New Time Series' : 'Time Series – ' + this.record.get('name');
        this.formItems = [
            { xtype: 'textfield', name: 'name', fieldLabel: 'Name', allowBlank: false, maxLength: 80 },
            { xtype: 'textfield', name: 'formula', fieldLabel: 'Formula / Code', emptyText: 'Generated from the name if empty', readOnly: !isNew },
            { xtype: 'combobox', name: 'type', fieldLabel: 'Type', allowBlank: false, editable: false, store: ['Input - Simple', 'Input - Complex', 'Calculated'] },
            { xtype: 'combobox', name: 'granularity', fieldLabel: 'Granularity', allowBlank: false, editable: false, store: ['Hourly', '15 Min'], readOnly: !isNew },
            { xtype: 'combobox', name: 'unit', fieldLabel: 'Unit', editable: false, store: ['MWh', 'INR/MWh', '%'] },
            { xtype: 'gt-lookup', name: 'timeZone', fieldLabel: 'Time Zone', lookupType: 'timeZones', allowBlank: false, editable: false },
            { xtype: 'checkbox', name: 'enabled', fieldLabel: 'Enabled', inputValue: true, uncheckedValue: false },
            { xtype: 'checkbox', name: 'manual', fieldLabel: 'Manual Entry', boxLabel: 'Users may edit interval values', inputValue: true, uncheckedValue: false },
            { xtype: 'textareafield', name: 'description', fieldLabel: 'Description', height: 70 }
        ];
        this.callParent(arguments);
    },

    afterRecordSaved: function (rec) {
        this.setTitle('Time Series \u2013 ' + rec.get('name'));
        this.form.getForm().findField('formula').setReadOnly(true);
        this.form.getForm().findField('granularity').setReadOnly(true);
    }
});
