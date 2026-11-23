/*
 * Ported from app/core/BaseController.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Common controller helpers: API access, masking, confirmations, toasts, opening screens, and pushing
 * server-side field errors back into a form.
 */
Ext.define('GT.core.BaseController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.gt-base',
    requires: ['GT.util.Api', 'GT.util.Toast', 'GT.util.Screens', 'Ext.Promise', 'Ext.window.MessageBox'],

    api: function () {
        return GT.util.Api;
    },

    mask: function (msg, cmp) {
        (cmp || this.getView()).mask(msg || 'Loading...');
    },

    unmask: function (cmp) {
        var c = cmp || this.getView();
        if (c && !c.destroyed) {
            c.unmask();
        }
    },

    /** Runs a promise-returning function with the view masked. */
    busy: function (msg, fn) {
        var me = this;
        me.mask(msg);
        return Ext.Promise.resolve().then(fn).then(function (r) { me.unmask(); return r; }, function (e) { me.unmask(); throw e; });
    },

    toast: function (msg, type) {
        GT.util.Toast.show(msg, type || 'success');
    },

    confirm: function (title, msg) {
        return new Ext.Promise(function (resolve) {
            Ext.Msg.confirm(title, msg, function (btn) { resolve(btn === 'yes'); });
        });
    },

    prompt: function (title, msg, multiline) {
        return new Ext.Promise(function (resolve) {
            Ext.Msg.prompt(title, msg, function (btn, text) { resolve(btn === 'ok' ? text : null); }, null, !!multiline);
        });
    },

    openScreen: function (key, id) {
        GT.util.Screens.open(key, id);
    },

    /** err.fieldErrors = { fieldName: 'message' } from the API's 400 responses. */
    applyFieldErrors: function (form, err) {
        if (!err || !err.fieldErrors || !form) {
            return;
        }
        var basic = form.isFormPanel ? form.getForm() : form;
        Ext.Object.each(err.fieldErrors, function (name, message) {
            var field = basic.findField(name);
            if (field) {
                field.markInvalid(message);
            }
        });
    },

    /** Tells other open screens that data of this entity type changed (they may reload). */
    notifyChange: function (entity) {
        Ext.GlobalEvents.fireEvent('gt-datachanged', entity);
    },

    /** Swallows an already-reported error so promise chains do not log it twice. */
    ignore: function () {}
});
