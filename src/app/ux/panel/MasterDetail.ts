/*
 * Ported from app/ux/panel/MasterDetail.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Maintenance screen for a reference list: grid on the left, edit form on the right, record audit below the
 * form. New / Save / Delete / Reset, a dirty-check before switching rows, and refresh of the matching cached
 * lookup after every change so combos elsewhere see it immediately.
 *
 * Subclasses only declare: modelName, store, columns, formItems, entityName, lookupType, auditEntityType.
 */
Ext.define('GT.ux.panel.MasterDetail', {
    extend: 'Ext.panel.Panel',
    xtype: 'gt-masterdetail',
    requires: ['GT.ux.grid.GenericGrid', 'GT.ux.form.EntryForm', 'GT.ux.audit.RecentChanges', 'GT.util.Lookups', 'GT.util.Toast', 'GT.util.Session'],

    layout: 'border',
    cls: 'gt-masterdetail',

    modelName: null,
    /** @cfg {Object/String} store store config for the list */
    store: null,
    columns: null,
    formItems: null,
    formWidth: 430,
    entityName: 'Record',
    lookupType: null,
    auditEntityType: null,
    newDefaults: null,
    /** @cfg {String} editPermission / deletePermission hide New/Save/Delete and make the form read only without them. */
    editPermission: null,
    deletePermission: null,
    /** @cfg {Number} selectId record to select after loading (e.g. the value of the lookup that opened this). */
    selectId: null,

    initComponent: function () {
        var me = this;
        me.items = [{
            xtype: 'gt-genericgrid', region: 'center', itemId: 'masterGrid', title: me.listTitle || null,
            store: me.store, columns: me.columns, exportFileName: me.entityName + 's', enableFilterRow: true,
            toolbarActions: [
                { text: 'New', iconCls: 'x-fa fa-plus', itemId: 'newBtn', handler: me.onNew, scope: me, permission: me.editPermission },
                { text: 'Delete', iconCls: 'x-fa fa-trash-alt', itemId: 'deleteBtn', disabled: true, handler: me.onDelete, scope: me, permission: me.deletePermission }
            ],
            listeners: { beforeselect: me.onBeforeSelect, select: me.onSelect, scope: me }
        }, {
            xtype: 'container', region: 'east', width: me.formWidth, split: true, layout: 'border', itemId: 'detailArea',
            items: [{
                xtype: 'gt-entryform', region: 'center', itemId: 'detailForm', title: me.entityName + ' Details', iconCls: 'x-fa fa-pencil-alt',
                disabled: true, items: me.formItems,
                bbar: [
                    { xtype: 'tbtext', itemId: 'formStatus', cls: 'gt-muted', html: 'Select a row or click New' }, '->',
                    { text: 'Reset', iconCls: 'x-fa fa-undo', handler: me.onReset, scope: me, permission: me.editPermission },
                    { text: 'Save', iconCls: 'x-fa fa-save', itemId: 'saveBtn', cls: 'gt-btn-primary', handler: me.onSave, scope: me, permission: me.editPermission }
                ]
            }, {
                xtype: 'gt-recentchanges', region: 'south', itemId: 'recent', height: 220, split: true, collapsible: true,
                entityType: me.auditEntityType
            }]
        }];
        me.callParent(arguments);
        me.mon(Ext.GlobalEvents, 'gt-userchange', me.applyReadOnly, me); // acting user switched: re-check edit rights
        me.grid = me.down('#masterGrid');
        me.form = me.down('#detailForm');
        me.grid.getStore().load({
            callback: function (records) {
                if (records && records.length && !me.destroyed) {
                    var target = me.selectId !== null && me.selectId !== undefined ? me.grid.getStore().getById(me.selectId) : null;
                    me.grid.getSelectionModel().select(target || 0);
                    if (target) { me.grid.ensureVisible(target); }
                }
            }
        });
    },

    setStatus: function (text) {
        this.down('#formStatus').setHtml(text);
    },

    /** Returns false (and asks) when the form has unsaved edits. */
    guardDirty: function (proceed) {
        var me = this;
        if (!me.form.isFormDirty()) { return true; }
        Ext.Msg.confirm('Discard changes?', 'You have unsaved changes to ' + (me.current && me.current.get('name') || 'this ' + me.entityName.toLowerCase()) + '. Discard them?', function (btn) {
            if (btn === 'yes') {
                me.form.getForm().reset();
                proceed();
            }
        });
        return false;
    },

    onBeforeSelect: function (sm, rec) {
        var me = this;
        return me.guardDirty(function () { sm.select(rec); });
    },

    onSelect: function (sm, rec) {
        this.edit(rec);
    },

    edit: function (rec) {
        var me = this;
        me.current = rec;
        me.form.setDisabled(false);
        me.form.loadRecord(rec);
        me.applyReadOnly();
        me.setStatus(rec.phantom ? 'New ' + me.entityName.toLowerCase() : 'Editing <b>' + Ext.String.htmlEncode(rec.get('name')) + '</b>' + (rec.get('isSystem') ? ' (system record)' : ''));
        me.grid.down('#deleteBtn').setDisabled(rec.phantom || !!rec.get('isSystem'));
        me.down('#recent').setEntity(me.auditEntityType, rec.phantom ? null : rec.getId());
    },

    /** The form is read only for users without the edit permission. */
    applyReadOnly: function () {
        var me = this;
        if (!me.current || !me.form) { return; }
        var ro = !!me.editPermission && !GT.util.Session.can(me.editPermission);
        me.form.getForm().getFields().each(function (f) { f.setReadOnly(ro); });
    },

    onNew: function () {
        var me = this;
        if (!me.guardDirty(function () { me.onNew(); })) { return; }
        me.grid.getSelectionModel().deselectAll();
        me.edit(Ext.create(me.modelName, Ext.apply({ enabled: true }, me.newDefaults)));
        var first = me.form.getForm().getFields().first();
        if (first) { first.focus(); }
    },

    onReset: function () {
        if (this.current) { this.form.loadRecord(this.current); }
    },

    onSave: function () {
        var me = this, rec = me.current;
        if (!rec) { return; }
        if (!me.form.validateAndFocus()) {
            GT.util.Toast.warning('Please correct the highlighted fields');
            return;
        }
        var wasNew = rec.phantom;
        me.form.getForm().updateRecord(rec);
        if (!wasNew && !rec.dirty) {
            GT.util.Toast.info('No changes to save');
            return;
        }
        me.mask('Saving...');
        rec.savePromise().then(function (saved) {
            me.unmask();
            if (wasNew) {
                me.grid.getStore().add(saved);
                me.grid.getSelectionModel().select(saved);
            } else {
                me.edit(saved);
            }
            GT.util.Toast.success(me.entityName + ' saved');
            if (me.lookupType) { GT.util.Lookups.reload(me.lookupType); }
        }, function (err) {
            me.unmask();
            rec.reject();
            me.form.applyServerErrors(err.fieldErrors);
        });
    },

    onDelete: function () {
        var me = this, rec = me.current;
        if (!rec || rec.phantom) { return; }
        Ext.Msg.confirm('Delete ' + me.entityName.toLowerCase(), 'Delete <b>' + Ext.String.htmlEncode(rec.get('name')) + '</b>? This is recorded in the audit trail.', function (btn) {
            if (btn !== 'yes') { return; }
            me.mask('Deleting...');
            rec.erasePromise().then(function () {
                me.unmask();
                me.current = null;
                me.form.getForm().reset(true);
                me.form.setDisabled(true);
                me.setStatus('Deleted. Select a row or click New');
                GT.util.Toast.success(me.entityName + ' deleted');
                if (me.lookupType) { GT.util.Lookups.reload(me.lookupType); }
            }, function () { me.unmask(); me.grid.getStore().rejectChanges(); });
        });
    }
});
