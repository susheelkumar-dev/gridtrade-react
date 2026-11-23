/*
 * Ported from app/ux/form/EntryForm.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Standard entry form: right-aligned labels, required asterisks (see overrides), dirty tracking against the
 * loaded record, and helpers to focus the first invalid field and show server-side field errors.
 */
Ext.define('GT.ux.form.EntryForm', {
    extend: 'Ext.form.Panel',
    xtype: 'gt-entryform',

    cls: 'gt-entryform',
    bodyPadding: '14 18 8 10',
    scrollable: 'y',
    trackResetOnLoad: true,
    layout: 'anchor',
    fieldDefaults: { labelAlign: 'right', labelWidth: 135, msgTarget: 'side', anchor: '100%' },

    /** Validates; on failure focuses and scrolls to the first invalid field. */
    validateAndFocus: function () {
        var form = this.getForm();
        if (form.isValid()) { return true; }
        var first = form.getFields().findBy(function (f) { return !f.isDisabled() && !f.isHidden() && !f.isValid(); });
        if (first) { first.focus(); }
        return false;
    },

    applyServerErrors: function (errors) {
        var form = this.getForm();
        Ext.Object.each(errors || {}, function (name, message) {
            var f = form.findField(name);
            if (f) { f.markInvalid(message); }
        });
    },

    isFormDirty: function () {
        return this.getForm().isDirty();
    }
});
