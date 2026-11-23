/*
 * Ported from app/util/Csv.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** Client-side CSV: export what a grid shows, and parse files picked in the browser. */
Ext.define('GT.util.Csv', {
    singleton: true,

    escape: function (v) {
        if (v === null || v === undefined) { return ''; }
        var s = String(v);
        return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    },

    stripHtml: function (v) {
        return typeof v === 'string' ? Ext.util.Format.htmlDecode(v.replace(/<[^>]*>/g, '')).trim() : v;
    },

    /** Columns a user would expect in an export: visible leaf columns bound to data (no row numbers, actions, checkboxes). */
    exportColumns: function (grid) {
        var cols = grid.headerCt && grid.headerCt.getVisibleGridColumns ? grid.headerCt.getVisibleGridColumns() : grid.getVisibleColumns();
        return Ext.Array.filter(cols, function (c) {
            return c.dataIndex && !c.excludeFromExport && !c.isXType('actioncolumn') && !c.isCheckerHd && !c.isXType('rownumberer');
        });
    },

    /**
     * { header: [...], rows: [[...]] } of what the grid shows: renderers applied (HTML stripped), dates formatted,
     * plain numbers kept as numbers so spreadsheets can sum them.
     */
    gridData: function (grid) {
        var me = this;
        var cols = me.exportColumns(grid);
        var header = Ext.Array.map(cols, function (c) { return me.stripHtml(c.text); });
        var rows = [];
        grid.getStore().each(function (rec) {
            rows.push(Ext.Array.map(cols, function (c) {
                var v = rec.get(c.dataIndex);
                if (c.exportRenderer) { return me.stripHtml(c.exportRenderer(v, rec)); }
                if (Ext.isDate(v)) { return Ext.Date.format(v, c.format || 'Y-m-d'); }
                if (typeof v === 'boolean' || c.isXType('booleancolumn') || c.isXType('checkcolumn')) { return v ? (c.trueText || 'Yes') : (c.falseText || 'No'); }
                if (typeof v === 'number' && (c.isXType('numbercolumn') || !c.renderer)) { return v; }
                if (c.renderer && typeof c.renderer === 'function' && !c.isXType('widgetcolumn')) {
                    try { v = c.renderer.call(c.scope || c, v, {}, rec); } catch (e) { /* keep raw */ }
                } else if (c.renderer && typeof c.renderer === 'string') {
                    var ctrl = grid.lookupController ? grid.lookupController() : null;
                    if (ctrl && ctrl[c.renderer]) { try { v = ctrl[c.renderer](v, {}, rec); } catch (e) { /* keep raw */ } }
                }
                return me.stripHtml(v);
            }));
        });
        return { header: header, rows: rows };
    },

    fromGrid: function (grid) {
        var me = this;
        var d = me.gridData(grid);
        return [d.header].concat(d.rows).map(function (r) { return Ext.Array.map(r, me.escape).join(','); }).join('\r\n');
    },

    download: function (fileName, text) {
        var blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    },

    /** Returns { header: [...], rows: [{col: value}] }. Handles quoted fields. */
    parse: function (text) {
        var records = [], row = [], field = '', q = false, i, ch;
        text = String(text || '').replace(/^﻿/, '');
        for (i = 0; i < text.length; i++) {
            ch = text.charAt(i);
            if (q) {
                if (ch === '"' && text.charAt(i + 1) === '"') { field += '"'; i++; }
                else if (ch === '"') { q = false; }
                else { field += ch; }
            } else if (ch === '"') { q = true; }
            else if (ch === ',') { row.push(field); field = ''; }
            else if (ch === '\n') { row.push(field); records.push(row); row = []; field = ''; }
            else if (ch !== '\r') { field += ch; }
        }
        if (field !== '' || row.length) { row.push(field); records.push(row); }
        records = Ext.Array.filter(records, function (r) { return r.join('').trim() !== ''; });
        var header = Ext.Array.map(records.shift() || [], function (h) { return h.trim(); });
        return {
            header: header,
            rows: Ext.Array.map(records, function (r) {
                var o = {};
                Ext.Array.each(header, function (h, idx) { o[h] = (r[idx] || '').trim(); });
                return o;
            })
        };
    },

    readFile: function (file) {
        return new Ext.Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () { resolve(reader.result); };
            reader.onerror = function () { reject(new Error('Could not read ' + file.name)); };
            reader.readAsText(file);
        });
    }
});
