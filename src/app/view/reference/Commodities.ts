/*
 * Ported from app/view/reference/Commodities.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** Commodities and the contract types each one may be used with (drives the commodity choices on contracts). */
Ext.define('GT.view.reference.Commodities', {
    extend: 'GT.ux.panel.MasterDetail',
    xtype: 'gt-commodities',
    requires: ['GT.model.Commodity', 'GT.store.Commodities', 'GT.ux.form.LookupTag', 'Ext.form.field.Checkbox'],

    modelName: 'GT.model.Commodity',
    entityName: 'Commodity',
    listTitle: 'Commodities',
    editPermission: 'reference.edit',
    deletePermission: 'reference.delete',
    lookupType: 'commodities',
    auditEntityType: 'Commodity',
    formWidth: 480,

    statics: {
        /** Fields of the entry form, shared by this screen and the pop-up entry window. */
        formItems: function () {
            return [
                { xtype: 'textfield', name: 'name', fieldLabel: 'Name', allowBlank: false, maxLength: 60 },
                { xtype: 'checkbox', name: 'enabled', fieldLabel: 'Enabled', inputValue: true, uncheckedValue: false },
                { xtype: 'gt-lookuptag', name: 'contractTypes', fieldLabel: 'Contract Types', lookupType: 'contractTypes', emptyText: 'All contract types' }
            ];
        }
    },

    initComponent: function () {
        this.store = { type: 'gt-commodities', sorters: ['name'] };
        this.columns = [
            { text: 'Name', dataIndex: 'name', width: 220, filter: 'string' },
            { text: 'Enabled', dataIndex: 'enabled', xtype: 'booleancolumn', trueText: 'Yes', falseText: 'No', width: 90, align: 'center', filter: 'boolean' },
            { text: 'System', dataIndex: 'isSystem', xtype: 'booleancolumn', trueText: 'Yes', falseText: 'No', width: 84, align: 'center', filter: 'boolean' },
            { text: 'Contract Types', dataIndex: 'contractTypeList', flex: 1, minWidth: 260 }
        ];
        this.formItems = this.self.formItems();
        this.callParent(arguments);
    }
});
