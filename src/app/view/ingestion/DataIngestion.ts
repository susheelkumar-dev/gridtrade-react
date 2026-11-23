/*
 * Ported from app/view/ingestion/DataIngestion.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * CSV data ingestion: upload a trades or meter-readings file, see the job outcome (accepted, rejected,
 * warnings) and the row-level validation issues. Hard errors reject a row; warnings load it but flag it.
 */
Ext.define('GT.view.ingestion.DataIngestion', {
    extend: 'Ext.panel.Panel',
    xtype: 'gt-dataingestion',
    requires: ['GT.view.ingestion.DataIngestionController', 'GT.store.IngestionJobs', 'GT.store.IngestionErrors', 'GT.ux.grid.GenericGrid',
        'GT.util.Format', 'Ext.form.Panel', 'Ext.form.field.File', 'Ext.form.RadioGroup', 'Ext.form.field.Radio'],

    controller: 'dataingestion',
    viewModel: { data: { target: 'trades', selectedJob: null } },
    layout: 'border',

    items: [{
        xtype: 'form',
        region: 'north',
        reference: 'uploadForm',
        permission: 'data.edit',
        title: 'Upload a file',
        iconCls: 'x-fa fa-cloud-upload-alt',
        cls: 'gt-upload',
        bodyPadding: '12 16',
        layout: { type: 'hbox', align: 'middle' },
        items: [{
            xtype: 'radiogroup', reference: 'targetGroup', fieldLabel: 'File contains', labelWidth: 90, width: 360, columns: 2,
            items: [
                { boxLabel: 'Trades', name: 'target', inputValue: 'trades', checked: true },
                { boxLabel: 'Meter readings', name: 'target', inputValue: 'meter' }
            ],
            listeners: { change: 'onTargetChange' }
        }, {
            xtype: 'filefield', reference: 'fileField', name: 'file', hideLabel: true, width: 380, margin: '0 12 0 0',
            emptyText: 'Choose a .csv file', buttonConfig: { text: 'Browse...', iconCls: 'x-fa fa-folder-open' },
            validator: function (v) { return !v || /\.csv$/i.test(v) ? true : 'Only .csv files are accepted'; }
        }, {
            xtype: 'button', text: 'Upload & Validate', iconCls: 'x-fa fa-play', cls: 'gt-btn-primary', handler: 'onUpload'
        }, {
            xtype: 'component', flex: 1, margin: '0 0 0 18', reference: 'helpText', cls: 'gt-upload-help'
        }]
    }, {
        xtype: 'gt-genericgrid',
        region: 'center',
        reference: 'jobGrid',
        title: 'Ingestion Jobs',
        exportFileName: 'Ingestion jobs',
        enableFilterRow: true,
        store: { type: 'gt-ingestionjobs', autoLoad: true },
        listeners: { selectionchange: 'onJobSelect' },
        columns: [
            { text: 'Job', dataIndex: 'id', width: 70, align: 'right', filter: 'number' },
            { text: 'File', dataIndex: 'fileName', flex: 1, minWidth: 220, filter: 'string' },
            { text: 'Target', dataIndex: 'target', width: 100, filter: 'list', renderer: function (v) { return v === 'meter' ? 'Meter readings' : 'Trades'; } },
            { text: 'Status', dataIndex: 'status', xtype: 'gt-statuscolumn', width: 190 },
            { text: 'Rows', dataIndex: 'total', width: 80, align: 'right' },
            { text: 'Accepted', dataIndex: 'accepted', width: 96, align: 'right' },
            { text: 'Rejected', dataIndex: 'rejected', width: 96, align: 'right', renderer: function (v) { return v ? '<span class="gt-text-red">' + v + '</span>' : v; } },
            { text: 'Warnings', dataIndex: 'warnings', width: 96, align: 'right', renderer: function (v) { return v ? '<span class="gt-text-amber">' + v + '</span>' : v; } },
            { text: 'User', dataIndex: 'user', width: 120, filter: 'list' },
            { text: 'Started', dataIndex: 'startedAt', width: 150, renderer: GT.util.Format.dateTime },
            { text: 'Duration', dataIndex: 'durationMs', width: 96, align: 'right', renderer: function (v) { return v === null ? '' : (v / 1000).toFixed(2) + ' s'; } }
        ]
    }, {
        xtype: 'gt-genericgrid',
        region: 'south',
        reference: 'errorGrid',
        height: 270,
        split: true,
        collapsible: true,
        title: 'Row-level issues',
        iconCls: 'x-fa fa-exclamation-triangle',
        exportFileName: 'Ingestion issues',
        emptyMessage: 'Select a job to see its row-level issues',
        store: { type: 'gt-ingestionerrors', sorters: ['row'] },
        columns: [
            { text: 'Row', dataIndex: 'row', width: 70, align: 'right', filter: 'number' },
            { text: 'Column', dataIndex: 'column', width: 160, filter: 'list' },
            { text: 'Severity', dataIndex: 'severity', xtype: 'gt-statuscolumn', width: 110 },
            { text: 'Message', dataIndex: 'message', flex: 1, filter: 'string' }
        ]
    }]
});
