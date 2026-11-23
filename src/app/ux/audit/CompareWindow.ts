/*
 * Ported from app/ux/audit/CompareWindow.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Audit trail viewer window: "Changes" tab (GT.ux.audit.AuditCompare) and "Raw JSON" tab.
 * Static helpers build it from audit entries or contract versions:
 *   GT.ux.audit.CompareWindow.showEntry(auditId)
 *   GT.ux.audit.CompareWindow.showEntries([id1, id2])
 *   GT.ux.audit.CompareWindow.showVersions([versionId1, versionId2])
 */
Ext.define('GT.ux.audit.CompareWindow', {
    extend: 'Ext.window.Window',
    xtype: 'gt-comparewindow',
    requires: ['GT.ux.audit.AuditCompare', 'GT.util.Api', 'GT.util.Format', 'GT.util.Toast', 'Ext.tab.Panel'],

    title: 'Audit Trail Viewer',
    iconCls: 'x-fa fa-history',
    width: 980,
    height: 600,
    modal: true,
    maximizable: true,
    constrainHeader: true,
    layout: 'fit',
    cls: 'gt-comparewindow',
    versions: null,

    initComponent: function () {
        var me = this;
        var versions = me.versions || [];
        me.items = [{
            xtype: 'tabpanel', border: false,
            items: [
                { title: 'Changes', iconCls: 'x-fa fa-columns', xtype: 'gt-auditcompare', versions: versions },
                { title: 'Raw JSON', iconCls: 'x-fa fa-code', xtype: 'container', scrollable: true, layout: { type: 'hbox', align: 'stretch' },
                    items: Ext.Array.map(versions, function (v) {
                        return { xtype: 'component', flex: 1, minWidth: 260, cls: 'gt-json',
                            html: '<div class="gt-json-head">' + Ext.String.htmlEncode(v.label) + '</div><pre>' +
                                Ext.String.htmlEncode(JSON.stringify(v.data, null, 2) || 'null') + '</pre>' };
                    }) }
            ]
        }];
        me.buttons = [{ text: 'Close', handler: function () { me.close(); } }];
        me.callParent(arguments);
    },

    statics: {
        /** One audit entry: before vs after. */
        showEntry: function (id) {
            return GT.util.Api.get('/audit/' + id).then(function (e) {
                var who = e.user + ' · ' + GT.util.Format.dateTime(e.at);
                var versions = [];
                if (e.before) { versions.push({ label: 'Before', sub: e.action === 'DELETE' ? who : '', data: e.before }); }
                if (e.after) { versions.push({ label: e.action === 'INSERT' ? 'Created' : 'After', sub: who, data: e.after }); }
                return Ext.create('GT.ux.audit.CompareWindow', {
                    title: 'Audit: ' + e.entityType + ' – ' + e.entityName + ' (' + e.action + ')', versions: versions
                }).show();
            });
        },

        /** Several entries for the same record, oldest first: starting state then the state after each change. */
        showEntries: function (ids) {
            ids = Ext.Array.sort(ids.slice(), function (a, b) { return a - b; });
            return Ext.Promise.all(Ext.Array.map(ids, function (id) { return GT.util.Api.get('/audit/' + id); })).then(function (entries) {
                var first = entries[0];
                var same = Ext.Array.every(entries, function (e) { return e.entityType === first.entityType && e.entityId === first.entityId; });
                if (!same) {
                    GT.util.Toast.warning('Pick changes of the same record to compare them');
                    return null;
                }
                var versions = [];
                if (first.before) { versions.push({ label: 'Before', sub: '', data: first.before }); }
                Ext.Array.each(entries, function (e) {
                    versions.push({ label: e.action, sub: e.user + ' · ' + GT.util.Format.dateTime(e.at), data: e.after || {} });
                });
                return Ext.create('GT.ux.audit.CompareWindow', { title: 'Compare: ' + first.entityType + ' – ' + first.entityName, versions: versions }).show();
            });
        },

        /** Contract versions (snapshots) side by side. */
        showVersions: function (versionIds) {
            return Ext.Promise.all(Ext.Array.map(versionIds, function (id) { return GT.util.Api.get('/versions/' + id); })).then(function (vs) {
                vs.sort(function (a, b) { return a.version - b.version; });
                return Ext.create('GT.ux.audit.CompareWindow', {
                    title: 'Contract Versions – ' + (vs[vs.length - 1].snapshot.name || ''),
                    versions: Ext.Array.map(vs, function (v) {
                        return { label: 'Version ' + v.version, sub: v.createdBy + ' · ' + GT.util.Format.dateTime(v.createdAt), data: v.snapshot };
                    })
                }).show();
            });
        }
    }
});
