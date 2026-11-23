/*
 * Ported from app/view/reference/LegalEntities.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.view.reference.LegalEntities', {
    extend: 'GT.ux.panel.MasterDetail',
    xtype: 'gt-legalentities',
    requires: ['GT.model.LegalEntity', 'GT.store.LegalEntities', 'Ext.form.field.Checkbox'],

    modelName: 'GT.model.LegalEntity',
    entityName: 'Legal Entity',
    listTitle: 'Legal Entities',
    editPermission: 'reference.edit',
    deletePermission: 'reference.delete',
    lookupType: 'legalEntities',
    auditEntityType: 'Legal Entity',

    statics: {
        /** Fields of the entry form, shared by this screen and the pop-up entry window. */
        formItems: function () {
            return [
                { xtype: 'textfield', name: 'code', fieldLabel: 'Code', allowBlank: false, maxLength: 6, enforceMaxLength: true },
                { xtype: 'textfield', name: 'name', fieldLabel: 'Name', allowBlank: false, maxLength: 80 },
                { xtype: 'textfield', name: 'country', fieldLabel: 'Country' },
                { xtype: 'textfield', name: 'taxId', fieldLabel: 'Tax Id', emptyText: 'Synthetic id' },
                { xtype: 'checkbox', name: 'enabled', fieldLabel: 'Enabled', inputValue: true, uncheckedValue: false }
            ];
        }
    },

    initComponent: function () {
        this.store = { type: 'gt-legalentities', sorters: ['name'] };
        this.columns = [
            { text: 'Code', dataIndex: 'code', width: 80, filter: 'string' },
            { text: 'Name', dataIndex: 'name', flex: 1, minWidth: 220, filter: 'string' },
            { text: 'Country', dataIndex: 'country', width: 110, filter: 'list' },
            { text: 'Tax Id', dataIndex: 'taxId', width: 150, filter: 'string' },
            { text: 'Enabled', dataIndex: 'enabled', xtype: 'booleancolumn', trueText: 'Yes', falseText: 'No', width: 90, align: 'center', filter: 'boolean' }
        ];
        this.formItems = this.self.formItems();
        this.callParent(arguments);
    }
});
