// @ts-nocheck: type errors remain in this ported module (see MIGRATION_REPORT.md); remove when fixed
/*
 * Ported from app/util/Api.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Thin promise wrapper over Ext.Ajax for calls that are not plain CRUD (validate, approve, upload, bulk saves).
 * Also installs the global hooks every request shares: user header, JSON error parsing and error toasts.
 */
Ext.define('GT.util.Api', {
    singleton: true,
    requires: ['Ext.Ajax', 'Ext.Promise', 'GT.util.Session', 'GT.util.Toast'],

    baseUrl: 'api',

    init: function () {
        Ext.Ajax.setTimeout(60000);
        Ext.Ajax.on('beforerequest', function (conn, options) {
            options.headers = Ext.apply({ 'X-GT-User': GT.util.Session.user }, options.headers);
        });
    },

    url: function (path) {
        return this.baseUrl + (path.charAt(0) === '/' ? path : '/' + path);
    },

    /**
     * @param {Object} opts { method, path, params, data, silent, reason }
     * @return {Ext.Promise} resolves with the "data" member of the response
     */
    request: function (opts) {
        var me = this;
        var headers = {};
        if (opts.reason) {
            headers['X-GT-Reason'] = encodeURIComponent(opts.reason);
        }
        return new Ext.Promise(function (resolve, reject) {
            Ext.Ajax.request({
                url: me.url(opts.path),
                method: opts.method || 'GET',
                params: opts.params,
                jsonData: opts.data,
                headers: headers,
                success: function (response) {
                    var body = me.decode(response);
                    if (body && body.success === false) {
                        reject(me.fail(body, response, opts));
                        return;
                    }
                    resolve(body ? body.data : null);
                },
                failure: function (response) {
                    reject(me.fail(me.decode(response), response, opts));
                }
            });
        });
    },

    get: function (path, params, opts) { return this.request(Ext.apply({ method: 'GET', path: path, params: params }, opts)); },
    post: function (path, data, opts) { return this.request(Ext.apply({ method: 'POST', path: path, data: data || {} }, opts)); },
    put: function (path, data, opts) { return this.request(Ext.apply({ method: 'PUT', path: path, data: data || {} }, opts)); },
    del: function (path, opts) { return this.request(Ext.apply({ method: 'DELETE', path: path }, opts)); },

    decode: function (response) {
        try {
            return response.responseJson || Ext.decode(response.responseText || 'null', true);
        } catch (e) {
            return null;
        }
    },

    /** Builds an Error carrying the server message and field errors, and shows it unless the caller is silent. */
    fail: function (body, response, opts) {
        var message = this.messageFrom(body, response);
        var err = new Error(message);
        err.status = response.status;
        err.fieldErrors = (body && body.errors) || null;
        if (!opts || !opts.silent) {
            GT.util.Toast.error(message);
        }
        return err;
    },

    messageFrom: function (body, response) {
        if (body && body.message) {
            return body.message;
        }
        if (response.timedout) {
            return 'The server did not answer in time. Try again.';
        }
        if (response.status === 0) {
            return 'Cannot reach the server. Is "npm start" still running?';
        }
        return 'Request failed (' + response.status + ' ' + (response.statusText || '') + ')';
    }
});
