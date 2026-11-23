/*
 * Ported from app/ux/filter/FilterPanel.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * "Filtering Options" side panel for a summary grid. On Apply it turns its fields into API parameters,
 * reloads the target grid's store with them and shows a "Filtered by" summary on the grid.
 * The last used values are remembered per browser (stateKey).
 *
 *   { xtype: 'gt-filterpanel', region: 'east', targetGrid: 'contractGrid', stateKey: 'contracts', items: [...] }
 */
Ext.define('GT.ux.filter.FilterPanel', {
    extend: 'Ext.form.Panel',
    xtype: 'gt-filterpanel',
    requires: ['Ext.util.KeyMap'],

    title: 'Filtering Options',
    iconCls: 'x-fa fa-sliders-h',
    cls: 'gt-filterpanel',
    width: 290,
    bodyPadding: '12 14',
    scrollable: 'y',
    collapsible: true,
    animCollapse: false,
    fieldDefaults: { labelAlign: 'top', anchor: '100%', labelSeparator: '' },

    /** @cfg {String/Ext.grid.Panel} targetGrid the grid to filter: an instance, or a reference in the same view. */
    targetGrid: null,
    /** @cfg {String} stateKey remembers the last applied values in localStorage. */
    stateKey: null,
    /** @cfg {Boolean} applyOnRender load the grid with the initial values once rendered. */
    applyOnRender: true,

    initComponent: function () {
        var me = this;
        me.buttons = [
            { text: 'Reset', iconCls: 'x-fa fa-undo', handler: me.onReset, scope: me },
            { text: 'Apply', iconCls: 'x-fa fa-search', itemId: 'applyBtn', handler: me.applyFilter, scope: me }
        ];
        me.callParent(arguments);
        me.on('afterrender', function () {
            me.keyMap = new Ext.util.KeyMap({ target: me.getEl(), key: Ext.event.Event.ENTER, fn: me.applyFilter, scope: me });
            if (me.applyOnRender) {
                Ext.defer(me.initFilters, 1, me);
            }
        }, me, { single: true });
    },

    doDestroy: function () {
        Ext.destroy(this.keyMap);
        this.callParent();
    },

    getGrid: function () {
        if (this.targetGrid && this.targetGrid.isComponent) { return this.targetGrid; }
        var holder = this.lookupReferenceHolder();
        return holder && this.targetGrid ? holder.lookupReference(this.targetGrid) : null;
    },

    /** Restores the remembered values and loads the grid; used when the panel lives in a pop-up not yet shown. */
    initFilters: function () {
        if (this.initialized) { return; }
        this.initialized = true;
        this.restoreState();
        this.applyFilter();
    },

    /** Sets one field by name and applies (e.g. a dashboard shortcut). */
    applyValues: function (values, reset) {
        if (reset) { this.getForm().reset(); }
        this.getForm().setValues(values);
        this.initialized = true;
        this.applyFilter();
    },

    /** Non-empty field values as API parameters (dates as YYYY-MM-DD). */
    getParams: function () {
        var params = {};
        this.getForm().getFields().each(function (f) {
            var name = f.getName(), v = f.getValue();
            if (!name || v === null || v === undefined || v === '' || v === 'ALL' || (Ext.isArray(v) && !v.length)) { return; }
            params[name] = Ext.isDate(v) ? Ext.Date.format(v, 'Y-m-d') : (Ext.isArray(v) ? v.join(',') : v);
        });
        return params;
    },

    getSummary: function () {
        var parts = [];
        this.getForm().getFields().each(function (f) {
            var v = f.getValue();
            if (!f.getName() || v === null || v === undefined || v === '' || v === 'ALL' || (Ext.isArray(v) && !v.length)) { return; }
            var label = f.fieldLabel || (f.ownerCt && f.ownerCt.fieldLabel ? f.ownerCt.fieldLabel + (f.itemId === 'end' ? ' to' : ' from') : f.getName());
            var shown = Ext.isDate(v) ? Ext.Date.format(v, 'd-M-Y') : (f.getRawValue ? f.getRawValue() : v);
            if (f.isXType('checkbox')) { shown = v ? 'Yes' : 'No'; }
            parts.push(label + ': ' + shown);
        });
        return parts.join(' · ');
    },

    applyFilter: function () {
        var me = this;
        if (!me.getForm().isValid()) { return; }
        var params = me.getParams();
        if (me.fireEvent('beforeapply', me, params) === false) { return; }
        var grid = me.getGrid();
        if (grid) {
            var store = grid.getStore();
            if (store.loadWith) { store.loadWith(params); } else { store.getProxy().setExtraParams(params); store.load(); }
            if (grid.setFilterSummary) { grid.setFilterSummary(me.getSummary()); }
        }
        me.saveState();
        me.fireEvent('apply', me, params);
    },

    onReset: function () {
        this.getForm().reset();
        this.applyFilter();
    },

    saveState: function () {
        if (!this.stateKey) { return; }
        try { window.localStorage.setItem('gt.filter.' + this.stateKey, Ext.encode(this.getParams())); } catch (e) { /* ignore */ }
    },

    restoreState: function () {
        if (!this.stateKey) { return; }
        var saved = null;
        try { saved = Ext.decode(window.localStorage.getItem('gt.filter.' + this.stateKey) || 'null', true); } catch (e) { saved = null; }
        if (saved) {
            this.getForm().setValues(saved);
        }
    }
});
