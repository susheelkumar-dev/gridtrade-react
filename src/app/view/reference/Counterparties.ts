/*
 * Ported from app/view/reference/Counterparties.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.view.reference.Counterparties', {
    extend: 'GT.ux.panel.MasterDetail',
    xtype: 'gt-counterparties',
    requires: ['GT.model.Counterparty', 'GT.store.Counterparties', 'GT.ux.form.LookupCombo', 'GT.util.Format', 'Ext.form.field.Number', 'Ext.form.field.Checkbox'],

    modelName: 'GT.model.Counterparty',
    entityName: 'Counterparty',
    listTitle: 'Counterparties',
    editPermission: 'reference.edit',
    deletePermission: 'reference.delete',
    lookupType: 'counterparties',
    auditEntityType: 'Counterparty',
    newDefaults: { type: 'Industrial', region: 'North' },

    statics: {
        /** Fields of the entry form, shared by this screen and the pop-up entry window. */
        formItems: function () {
            return [
                { xtype: 'textfield', name: 'code', fieldLabel: 'Code', allowBlank: false, maxLength: 6, enforceMaxLength: true, fieldStyle: 'text-transform:uppercase' },
                { xtype: 'textfield', name: 'name', fieldLabel: 'Name', allowBlank: false, maxLength: 80 },
                { xtype: 'gt-lookup', name: 'type', fieldLabel: 'Type', lookupType: 'counterpartyTypes', allowBlank: false, editable: false },
                { xtype: 'gt-lookup', name: 'region', fieldLabel: 'Region', lookupType: 'regions', editable: false },
                { xtype: 'numberfield', name: 'creditLimit', fieldLabel: 'Credit Limit (₹ lakh)', minValue: 0 },
                { xtype: 'checkbox', name: 'enabled', fieldLabel: 'Enabled', boxLabel: 'Available for new contracts and trades', inputValue: true, uncheckedValue: false }
            ];
        }
    },

    initComponent: function () {
        this.store = { type: 'gt-counterparties', sorters: ['name'] };
        this.columns = [
            { text: 'Code', dataIndex: 'code', width: 80, filter: 'string' },
            { text: 'Name', dataIndex: 'name', flex: 1, minWidth: 200, filter: 'string' },
            { text: 'Type', dataIndex: 'type', width: 120, filter: 'list' },
            { text: 'Region', dataIndex: 'region', width: 100, filter: 'list' },
            { text: 'Credit Limit (₹ lakh)', dataIndex: 'creditLimit', width: 160, align: 'right', renderer: GT.util.Format.indian, filter: 'number' },
            { text: 'Enabled', dataIndex: 'enabled', xtype: 'booleancolumn', trueText: 'Yes', falseText: 'No', width: 90, align: 'center', filter: 'boolean' }
        ];
        this.formItems = this.self.formItems();
        this.callParent(arguments);
    }
});
