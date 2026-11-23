/*
 * Ported from app/view/timeseries/TimeSeriesData.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** Interval data for one series and day: editable grid with totals, CSV import/export, chart and change history. */
Ext.define('GT.view.timeseries.TimeSeriesData', {
    extend: 'Ext.panel.Panel',
    xtype: 'gt-timeseriesdata',
    requires: ['GT.view.timeseries.TimeSeriesDataController', 'GT.store.IntervalValues', 'GT.ux.grid.IntervalGrid', 'GT.ux.audit.RecentChanges',
        'GT.ux.form.EntryForm', 'Ext.form.field.Display', 'Ext.form.field.File',
        'Ext.chart.CartesianChart', 'Ext.chart.series.Line', 'Ext.chart.axis.Numeric', 'Ext.chart.axis.Category', 'Ext.chart.interactions.CrossZoom'],

    controller: 'timeseriesdata',
    viewModel: {
        data: { series: null, dirtyCount: 0 },
        formulas: {
            dirtyText: function (get) { var n = get('dirtyCount'); return n ? n + ' unsaved change' + (n === 1 ? '' : 's') : ''; }
        }
    },
    layout: 'border',
    listeners: { beforeclose: 'onBeforeClose' },

    items: [{
        xtype: 'gt-entryform',
        region: 'west',
        width: 330,
        split: true,
        collapsible: true,
        title: 'Series',
        iconCls: 'x-fa fa-info-circle',
        reference: 'metaForm',
        fieldDefaults: { labelAlign: 'right', labelWidth: 100 },
        defaults: { xtype: 'displayfield' },
        items: [
            { fieldLabel: 'Name', name: 'name', cls: 'gt-strong' },
            { fieldLabel: 'Formula', name: 'formula' },
            { fieldLabel: 'Type', name: 'type' },
            { fieldLabel: 'Granularity', name: 'granularity' },
            { fieldLabel: 'Unit', name: 'unit' },
            { fieldLabel: 'Time Zone', name: 'timeZone' },
            { fieldLabel: 'Manual entry', name: 'manual', renderer: function (v) { return v ? 'Allowed' : 'Read only (system feed)'; } },
            { fieldLabel: 'Description', name: 'description' }
        ]
    }, {
        xtype: 'tabpanel',
        region: 'center',
        reference: 'dataTabs',
        items: [{
            title: 'Interval Data',
            iconCls: 'x-fa fa-table',
            xtype: 'gt-intervalgrid',
            reference: 'intervalGrid',
            store: { type: 'gt-intervals' },
            exportFileName: 'Interval data',
            extraActions: [
                '-',
                { text: 'Save', iconCls: 'x-fa fa-save', cls: 'gt-btn-primary', handler: 'onSave', bind: { disabled: '{!dirtyCount}' }, permission: 'data.edit' },
                { text: 'Undo', iconCls: 'x-fa fa-undo', handler: 'onUndo', bind: { disabled: '{!dirtyCount}' }, permission: 'data.edit' },
                { xtype: 'filefield', buttonOnly: true, hideLabel: true, reference: 'importField', permission: 'data.edit',
                    buttonConfig: { text: 'Import CSV', iconCls: 'x-fa fa-upload' }, listeners: { change: 'onImport' } },
                { xtype: 'tbtext', bind: { html: '{dirtyText}' }, cls: 'gt-dirty-note' }
            ],
            listeners: { datechange: 'onDateChange', beforedatechange: 'onBeforeDateChange', edit: 'onEdited' }
        }, {
            title: 'Chart',
            iconCls: 'x-fa fa-chart-area',
            layout: 'fit',
            items: [{
                xtype: 'cartesian',
                reference: 'chart',
                insetPadding: '20 24 10 10',
                colors: ['#0f766e'],
                interactions: ['crosszoom'],
                axes: [
                    { type: 'numeric', position: 'left', fields: ['value'], grid: true, reference: 'valueAxis' },
                    { type: 'category', position: 'bottom', fields: ['label'], label: { rotate: { degrees: -45 } } }
                ],
                series: [{
                    type: 'line', xField: 'label', yField: 'value', smooth: true, marker: { radius: 3 }, fill: true, style: { fillOpacity: 0.15, lineWidth: 2 },
                    tooltip: { trackMouse: true, renderer: function (tip, rec) { tip.setHtml(rec.get('label') + ': <b>' + rec.get('value') + '</b>'); } }
                }]
            }]
        }]
    }, {
        xtype: 'gt-recentchanges',
        region: 'east',
        reference: 'recentChanges',
        title: 'Data Changes',
        width: 320,
        split: true,
        collapsible: true,
        collapsed: true,
        titleCollapse: true,
        entityType: 'Time Series Data'
    }]
});
