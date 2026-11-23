/*
 * Ported from app/view/main/Main.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Application shell: brand header with user menu, a menu bar of modules, closable screen tabs and a status bar.
 */
Ext.define('GT.view.main.Main', {
    extend: 'Ext.container.Viewport',
    xtype: 'gt-main',
    requires: [
        'Ext.layout.container.Border', 'Ext.tab.Panel', 'Ext.toolbar.Toolbar', 'Ext.menu.Menu',
        'GT.view.main.MainController', 'GT.view.main.MainModel'
    ],

    controller: 'main',
    viewModel: 'main',
    layout: 'border',
    cls: 'gt-main',

    items: [{
        region: 'north',
        xtype: 'container',
        cls: 'gt-header-wrap',
        layout: { type: 'vbox', align: 'stretch' },
        items: [{
            xtype: 'toolbar',
            cls: 'gt-header',
            height: 52,
            items: [{
                xtype: 'component',
                cls: 'gt-brand',
                html: '<div class="gt-logo"><svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><rect x="2" y="2" width="28" height="28" rx="7" fill="#0f766e"/><path d="M9 20l5-6 4 4 6-8" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="10" r="2.2" fill="#fbbf24"/></svg></div>' +
                    '<div class="gt-brand-text"><div class="gt-brand-name">GridTrade <span>Contracts</span></div><div class="gt-brand-sub">Energy trading &amp; risk management</div></div>'
            }, '->', {
                xtype: 'component', cls: 'gt-env-badge', html: 'DEMO · synthetic data'
            }, {
                xtype: 'button', cls: 'gt-header-btn', iconCls: 'x-fa fa-search', tooltip: 'Open a contract by name', handler: 'onQuickOpen'
            }, {
                xtype: 'button', cls: 'gt-header-btn gt-user-btn', reference: 'userButton', iconCls: 'x-fa fa-user-circle',
                bind: { text: '{userName}' },
                menu: {
                    items: [
                        { xtype: 'menuseparator', hidden: true },
                        { text: 'Switch user', iconCls: 'x-fa fa-exchange-alt', menu: { reference: 'userMenu', items: [] } },
                        { text: 'Reset demo data', iconCls: 'x-fa fa-database', handler: 'onResetData', permission: 'users.manage' },
                        { text: 'About this app', iconCls: 'x-fa fa-info-circle', handler: 'onAbout' }
                    ]
                }
            }]
        }, {
            xtype: 'toolbar',
            cls: 'gt-menubar',
            reference: 'menubar',
            defaults: { cls: 'gt-menubar-btn' },
            items: [
                { text: 'Dashboard', iconCls: 'x-fa fa-tachometer-alt', handler: 'onMenu', screen: 'dashboard', permission: 'dashboard.view' },
                { text: 'Contracts', iconCls: 'x-fa fa-file-alt', menu: { defaults: { handler: 'onMenu' }, items: [
                    { text: 'Contract Summary', iconCls: 'x-fa fa-list', screen: 'contracts', permission: 'contracts.view' },
                    { text: 'New Contract', iconCls: 'x-fa fa-plus', screen: 'contract', screenId: 'new', permission: 'contracts.edit' },
                    { text: 'Contract Versions', iconCls: 'x-fa fa-code-branch', screen: 'versions', permission: 'contracts.view' }
                ] } },
                { text: 'Trading', iconCls: 'x-fa fa-exchange-alt', menu: { defaults: { handler: 'onMenu' }, items: [
                    { text: 'Trade Blotter', iconCls: 'x-fa fa-list-alt', screen: 'trades', permission: 'trades.view' },
                    { text: 'New Trade', iconCls: 'x-fa fa-plus', screen: 'trades', action: 'new', permission: 'trades.edit' }
                ] } },
                { text: 'Data', iconCls: 'x-fa fa-database', menu: { defaults: { handler: 'onMenu' }, items: [
                    { text: 'Time Series', iconCls: 'x-fa fa-chart-line', screen: 'timeseries', permission: 'data.view' },
                    { text: 'Data Ingestion', iconCls: 'x-fa fa-cloud-upload-alt', screen: 'ingestion', permission: 'data.view' }
                ] } },
                { text: 'Reference Data', iconCls: 'x-fa fa-book', menu: { defaults: { handler: 'onMenu' }, items: [
                    { text: 'Counterparties', iconCls: 'x-fa fa-building', screen: 'counterparties', permission: 'reference.view' },
                    { text: 'Legal Entities', iconCls: 'x-fa fa-university', screen: 'legalEntities', permission: 'reference.view' },
                    { text: 'Commodities', iconCls: 'x-fa fa-cubes', screen: 'commodities', permission: 'reference.view' }
                ] } },
                { text: 'Audit Trail', iconCls: 'x-fa fa-history', handler: 'onMenu', screen: 'audit', permission: 'audit.view' },
                { text: 'User Management', iconCls: 'x-fa fa-users-cog', menu: { defaults: { handler: 'onMenu' }, items: [
                    { text: 'Users', iconCls: 'x-fa fa-user', screen: 'users', permission: 'users.view' },
                    { text: 'New User', iconCls: 'x-fa fa-user-plus', screen: 'users', action: 'new', permission: 'users.manage' },
                    '-',
                    { text: 'Roles', iconCls: 'x-fa fa-user-shield', screen: 'roles', permission: 'users.view' },
                    { text: 'New Role', iconCls: 'x-fa fa-plus', screen: 'roles', action: 'new', permission: 'users.manage' }
                ] } },
                '->',
                { xtype: 'tbtext', cls: 'gt-clock', bind: { html: '<i class="fa fa-clock"></i> {clock}' } }
            ]
        }]
    }, {
        region: 'center',
        xtype: 'tabpanel',
        reference: 'screens',
        cls: 'gt-screens',
        plain: false,
        deferredRender: true,
        tabBar: { cls: 'gt-tabbar' },
        defaults: { closable: true, bodyCls: 'gt-screen-body' },
        listeners: { tabchange: 'onTabChange', remove: 'onTabRemoved' }
    }, {
        region: 'south',
        xtype: 'toolbar',
        cls: 'gt-statusbar',
        height: 28,
        items: [
            { xtype: 'tbtext', bind: { html: '{apiStatusHtml}' } },
            { xtype: 'tbtext', bind: { html: 'Acting as <b>{userName}</b> ({userRole})' } },
            '->',
            { xtype: 'tbtext', html: 'GridTrade Contracts · Ext JS 7.2 demo · designed and built by Susheel Kumar as a portfolio project' }
        ]
    }]
});
