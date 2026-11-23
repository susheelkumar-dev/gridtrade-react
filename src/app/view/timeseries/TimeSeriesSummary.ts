/*
 * Ported from app/view/timeseries/TimeSeriesSummary.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** Catalogue of time series (meters, price curves, shapes). "View" opens the interval data. */
Ext.define('GT.view.timeseries.TimeSeriesSummary', {
    extend: 'GT.ux.grid.GenericGrid',
    xtype: 'gt-timeseriessummary',
    requires: ['GT.view.timeseries.TimeSeriesSummaryController', 'GT.view.timeseries.TimeSeriesWindow', 'GT.store.TimeSeries'],

    controller: 'timeseriessummary',
    title: 'Time Series Summary',
    exportFileName: 'Time series',
    enableFilterRow: true,
    listeners: { linkclick: 'onLink', itemdblclick: 'onEdit' },

    initComponent: function () {
        this.store = { type: 'gt-timeseries', autoLoad: true, sorters: ['name'] };
        this.toolbarActions = [
            { text: 'New Series', iconCls: 'x-fa fa-plus', handler: 'onNew', permission: 'data.edit' },
            { text: 'Edit', iconCls: 'x-fa fa-pencil-alt', handler: 'onEdit' }
        ];
        this.columns = {
            defaults: { filter: 'list' },
            items: [
                { text: 'Name', dataIndex: 'name', xtype: 'gt-linkcolumn', width: 250, filter: 'string' },
                { text: 'Data', dataIndex: 'id', xtype: 'gt-linkcolumn', linkText: 'View', width: 70, align: 'center', filter: null, excludeFromExport: true },
                { text: 'Enabled', dataIndex: 'enabled', xtype: 'booleancolumn', trueText: 'Yes', falseText: 'No', width: 90, align: 'center', filter: 'boolean' },
                { text: 'System', dataIndex: 'isSystem', xtype: 'booleancolumn', trueText: 'Yes', falseText: 'No', width: 84, align: 'center', filter: 'boolean' },
                { text: 'Formula', dataIndex: 'formula', width: 220, filter: 'string' },
                { text: 'Type', dataIndex: 'type', width: 140 },
                { text: 'Profile Type', dataIndex: 'profileType', width: 120 },
                { text: 'Granularity', dataIndex: 'granularity', width: 110 },
                { text: 'Data Type', dataIndex: 'dataType', width: 100 },
                { text: 'Unit', dataIndex: 'unit', width: 90 },
                { text: 'Time Zone', dataIndex: 'timeZone', width: 96 },
                { text: 'Manual Entry', dataIndex: 'manual', xtype: 'booleancolumn', trueText: 'Yes', falseText: 'No', width: 110, align: 'center', filter: 'boolean' }
            ]
        };
        this.callParent(arguments);
    }
});
