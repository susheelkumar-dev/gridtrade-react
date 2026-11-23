/*
 * Ported from app/ux/window/EntryWindow.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Modal pop-up entry: a GT.ux.form.EntryForm bound to a record, with Save, Save & Close, Reset and Close,
 * a guard against closing with unsaved changes, and an optional collapsible "Recent Changes" audit panel.
 * Saving uses the record's REST proxy; 'saved' fires with (window, record) on success. The window stays open
 * after Save so the user can keep working on the record (Save & Close closes it).
 *
 *   Ext.create('GT.view.trade.TradeWindow', { record: rec }).show();
 */
Ext.define('GT.ux.window.EntryWindow', {
    extend: 'Ext.window.Window',
    xtype: 'gt-entrywindow',
    requires: ['GT.ux.form.EntryForm', 'GT.ux.audit.RecentChanges', 'GT.util.Toast', 'GT.util.Session'],

    modal: true,
    constrainHeader: true,
    closeAction: 'destroy',
    layout: 'border',
    width: 720,
    height: 520,
    minWidth: 480,
    minHeight: 320,
    resizable: true,
    maximizable: true,
    cls: 'gt-entrywindow',

    /** @cfg {Ext.data.Model} record The record to edit (phantom = create). */
    record: null,
    /** @cfg {Array} formItems Fields of the form. */
    formItems: null,
    /** @cfg {Object} formConfig Extra config for the form. */
    formConfig: null,
    /** @cfg {String} auditEntityType Shows the Recent Changes panel for this entity type. */
    auditEntityType: null,
    saveText: 'Save',
    successMessage: 'Saved',
    /** @cfg {Boolean} readOnly Disables editing (e.g. settled trades). */
    readOnly: false,
    /** @cfg {String} editPermission permission needed to save (e.g. 'reference.edit'); without it the window is read only. */
    editPermission: null,

    initComponent: function () {
        var me = this;
        var noRight = me.editPermission && !GT.util.Session.can(me.editPermission);
        if (noRight) { me.readOnly = true; }
        me.items = [Ext.apply({
            xtype: 'gt-entryform', region: 'center', itemId: 'entryForm', border: false, items: me.formItems
        }, me.formConfig)];
        if (me.auditEntityType) {
            me.items.push({
                xtype: 'gt-recentchanges', region: 'east', itemId: 'recentChanges', width: 320, split: true,
                collapsible: true, collapsed: true, titleCollapse: true, collapseDirection: 'right',
                entityType: me.auditEntityType, entityId: me.record && !me.record.phantom ? me.record.getId() : null
            });
        }
        me.bbar = {
            cls: 'gt-window-bbar',
            items: [
                { xtype: 'tbtext', itemId: 'statusText', cls: 'gt-muted' }, '->',
                { text: 'Reset', iconCls: 'x-fa fa-undo', itemId: 'resetBtn', handler: me.onReset, scope: me, hidden: me.readOnly },
                { text: 'Close', itemId: 'cancelBtn', handler: function () { me.close(); } },
                { text: 'Save & Close', iconCls: 'x-fa fa-check', itemId: 'saveCloseBtn', handler: function () { me.onSave(true); }, hidden: me.readOnly },
                { text: me.saveText, iconCls: 'x-fa fa-save', itemId: 'saveBtn', cls: 'gt-btn-primary', handler: function () { me.onSave(false); }, hidden: me.readOnly }
            ]
        };
        me.callParent(arguments);
        me.form = me.down('#entryForm');
        if (me.record) {
            me.form.loadRecord(me.record);
        }
        if (me.readOnly) {
            me.form.getForm().getFields().each(function (f) { f.setReadOnly(true); });
        }
        me.on('beforeclose', me.onBeforeClose, me);
        me.setStatus(noRight ? '<i class="fa fa-lock"></i> Read only: you do not have permission to change this' : (me.record && me.record.phantom ? 'New record' : ''));
    },

    setStatus: function (text) {
        var t = this.down('#statusText');
        if (t) { t.setHtml(text || ''); }
    },

    /** Hook for subclasses: adjust the record after the form values are copied in. */
    beforeRecordSave: Ext.emptyFn,

    /** Hook for subclasses: called after a save when the window stays open (e.g. update the title). */
    afterRecordSaved: Ext.emptyFn,

    /** @param {Boolean} close close the window after a successful save */
    onSave: function (close) {
        var me = this;
        var rec = me.record;
        if (!me.form.validateAndFocus()) {
            GT.util.Toast.warning('Please correct the highlighted fields');
            return;
        }
        if (me.fireEvent('beforesave', me, rec) === false) { return; }
        me.form.getForm().updateRecord(rec);
        me.beforeRecordSave(rec);
        if (!rec.phantom && !rec.dirty) {
            if (close === true) { me.forceClose(); } else { GT.util.Toast.info('No changes to save'); }
            return;
        }
        var wasNew = rec.phantom;
        me.mask('Saving...');
        rec.savePromise().then(function (saved) {
            me.unmask();
            GT.util.Toast.success(me.successMessage);
            me.fireEvent('saved', me, saved);
            if (close === true) {
                me.forceClose();
                return;
            }
            // Stay open: reload the saved values (the form is clean again), refresh title and history.
            me.record = saved;
            me.form.loadRecord(saved);
            me.afterRecordSaved(saved, wasNew);
            me.setStatus('<i class="fa fa-check-circle gt-text-green"></i> Saved at ' + Ext.Date.format(new Date(), 'H:i:s'));
            var recent = me.down('#recentChanges');
            if (recent) { recent.setEntity(me.auditEntityType, saved.getId()); }
        }, function (err) {
            me.unmask();
            rec.reject();
            me.form.applyServerErrors(err.fieldErrors);
        });
    },

    onReset: function () {
        this.form.getForm().reset();
    },

    onBeforeClose: function () {
        var me = this;
        if (me.allowClose || me.readOnly || !me.form || !me.isWindowDirty()) { return true; }
        Ext.Msg.confirm('Discard changes?', 'You have unsaved changes in this window. Close it anyway?', function (btn) {
            if (btn === 'yes') { me.forceClose(); }
        });
        return false;
    },

    /** Unsaved changes? Subclasses with extra editors (e.g. a permission matrix) add theirs. */
    isWindowDirty: function () {
        return this.form.isFormDirty();
    },

    forceClose: function () {
        this.allowClose = true;
        this.close();
    }
});
