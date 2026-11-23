/*
 * Ported from app/view/contract/ComponentWindow.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Pop-up for one contract component. Which attributes apply depends on the component type: a fixed price,
 * an index series plus adder, or an external reference time series that supplies volumes.
 */
Ext.define('GT.view.contract.ComponentWindow', {
    extend: 'GT.ux.window.EntryWindow',
    xtype: 'gt-componentwindow',
    requires: ['GT.ux.form.LookupCombo', 'Ext.form.FieldSet', 'Ext.form.field.Number', 'Ext.form.field.ComboBox', 'Ext.form.field.Display'],

    width: 760,
    height: 560,
    iconCls: 'x-fa fa-cube',
    editPermission: 'contracts.edit',
    auditEntityType: 'Contract Component',
    successMessage: 'Component saved',

    contractCommodities: null,
    contractName: '',

    initComponent: function () {
        var me = this;
        me.title = (me.record.phantom ? 'New Component' : 'Modify Component') + ' – ' + me.contractName;
        me.formConfig = { fieldDefaults: { labelAlign: 'right', labelWidth: 130, msgTarget: 'side', anchor: '100%' } };
        me.formItems = [{
            xtype: 'fieldset', title: 'Basic Attributes', layout: { type: 'column' }, defaults: { columnWidth: 0.5, layout: 'anchor', xtype: 'container', defaults: { anchor: '100%' } },
            items: [{
                items: [
                    { xtype: 'displayfield', fieldLabel: 'Contract', value: me.contractName },
                    { xtype: 'combobox', name: 'commodity', fieldLabel: 'Commodity', store: me.contractCommodities || [], editable: false, forceSelection: true,
                        emptyText: 'From the contract' },
                    { xtype: 'gt-lookup', name: 'product', fieldLabel: 'Product', lookupType: 'products', allowBlank: false }
                ]
            }, {
                margin: '0 0 0 12',
                items: [
                    { xtype: 'textfield', name: 'name', fieldLabel: 'Name', allowBlank: false, maxLength: 80 },
                    { xtype: 'gt-lookup', name: 'granularity', fieldLabel: 'Granularity', lookupType: 'granularities', allowBlank: false, editable: false },
                    { xtype: 'gt-lookup', name: 'type', fieldLabel: 'Type', lookupType: 'componentTypes', allowBlank: false, editable: false,
                        listeners: { change: function (f, v) { me.syncType(v); } } }
                ]
            }]
        }, {
            xtype: 'fieldset', itemId: 'fixedSet', title: 'Fixed Price',
            items: [{ xtype: 'numberfield', name: 'price', fieldLabel: 'Price (₹/MWh)', minValue: 0, maxValue: 20000, width: 360, anchor: null }]
        }, {
            xtype: 'fieldset', itemId: 'indexSet', title: 'Index Price', hidden: true,
            items: [
                { xtype: 'gt-lookup', name: 'indexSeriesId', fieldLabel: 'Index Series', lookupType: 'timeseries', editScreen: 'timeseries' },
                { xtype: 'numberfield', name: 'adder', fieldLabel: 'Adder (₹/MWh)', width: 360, anchor: null }
            ]
        }, {
            xtype: 'fieldset', itemId: 'refSet', title: 'External Reference', hidden: true,
            items: [
                { xtype: 'gt-lookup', name: 'referenceSeriesId', fieldLabel: 'Reference Series', lookupType: 'timeseries', editScreen: 'timeseries' },
                { xtype: 'combobox', name: 'updateValue', fieldLabel: 'Update Value', editable: false,
                    store: ['When underlying data changes', 'On demand only', 'Daily at 06:00'] }
            ]
        }, {
            xtype: 'fieldset', title: 'Additional Attributes', collapsible: true, collapsed: true,
            items: [{ xtype: 'combobox', name: 'usage', fieldLabel: 'Usage', editable: false, store: ['Price', 'Volume', 'Both'], width: 360, anchor: null }]
        }];
        me.callParent(arguments);
        me.syncType(me.record.get('type'));
    },

    afterRecordSaved: function () {
        this.setTitle('Modify Component \u2013 ' + this.contractName);
    },

    /** Shows the fieldset for the chosen type and makes its key field mandatory. */
    syncType: function (type) {
        var form = this.form.getForm();
        var sets = { 'Fixed Price': ['fixedSet', 'price'], 'Index Price': ['indexSet', 'indexSeriesId'], 'External Reference': ['refSet', 'referenceSeriesId'] };
        Ext.Object.each(sets, function (t, cfg) {
            var active = t === type;
            this.down('#' + cfg[0]).setHidden(!active);
            var key = form.findField(cfg[1]);
            key.allowBlank = !active;
            key.clearInvalid();
        }, this);
    },

    /** Values of hidden type sections are cleared so they do not linger on the server. */
    beforeRecordSave: function (rec) {
        var type = rec.get('type');
        if (type !== 'Fixed Price') { rec.set('price', null); }
        if (type !== 'Index Price') { rec.set({ indexSeriesId: null, adder: null }); }
        if (type !== 'External Reference') { rec.set('referenceSeriesId', null); }
        rec.set('usage', rec.get('usage') || (type === 'External Reference' ? 'Volume' : 'Price'));
    }
});
