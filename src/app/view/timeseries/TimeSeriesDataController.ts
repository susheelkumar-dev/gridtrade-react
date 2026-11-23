/*
 * Ported from app/view/timeseries/TimeSeriesDataController.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Loads one day of interval values, tracks edits, saves them in one bulk API call (audited on the server),
 * and imports values from a CSV picked in the browser (columns: interval,value; optional date).
 */
Ext.define('GT.view.timeseries.TimeSeriesDataController', {
    extend: 'GT.core.BaseController',
    alias: 'controller.timeseriesdata',
    requires: ['GT.model.TimeSeries', 'GT.util.Csv', 'GT.util.Format', 'GT.util.Session'],

    init: function () {
        var me = this;
        me.lookup('chart').setStore(me.lookup('intervalGrid').getStore());
        me.getView().on('afterrender', me.loadSeries, me, { single: true });
        me.lookup('intervalGrid').getStore().on('update', me.countDirty, me);
    },

    seriesId: function () {
        return this.getView().recordId;
    },

    listen: { global: { 'gt-userchange': 'updateEditable' } },

    /** Values are editable only for manual series and for users with data.edit (re-checked when the user changes). */
    updateEditable: function () {
        var grid = this.lookup('intervalGrid');
        if (!grid || !this.series) { return; }
        var col = grid.down('gridcolumn[dataIndex=value]'), plugin = grid.findPlugin('cellediting');
        if (col.gtEditCls === undefined) { col.gtEditCls = col.tdCls || ''; }
        var on = !!this.series.get('manual') && GT.util.Session.can('data.edit');
        if (on) { plugin.enable(); } else { plugin.disable(); }
        col.tdCls = on ? col.gtEditCls : '';
        if (grid.rendered) { grid.getView().refresh(); }
    },

    loadSeries: function () {
        var me = this;
        me.mask('Loading series...');
        GT.model.TimeSeries.load(me.seriesId(), {
            success: function (rec) {
                me.unmask();
                me.series = rec;
                me.getViewModel().set('series', rec);
                me.lookup('metaForm').loadRecord(rec);
                me.getView().setTitle(rec.get('name'));
                me.lookup('intervalGrid').down('gridcolumn[dataIndex=value]').setText('Value (' + rec.get('unit') + ')');
                me.updateEditable();
                me.lookup('recentChanges').setEntity('Time Series Data', rec.getId());
                me.loadData();
            },
            failure: function () { me.unmask(); }
        });
    },

    loadData: function () {
        var me = this;
        var grid = me.lookup('intervalGrid');
        return grid.getStore().loadWith({ seriesId: me.seriesId(), date: grid.getDateString() }).then(function () {
            me.countDirty();
        }).catch(me.ignore);
    },

    countDirty: function () {
        this.getViewModel().set('dirtyCount', this.lookup('intervalGrid').getStore().getModifiedRecords().length);
    },

    onEdited: function () {
        this.countDirty();
    },

    onDateChange: function () {
        this.loadData();
    },

    onBeforeDateChange: function (grid, date) {
        var me = this;
        me.confirm('Discard changes?', 'You have unsaved interval changes for ' + GT.util.Format.date(grid.currentDate) + '. Discard them?').then(function (yes) {
            if (yes) {
                grid.getStore().rejectChanges();
                me.countDirty();
                grid.setDate(date);
            }
        });
        return false;
    },

    onSave: function () {
        var me = this;
        var grid = me.lookup('intervalGrid');
        var values = grid.getChanges();
        if (!values.length) { return; }
        me.busy('Saving ' + values.length + ' value(s)...', function () {
            return me.api().put('/timeseries/' + me.seriesId() + '/data', { date: grid.getDateString(), values: values });
        }).then(function (rows) {
            grid.getStore().loadData(rows);
            me.countDirty();
            me.lookup('recentChanges').reload();
            me.toast(values.length + ' interval value' + (values.length === 1 ? '' : 's') + ' saved');
        }).catch(me.ignore);
    },

    onUndo: function () {
        this.lookup('intervalGrid').getStore().rejectChanges();
        this.countDirty();
    },

    onImport: function (field) {
        var me = this;
        var file = field.fileInputEl && field.fileInputEl.dom.files[0];
        if (!file) { return; }
        var grid = me.lookup('intervalGrid');
        var store = grid.getStore();
        var day = grid.getDateString();
        GT.util.Csv.readFile(file).then(function (text) {
            var parsed = GT.util.Csv.parse(text);
            if (parsed.header.indexOf('interval') < 0 || parsed.header.indexOf('value') < 0) {
                me.toast('The file needs "interval" and "value" columns (and optionally "date")', 'error');
                return;
            }
            var applied = 0, skipped = 0;
            Ext.Array.each(parsed.rows, function (r) {
                var rec = store.findRecord('interval', Number(r.interval), 0, false, true, true);
                var v = Number(r.value);
                if (!rec || r.value === '' || isNaN(v) || (r.date && r.date !== day)) { skipped++; return; }
                rec.set({ value: v, quality: 'Manual' });
                applied++;
            });
            me.countDirty();
            me.toast(applied + ' value(s) imported' + (skipped ? ', ' + skipped + ' row(s) skipped (other date or invalid)' : '') + '. Review, then Save.', skipped ? 'warning' : 'success');
        }).catch(function (e) { me.toast(e.message, 'error'); }).then(function () { field.reset(); });
    },

    onBeforeClose: function (view) {
        var me = this;
        if (view.allowClose || !me.getViewModel().get('dirtyCount')) { return true; }
        me.confirm('Discard changes?', 'There are unsaved interval values. Close anyway?').then(function (yes) {
            if (yes) { view.allowClose = true; view.close(); }
        });
        return false;
    }
});
