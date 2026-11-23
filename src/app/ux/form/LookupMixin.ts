/*
 * Ported from app/ux/form/LookupMixin.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Shared behaviour for lookup fields: a filtered view of a cached lookup list (GT.util.Lookups) and an
 * optional "edit" trigger that opens the maintenance screen for that list.
 */
Ext.define('GT.ux.form.LookupMixin', {
    extend: 'Ext.Mixin',
    requires: ['GT.util.Lookups', 'GT.util.Screens', 'GT.util.Toast', 'GT.util.Session'],

    mixinConfig: { id: 'gtlookup' },

    /** @cfg {String} lookupType GT.util.Lookups type, e.g. 'counterparties'. */
    /** @cfg {Boolean} enabledOnly Hide disabled entries (they still display if already selected). */
    /** @cfg {String} editScreen GT.util.Screens key opened by the edit trigger. */

    initLookup: function () {
        var me = this;
        if (me.lookupType && !me.store) {
            me.store = GT.util.Lookups.chained(me.lookupType, me.enabledOnly ? [{ property: 'enabled', value: true }] : []);
        }
    },

    /**
     * Opens the entry pop-up for this list: the selected entry in edit mode, or a new entry when nothing (or
     * several, in a tag field) is selected. When the pop-up closes the lookup is refreshed and a newly created
     * entry is selected in this field.
     */
    openEditScreen: function () {
        var me = this;
        var value = me.getValue();
        if (Ext.isArray(value)) { value = value.length === 1 ? value[0] : null; }
        var item = value !== null && value !== undefined && value !== '' ? GT.util.Lookups.getStore(me.lookupType).getById(value) : null;
        var entityId = item ? (item.get('recordId') || item.getId()) : null;
        GT.util.Screens.openEntry(me.editScreen, entityId).then(function (win) {
            if (!win) { return; }
            var created = null;
            win.on('saved', function (w, rec) { if (!entityId) { created = rec; } });
            win.on('destroy', function () {
                GT.util.Lookups.reload(me.lookupType).then(function () {
                    if (!created || me.destroyed) { return; }
                    var newValue = me.lookupType === 'commodities' ? created.get('name') : created.getId();
                    if (me.isXType('tagfield')) {
                        me.setValue(Ext.Array.unique(Ext.Array.from(me.getValue()).concat([newValue])));
                    } else {
                        me.setValue(newValue);
                    }
                });
            });
        }).catch(function (e) { GT.util.Toast.error(e.message); });
    },

    /**
     * Adds the edit trigger to the constructor config. Triggers must be configured at construction time
     * (they are merged with the field's own picker trigger), so the fields call this from their constructor.
     */
    withEditTrigger: function (config) {
        config = Ext.apply({}, config);
        var screen = GT.util.Screens.get(config.editScreen || this.editScreen);
        var entryPermission = screen && screen.entry && screen.entry.permission;
        if ((config.editScreen || this.editScreen) && GT.util.Session.can(entryPermission)) {
            config.triggers = Ext.apply({}, config.triggers, {
                edit: {
                    cls: 'x-fa fa-edit gt-edit-trigger', weight: 10, tooltip: 'Edit the selected entry, or add a new one',
                    handler: function (field) { field.openEditScreen(); }
                }
            });
        }
        return config;
    }
});
