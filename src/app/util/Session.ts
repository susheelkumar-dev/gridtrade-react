/*
 * Ported from app/util/Session.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Who is using the app and what they may do. The demo has no login: the user is picked from the user menu and
 * sent to the API in the X-GT-User header. Their roles (User Management) give a set of permissions such as
 * "contracts.approve"; the API enforces them and the UI hides what the user cannot use.
 */
Ext.define('GT.util.Session', {
    singleton: true,
    requires: ['Ext.Ajax', 'Ext.Promise'],

    user: 'demo.trader',
    /** Full user record from the API (fullName, roleNames, ...). */
    profile: null,
    permissions: null,
    /** Enabled users for the switch-user menu. */
    users: null,

    constructor: function () {
        var saved = this.self.readStorage('gt.user');
        if (saved) { this.user = saved; }
        this.permissions = [];
        this.users = [];
    },

    statics: {
        readStorage: function (key) {
            try { return window.localStorage.getItem(key); } catch (e) { return null; }
        },
        writeStorage: function (key, value) {
            try { window.localStorage.setItem(key, value); } catch (e) { /* private mode */ }
        }
    },

    get: function (url) {
        var me = this;
        return new Ext.Promise(function (resolve, reject) {
            Ext.Ajax.request({
                url: url, method: 'GET', headers: { 'X-GT-User': me.user },
                success: function (r) { var b = r.responseJson || Ext.decode(r.responseText || 'null', true); resolve(b && b.data); },
                failure: function (r) { reject(new Error('Request failed (' + r.status + ')')); }
            });
        });
    },

    /** Loads the user list and the current user's permissions. Falls back to demo.trader if the saved user is gone. */
    load: function () {
        var me = this;
        return me.get('api/users').then(function (users) {
            me.users = Ext.Array.filter(users || [], function (u) { return u.enabled; });
            if (!me.findUser(me.user)) { me.user = me.users.length ? me.users[0].username : 'demo.trader'; }
            return me.get('api/me');
        }).then(function (me2) {
            me.profile = me2.user;
            me.permissions = me2.permissions || [];
            return me;
        });
    },

    findUser: function (username) {
        return Ext.Array.findBy(this.users, function (u) { return u.username === username; });
    },

    getUser: function () {
        var p = this.profile || {};
        return { id: this.user, name: p.fullName || this.user, role: p.roleNames || 'No role' };
    },

    /** @param {String} permission e.g. 'contracts.approve' */
    can: function (permission) {
        return !permission || Ext.Array.contains(this.permissions, permission);
    },

    setUser: function (username) {
        var me = this;
        if (username === me.user) { return Ext.Promise.resolve(me); }
        me.user = username;
        me.self.writeStorage('gt.user', username);
        return me.load().then(function () {
            Ext.GlobalEvents.fireEvent('gt-userchange', me.getUser());
            return me;
        });
    }
});
