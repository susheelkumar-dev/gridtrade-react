/*
 * Ported from app/view/dashboard/Dashboard.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** Landing screen: KPIs, volume by product chart, notices, recent activity and quick actions. */
Ext.define('GT.view.dashboard.Dashboard', {
    extend: 'Ext.container.Container',
    xtype: 'gt-dashboard',
    requires: [
        'GT.view.dashboard.DashboardController', 'GT.ux.grid.GenericGrid', 'GT.util.Format',
        'Ext.chart.CartesianChart', 'Ext.chart.series.Bar', 'Ext.chart.axis.Numeric', 'Ext.chart.axis.Category',
        'Ext.chart.legend.Legend', 'Ext.chart.interactions.ItemHighlight'
    ],

    controller: 'dashboard',
    cls: 'gt-dashboard',
    scrollable: 'y',
    padding: 14,
    layout: { type: 'vbox', align: 'stretch' },
    listeners: { screenaction: 'onScreenAction' },

    items: [{
        xtype: 'component',
        reference: 'kpis',
        cls: 'gt-kpis',
        tpl: [
            '<div class="gt-kpi-row">',
            '<tpl for=".">',
            '<div class="gt-kpi gt-kpi-{tone}" data-screen="{screen}" role="button" tabindex="0">',
            '<div class="gt-kpi-icon"><i class="fa {icon}"></i></div>',
            '<div><div class="gt-kpi-value">{value}</div><div class="gt-kpi-label">{label}</div></div>',
            '</div>',
            '</tpl>',
            '</div>'
        ],
        data: [],
        listeners: { click: { element: 'el', delegate: '.gt-kpi', fn: 'onKpiClick' } }
    }, {
        xtype: 'container',
        layout: { type: 'hbox', align: 'stretch' },
        height: 330,
        margin: '14 0 0 0',
        items: [{
            xtype: 'panel', flex: 3, title: 'Traded volume by product (MW)', iconCls: 'x-fa fa-chart-bar', cls: 'gt-card', layout: 'fit',
            items: [{
                xtype: 'cartesian', reference: 'volumeChart', insetPadding: '24 24 8 8',
                colors: ['#0f766e', '#f59e0b'],
                store: { fields: ['product', 'buy', 'sell'], data: [] },
                legend: { type: 'dom', docked: 'bottom' },
                interactions: ['itemhighlight'],
                axes: [
                    { type: 'numeric', position: 'left', fields: ['buy', 'sell'], minimum: 0, grid: true, title: { text: 'MW', fontSize: 12 } },
                    { type: 'category', position: 'bottom', fields: 'product' }
                ],
                series: [{
                    type: 'bar', xField: 'product', yField: ['buy', 'sell'], title: ['Buy', 'Sell'], stacked: true,
                    style: { minGapWidth: 26 },
                    highlight: { fillStyle: '#115e59' },
                    tooltip: {
                        trackMouse: true,
                        renderer: function (tooltip, record, item) {
                            tooltip.setHtml(record.get('product') + ' · ' + (item.field === 'buy' ? 'Buy' : 'Sell') + ': <b>' + record.get(item.field) + ' MW</b>');
                        }
                    }
                }]
            }]
        }, {
            xtype: 'panel', flex: 2, margin: '0 0 0 14', title: 'Notices', iconCls: 'x-fa fa-bullhorn', cls: 'gt-card', scrollable: 'y',
            items: [{
                xtype: 'component', reference: 'notices', padding: 12,
                tpl: ['<tpl for="."><div class="gt-notice gt-notice-{level}"><div class="gt-notice-title">{title}</div><div>{text}</div></div></tpl>'],
                data: []
            }]
        }]
    }, {
        xtype: 'container',
        layout: { type: 'hbox', align: 'stretch' },
        height: 330,
        margin: '14 0 0 0',
        items: [{
            xtype: 'gt-genericgrid', flex: 3, title: 'Recent activity', iconCls: 'x-fa fa-history', cls: 'gt-card gt-genericgrid',
            reference: 'activityGrid', enableColumnFilters: false, enableColumnChooser: false, enableExport: false, enableSearch: false,
            store: { fields: ['id', 'entityType', 'entityId', 'entityName', 'action', 'user', { name: 'at', type: 'date', dateFormat: 'c' }], data: [] },
            listeners: { linkclick: 'onActivityLink' },
            columns: [
                { text: 'When', dataIndex: 'at', width: 140, renderer: GT.util.Format.dateTime },
                { text: 'Type', dataIndex: 'entityType', width: 140 },
                { text: 'Record', dataIndex: 'entityName', xtype: 'gt-linkcolumn', flex: 1 },
                { text: 'Action', dataIndex: 'action', xtype: 'gt-statuscolumn', width: 100 },
                { text: 'User', dataIndex: 'user', width: 120 }
            ]
        }, {
            xtype: 'panel', flex: 2, margin: '0 0 0 14', title: 'Quick actions', iconCls: 'x-fa fa-bolt', cls: 'gt-card',
            bodyPadding: 14, layout: { type: 'vbox', align: 'stretch' },
            defaults: { xtype: 'button', margin: '0 0 10 0', textAlign: 'left', scale: 'medium', handler: 'onQuickAction' },
            items: [
                { text: 'Capture a new contract', iconCls: 'x-fa fa-file-alt', screen: 'contract', screenId: 'new', permission: 'contracts.edit' },
                { text: 'Enter a trade', iconCls: 'x-fa fa-exchange-alt', screen: 'trades', action: 'new', permission: 'trades.edit' },
                { text: 'Upload trades or meter data (CSV)', iconCls: 'x-fa fa-cloud-upload-alt', screen: 'ingestion', permission: 'data.edit' },
                { text: 'Review contracts awaiting approval', iconCls: 'x-fa fa-check-square', screen: 'contracts', action: 'pending', permission: 'contracts.view' },
                { text: 'Who changed what? Open the audit trail', iconCls: 'x-fa fa-history', screen: 'audit', permission: 'audit.view' }
            ]
        }]
    }]
});
