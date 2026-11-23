/*
 * Ported from app/view/reference/ReferenceWindow.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Pop-up entry for one reference record (counterparty, legal entity, commodity). It reuses the fields of the
 * matching maintenance screen (its static formItems), so the screen and the pop-up never drift apart.
 *
 *   Ext.create('GT.view.reference.ReferenceWindow', { screenClass: 'GT.view.reference.Counterparties', record: rec }).show();
 */
Ext.define('GT.view.reference.ReferenceWindow', {
    extend: 'GT.ux.window.EntryWindow',
    xtype: 'gt-referencewindow',
    requires: ['GT.view.reference.Counterparties', 'GT.view.reference.LegalEntities', 'GT.view.reference.Commodities'],

    width: 620,
    height: 470,
    iconCls: 'x-fa fa-book',
    editPermission: 'reference.edit',

    /** @cfg {String} screenClass maintenance screen class providing formItems, entityName and auditEntityType. */
    screenClass: null,

    initComponent: function () {
        var me = this;
        var screen = Ext.ClassManager.get(me.screenClass);
        var proto = screen.prototype;
        me.entityName = proto.entityName;
        me.auditEntityType = proto.auditEntityType;
        me.successMessage = proto.entityName + ' saved';
        me.formItems = screen.formItems();
        me.title = me.buildTitle(me.record);
        me.callParent(arguments);
    },

    buildTitle: function (rec) {
        return rec.phantom ? 'New ' + this.entityName : this.entityName + ' – ' + rec.get('name');
    },

    afterRecordSaved: function (rec) {
        this.setTitle(this.buildTitle(rec));
    }
});
