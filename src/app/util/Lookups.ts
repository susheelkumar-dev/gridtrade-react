/*
 * Ported from app/util/Lookups.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Shared, cached reference lists (counterparties, nodes, contract types ...). One store per lookup type is
 * loaded once at start-up; fields use ChainedStores on top so each can filter without affecting others.
 */
Ext.define('GT.util.Lookups', {
    singleton: true,
    requires: ['GT.model.Lookup', 'Ext.data.Store', 'Ext.data.ChainedStore', 'Ext.Promise'],

    preloadTypes: ['counterparties', 'legalEntities', 'commodities', 'nodes', 'timeseries', 'contracts', 'contractTypes',
        'products', 'granularities', 'timeZones', 'componentTypes', 'marketProducts', 'users', 'holidayCalendars',
        'transactionTypes', 'contractStatuses', 'tradeStatuses', 'counterpartyTypes', 'regions', 'entityTypes', 'roles', 'departments'],

    stores: null,

    constructor: function () {
        this.stores = {};
    },

    getStore: function (type) {
        var store = this.stores[type];
        if (!store) {
            store = this.stores[type] = Ext.create('Ext.data.Store', {
                storeId: 'lookup.' + type,
                model: 'GT.model.Lookup',
                proxy: { type: 'ajax', url: 'api/lookups/' + type, reader: { type: 'json', rootProperty: 'data' } },
                sorters: type === 'timeZones' || type === 'granularities' || type === 'contractStatuses' || type === 'tradeStatuses' ? [] : ['name']
            });
        }
        return store;
    },

    /** A per-field view of a shared lookup; pass filters such as enabled-only. */
    chained: function (type, filters) {
        var source = this.getStore(type);
        if (!source.isLoaded() && !source.isLoading()) { this.load(type).catch(Ext.emptyFn); } // lists not preloaded load on first use
        return Ext.create('Ext.data.ChainedStore', { source: this.getStore(type), filters: filters || [] });
    },

    load: function (type) {
        var store = this.getStore(type);
        return new Ext.Promise(function (resolve, reject) {
            store.load({
                callback: function (records, operation, success) {
                    if (success) { resolve(store); } else { reject(new Error('Could not load lookup ' + type)); }
                }
            });
        });
    },

    preload: function () {
        var me = this;
        return Ext.Promise.all(Ext.Array.map(me.preloadTypes, function (t) { return me.load(t); }));
    },

    reload: function (type) {
        if (this.stores[type]) {
            return this.load(type);
        }
        return Ext.Promise.resolve();
    },

    name: function (type, id) {
        var rec = id === null || id === undefined ? null : this.getStore(type).getById(id);
        return rec ? rec.get('name') : '';
    }
});
