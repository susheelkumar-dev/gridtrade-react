/*
 * Ported from app/core/RestProxy.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * REST proxy every model uses: the API's envelope ({ success, data, total, message, errors }), ISO dates,
 * and server messages surfaced as toasts. Field errors are kept on the operation for forms to highlight.
 */
Ext.define('GT.core.RestProxy', {
    extend: 'Ext.data.proxy.Rest',
    alias: 'proxy.gt-rest',
    requires: ['GT.util.Toast'],

    noCache: false,
    reader: { type: 'json', rootProperty: 'data', totalProperty: 'total', messageProperty: 'message', successProperty: 'success' },
    writer: { type: 'json', writeAllFields: false, writeRecordId: false },

    /**
     * Allows nested resource URLs such as 'api/contracts/{contractId}/components'. Placeholders are filled from
     * the record being written or, for reads, from the store's extraParams.
     */
    getUrl: function (request) {
        var url = this.callParent(arguments);
        if (url && url.indexOf('{') >= 0 && request) {
            var operation = request.getOperation();
            var records = operation && operation.getRecords ? operation.getRecords() : null;
            var record = records && records[0];
            var params = request.getParams() || {};
            url = url.replace(/\{(\w+)\}/g, function (match, key) {
                var v = record && record.get(key);
                if (v === undefined || v === null || v === '') {
                    v = params[key];
                    delete params[key];
                }
                return encodeURIComponent(v);
            });
        }
        return url;
    },

    setException: function (operation, response) {
        var body = null;
        // Ext 7 hands JSON error bodies over as responseJson (responseText is not set on failures).
        try { body = response.responseJson || Ext.decode(response.responseText || 'null', true); } catch (e) { body = null; }
        operation.gtFieldErrors = body && body.errors;
        operation.gtMessage = (body && body.message) ||
            (response.status === 0 ? 'Cannot reach the server. Is "npm start" still running?' : 'Request failed (' + response.status + ')');
        var message = operation.gtMessage;
        // Set the details first: the parent call completes the operation and runs the caller's callbacks.
        this.callParent(arguments);
        if (!operation.gtSilent) {
            GT.util.Toast.error(message);
        }
    }
});
