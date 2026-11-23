// @ts-nocheck: type errors remain in this ported module (see MIGRATION_REPORT.md); remove when fixed
/*
 * Ported from app/view/main/MainController.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Shell controller: opens screens as tabs (from menus, links and the URL), keeps the URL in step with the
 * active tab, and owns app-wide actions (switch user, reset demo data, quick open, API health).
 */
Ext.define('GT.view.main.MainController', {
    extend: 'GT.core.BaseController',
    alias: 'controller.main',
    requires: ['GT.util.Session', 'GT.util.Screens', 'GT.util.Lookups', 'GT.ux.form.LookupCombo', 'Ext.menu.CheckItem', 'Ext.util.TaskRunner'],

    routes: {
        ':screen': { action: 'onRoute' },
        ':screen/:id': { action: 'onRoute' }
    },

    newCounter: 0,

    init: function () {
        var me = this;
        me.lookup('userMenu').on('beforeshow', me.buildUserMenu, me);
        me.syncUser();
        me.applyPermissions();
        Ext.GlobalEvents.on({ 'gt-openscreen': me.openScreen, 'gt-userchange': me.onUserChange, 'gt-usersChanged': me.onUsersChanged, scope: me });
        me.runner = new Ext.util.TaskRunner();
        me.runner.start({ run: me.tick, scope: me, interval: 30000 });

        // The dashboard is always the first tab; then honour a deep link such as #contract/12.
        var token = Ext.util.History.getToken();
        me.initializing = true;
        me.openScreen('dashboard');
        me.initializing = false;
        if (token && token !== 'dashboard') {
            var parts = token.split('/');
            // After the shell's first layout, so a heavy screen does not lay out inside it.
            me.getView().on('boxready', function () { me.onRoute(parts[0], parts[1]); }, me, { single: true });
        }
    },

    destroy: function () {
        Ext.GlobalEvents.un({ 'gt-openscreen': this.openScreen, 'gt-userchange': this.onUserChange, 'gt-usersChanged': this.onUsersChanged, scope: this });
        Ext.destroy(this.runner);
        this.callParent();
    },

    tick: function () {
        var vm = this.getViewModel();
        vm.set('clock', Ext.Date.format(new Date(), 'D d-M-Y H:i') + ' IST');
        this.api().get('/health', null, { silent: true }).then(function () { vm.set('apiOk', true); }, function () { vm.set('apiOk', false); });
    },

    // ---------- screens ----------
    onRoute: function (screen, id) {
        var reg = GT.util.Screens.get(screen);
        if (!reg || (reg.perRecord && !id)) {
            return;
        }
        this.openScreen(screen, id);
    },

    /**
     * @param {String} key registry key
     * @param {String/Number} [id] record id, or 'new'
     * @param {String} [action] passed to the screen through its 'screenaction' event
     */
    openScreen: function (key, id, action) {
        var reg = GT.util.Screens.get(key);
        if (!reg) { return; }
        if (reg.permission && !GT.util.Session.can(reg.permission)) {
            this.toast(GT.util.Session.getUser().name + ' does not have access to ' + reg.title + '. Switch user or ask an administrator.', 'warning');
            return null;
        }
        var tabs = this.lookup('screens');
        var isNew = id === 'new';
        var itemId = reg.perRecord ? key + '-' + (isNew ? 'new-' + (++this.newCounter) : id) : key;
        var tab = isNew ? null : tabs.child('#' + itemId);
        if (!tab) {
            var cfg = {
                xtype: reg.view, itemId: itemId, iconCls: reg.iconCls, closable: reg.closable !== false,
                title: reg.title + (reg.perRecord ? (isNew ? ' (new)' : ' #' + id) : ''),
                screenKey: key, recordId: reg.perRecord && !isNew ? Number(id) : null
            };
            if (reg.wrap) {
                cfg = { xtype: 'panel', layout: 'fit', itemId: cfg.itemId, iconCls: cfg.iconCls, closable: cfg.closable, title: cfg.title,
                    screenKey: key, recordId: null, items: [{ xtype: reg.view }] };
            }
            tab = tabs.add(cfg);
        }
        tabs.setActiveTab(tab);
        if (action) {
            Ext.defer(function () { tab.fireEvent('screenaction', tab, action); }, 50);
        }
        return tab;
    },

    onTabChange: function (tabs, tab) {
        if (this.initializing || !tab.screenKey || (GT.util.Screens.get(tab.screenKey).perRecord && !tab.recordId)) { return; }
        var token = GT.util.Screens.token(tab.screenKey, tab.recordId);
        if (Ext.util.History.getToken() !== token) {
            this.redirectTo(token);
        }
    },

    onTabRemoved: function (tabs) {
        if (!tabs.getActiveTab() && tabs.items.getCount()) {
            tabs.setActiveTab(0);
        }
    },

    onMenu: function (item) {
        this.openScreen(item.screen, item.screenId, item.action);
    },

    onQuickOpen: function () {
        var me = this;
        var win = Ext.create('Ext.window.Window', {
            title: 'Open contract', iconCls: 'x-fa fa-search', modal: true, width: 440, bodyPadding: 14, layout: 'fit', closeAction: 'destroy',
            items: [{ xtype: 'gt-lookup', lookupType: 'contracts', emptyText: 'Type part of a contract name', hideLabel: true,
                listeners: {
                    select: function (combo, rec) { win.close(); me.openScreen('contract', rec.getId()); },
                    afterrender: function (f) { Ext.defer(f.focus, 100, f); }
                } }]
        });
        win.show();
    },

    // ---------- user ----------
    /** Rebuilt each time it opens, so users added in User Management appear straight away. */
    buildUserMenu: function () {
        var me = this;
        var menu = me.lookup('userMenu');
        menu.removeAll();
        Ext.Array.each(GT.util.Session.users, function (u) {
            menu.add({ xtype: 'menucheckitem', group: 'gt-user', text: Ext.String.htmlEncode(u.fullName) + ' <span class="gt-muted">(' + Ext.String.htmlEncode(u.roleNames || 'no role') + ')</span>',
                checked: u.username === GT.util.Session.user,
                handler: function () { GT.util.Session.setUser(u.username).catch(function (e) { me.toast(e.message, 'error'); }); } });
        });
    },

    /**
     * Shows only what the current user may use: components with a "permission" config, menu-bar menus
     * with no visible entries, and open tabs of screens the user can no longer see.
     */
    applyPermissions: function () {
        var me = this, S = GT.util.Session;
        Ext.Array.each(Ext.ComponentQuery.query('[permission]'), function (c) { c.setHidden(!S.can(c.permission)); });
        me.lookup('menubar').items.each(function (btn) {
            if (btn.menu && btn.menu.items) {
                btn.setHidden(!btn.menu.items.findBy(function (i) { return !i.hidden && !i.isXType('menuseparator'); }));
            }
        });
        var tabs = me.lookup('screens');
        Ext.Array.each(tabs.items.getRange(), function (t) {
            var reg = GT.util.Screens.get(t.screenKey);
            if (reg && reg.permission && !S.can(reg.permission) && t.closable) {
                t.allowClose = true;
                tabs.remove(t);
            }
        });
    },

    /** Users or roles were edited: refresh the switch-user list and the current user's own permissions. */
    onUsersChanged: function () {
        var me = this;
        GT.util.Session.load().then(function () { me.syncUser(); me.applyPermissions(); });
    },

    syncUser: function () {
        var u = GT.util.Session.getUser();
        this.getViewModel().set({ userName: u.name, userRole: u.role });
        this.tick();
    },

    onUserChange: function (user) {
        this.syncUser();
        this.applyPermissions();
        this.toast('You are now acting as ' + user.name + ' (' + user.role + '). Changes are recorded under ' + user.id + '.', 'info');
    },

    // ---------- admin ----------
    onResetData: function () {
        var me = this;
        me.confirm('Reset demo data', 'This restores the original synthetic data set. Everything you created or changed is lost. Continue?').then(function (yes) {
            if (!yes) { return; }
            return me.busy('Resetting demo data...', function () {
                return me.api().post('/admin/reset').then(function () { return GT.util.Lookups.preload(); });
            }).then(function () {
                var tabs = me.lookup('screens');
                tabs.items.each(function (t) { if (t.closable) { t.allowClose = true; } });
                Ext.Array.each(tabs.items.getRange(), function (t) { if (t.closable) { tabs.remove(t); } });
                var dash = tabs.child('#dashboard');
                if (dash) { dash.fireEvent('screenaction', dash, 'refresh'); }
                me.toast('Demo data reset');
            });
        }).catch(me.ignore);
    },

    onAbout: function () {
        Ext.Msg.show({
            title: 'About GridTrade Contracts', icon: Ext.Msg.INFO, buttons: Ext.Msg.OK, width: 520,
            message: 'A compact energy trading and risk management (ETRM) application built with <b>Ext JS 7.2</b> (classic toolkit) ' +
                'and a small Node.js API. It covers contract capture with versions and approvals, a trade blotter, time-series data, ' +
                'CSV data ingestion with validation, reference data and a full audit trail.<br><br>' +
                'All companies, people and figures are synthetic. Designed and built by Susheel Kumar as a portfolio project.'
        });
    }
});
