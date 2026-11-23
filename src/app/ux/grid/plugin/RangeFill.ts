/*
 * Ported from app/ux/grid/plugin/RangeFill.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Excel-style range fill for editable grid columns (BaseGrid switch: enableRangeFill).
 *
 *   Select:  press on a cell and drag up or down the same column (or click a cell, then Shift+click another).
 *            The selected cells are outlined and the footer shows the count, sum and average.
 *   Fill:    the editor opens on the cell where the selection started; type a value and press Enter (or Tab
 *            or click away). Every selected cell gets that value.
 *   Handle:  the small square at the bottom-right of the selection (or of the last edited cell) can be
 *            dragged down or up to copy the value(s) into more rows, repeating a multi-cell pattern.
 *   Clear:   Esc, a plain click elsewhere, or reloading the grid.
 *
 * Only columns with an editor take part (a column can opt out with rangeFill: false), only while the grid's
 * cell editor is enabled, so read-only users never get it. After a fill the grid fires
 * 'rangefill' (grid, records, dataIndex, values); every changed record is set through the normal record API, so
 * dirty markers, totals, Undo (store.rejectChanges) and Save work as they do for single edits.
 * Works on grids without locked columns.
 */
Ext.define('GT.ux.grid.plugin.RangeFill', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.gt-rangefill',

    /** @cfg {Number} handleSize width/height in px of the fill handle hit area at the bottom-right corner. */
    handleSize: 9,
    /** @cfg {Number} scrollZone px from the top/bottom edge of the rows where dragging scrolls the grid. */
    scrollZone: 28,

    init: function (grid) {
        var me = this;
        me.grid = grid;
        me.range = null;     // { column, records: [], anchor: record }
        me.handleCell = null; // { record, column } that shows the fill handle when no range is selected
        grid.on({
            viewready: me.onViewReady,
            beforeedit: me.onBeforeEdit,
            edit: me.onEdit,
            canceledit: me.onCancelEdit,
            scope: me
        });
    },

    onViewReady: function () {
        var me = this, view = me.grid.getView();
        me.view = view;
        view.on({
            cellmousedown: me.onCellMouseDown,
            refresh: me.paint,
            itemupdate: me.paint,
            itemadd: me.paint,
            scope: me
        });
        view.getEl().on('keydown', me.onKeyDown, me);
        me.grid.getStore().on({ load: me.clear, scope: me });
    },

    // ---------- helpers ----------
    cellEditor: function () {
        return this.grid.getPlugin('cellEditor') || this.grid.findPlugin('cellediting');
    },

    canFill: function (column) {
        var editor = this.cellEditor();
        return !!(column && column.dataIndex && column.getEditor && column.getEditor() && column.rangeFill !== false &&
            editor && !editor.disabled);
    },

    store: function () { return this.grid.getStore(); },

    /** Records between a and b (inclusive) in display order. */
    between: function (a, b) {
        var s = this.store(), i = s.indexOf(a), j = s.indexOf(b);
        if (i < 0 || j < 0) { return []; }
        return s.getRange(Math.min(i, j), Math.max(i, j));
    },

    recordAt: function (e) {
        var node = e.getTarget(this.view.itemSelector);
        return node ? this.view.getRecord(node) : null;
    },

    // ---------- mouse ----------
    onCellMouseDown: function (view, td, cellIndex, record, tr, rowIndex, e) {
        var me = this;
        if (e.button !== 0) { return; }
        var column = view.getHeaderByCell(td);
        if (!me.canFill(column)) {
            if (me.range || me.handleCell) { me.clear(); }
            return;
        }
        if (me.isOnHandle(td, record, column, e)) {
            e.stopEvent();
            me.startDrag('fill', column, record, e);
            return;
        }
        if (e.shiftKey && me.anchorFor(column)) {
            // Shift+click: extend from the current anchor to this cell; the anchor is edited once the click ends.
            e.stopEvent();
            var anchor = me.anchorFor(column), editor = me.cellEditor();
            if (editor.editing) { editor.completeEdit(); } // finish a pending edit as a normal single-cell edit
            me.select(column, anchor, record);
            me.pendingShift = record;
            return;
        }
        me.clear();
        me.handleCell = { record: record, column: column };
        me.startDrag('select', column, record, e);
    },

    anchorFor: function (column) {
        if (this.range && this.range.column === column) { return this.range.anchor; }
        if (this.handleCell && this.handleCell.column === column) { return this.handleCell.record; }
        return null;
    },

    isOnHandle: function (td, record, column, e) {
        var me = this, target = me.handleTarget();
        if (!target || target.record !== record || target.column !== column) { return false; }
        var box = Ext.fly(td).getBox(), xy = e.getXY(), s = me.handleSize;
        return xy[0] >= box.right - s - 2 && xy[1] >= box.bottom - s - 2;
    },

    /** The cell that shows the fill handle: bottom of the selection, else the last edited / clicked cell. */
    handleTarget: function () {
        var r = this.range;
        if (r) {
            var recs = r.records;
            return { record: recs[recs.length - 1], column: r.column };
        }
        return this.handleCell;
    },

    startDrag: function (mode, column, record, e) {
        var me = this, doc = Ext.getDoc();
        me.drag = {
            mode: mode, column: column, start: record, last: record, moved: false,
            source: mode === 'fill' ? (me.range ? me.range.records.slice() : [record]) : null,
            y: e.getY()
        };
        me.view.getEl().addCls('gt-fill-dragging');
        me.dragListeners = doc.on({ mousemove: me.onDragMove, mouseup: me.onDragEnd, scope: me, destroyable: true });
        me.scrollTask = me.scrollTask || Ext.util.TaskManager.newTask({ run: me.autoScroll, scope: me, interval: 60 });
        me.scrollTask.start();
    },

    onDragMove: function (e) {
        var me = this, d = me.drag;
        if (!d) { return; }
        e.preventDefault(); // no text selection while dragging
        d.y = e.getY();
        var rec = me.recordAt(e);
        if (!rec || rec === d.last) { return; }
        d.last = rec;
        d.moved = true;
        if (d.mode === 'select') {
            var editor = me.cellEditor();
            if (editor && editor.editing) { editor.completeEdit(); }
            me.select(d.column, d.start, rec);
        } else {
            me.paintFillPreview(d);
        }
    },

    autoScroll: function () {
        var me = this, d = me.drag;
        if (!d || !me.view) { return; }
        var box = me.view.getEl().getBox(), dy = 0, zone = me.scrollZone;
        if (d.y > box.bottom - zone) { dy = 20; } else if (d.y < box.top + zone) { dy = -20; }
        if (!dy) { return; }
        me.view.getScrollable().scrollBy(0, dy, false);
        // Extend to the row now under the pointer edge.
        var s = me.store(), first = me.view.getRecord(me.view.getNode(0));
        var y = Math.min(Math.max(d.y, box.top + 2), box.bottom - 2);
        var el = document.elementFromPoint(box.left + Math.min(box.width - 4, 40), y);
        var node = el && Ext.fly(el).up(me.view.itemSelector);
        var rec = node ? me.view.getRecord(node) : first;
        if (rec && rec !== d.last && s.indexOf(rec) >= 0) {
            d.last = rec;
            d.moved = true;
            if (d.mode === 'select') { me.select(d.column, d.start, rec); } else { me.paintFillPreview(d); }
        }
    },

    onDragEnd: function () {
        var me = this, d = me.drag;
        me.stopDrag();
        if (!d) { return; }
        if (d.mode === 'select') {
            if (d.moved && me.range && me.range.records.length > 1) {
                me.editAnchor();
            } else {
                me.paint();
            }
        } else if (d.moved) {
            me.fillFromHandle(d);
        } else {
            me.paint();
        }
    },

    stopDrag: function () {
        var me = this;
        me.drag = null;
        Ext.destroy(me.dragListeners);
        me.dragListeners = null;
        if (me.scrollTask) { me.scrollTask.stop(); }
        if (me.view && me.view.getEl()) { me.view.getEl().removeCls('gt-fill-dragging'); }
    },

    // ---------- selection ----------
    select: function (column, anchor, other) {
        var me = this;
        me.range = { column: column, anchor: anchor, records: me.between(anchor, other) };
        me.handleCell = { record: anchor, column: column };
        me.paint();
        me.updateInfo();
    },

    clear: function () {
        var me = this;
        if (!me.range && !me.handleCell) { return; }
        me.range = null;
        me.handleCell = null;
        me.paint();
        me.updateInfo();
    },

    editAnchor: function () {
        var me = this, r = me.range, editor = me.cellEditor();
        if (!r || !editor) { return; }
        me.startingAnchorEdit = true;
        editor.startEdit(r.anchor, r.column);
        me.startingAnchorEdit = false;
    },

    onBeforeEdit: function (editor, ctx) {
        var me = this;
        if (me.pendingShift) {
            // The click that ends a Shift+click must not edit the clicked cell: edit the anchor instead.
            me.pendingShift = null;
            Ext.defer(me.editAnchor, 1, me);
            return false;
        }
        if (me.drag) { return false; }
        if (me.range && !me.startingAnchorEdit && (ctx.record !== me.range.anchor || ctx.column !== me.range.column)) {
            me.clear();
        }
    },

    onEdit: function (editor, ctx) {
        var me = this, r = me.range;
        if (r && ctx.record === r.anchor && ctx.column === r.column && r.records.length > 1) {
            var targets = Ext.Array.filter(r.records, function (rec) { return rec !== r.anchor; });
            me.applyValues(targets, r.column, [ctx.value], [ctx.record].concat(targets));
            me.range = null;
            me.handleCell = { record: targets.length ? r.records[r.records.length - 1] : ctx.record, column: r.column };
            GT.util.Toast.info('Filled ' + r.records.length + ' cells with ' + me.formatValue(r.column, ctx.value));
        } else if (me.canFill(ctx.column)) {
            me.handleCell = { record: ctx.record, column: ctx.column };
        }
        me.paint();
        me.updateInfo();
    },

    onCancelEdit: function () {
        this.paint();
    },

    onKeyDown: function (e) {
        if (e.getKey() === e.ESC && (this.range || this.handleCell) && !(this.cellEditor() && this.cellEditor().editing)) {
            this.clear();
        }
    },

    // ---------- fill handle ----------
    fillTargets: function (d) {
        var me = this, s = me.store(), src = d.source;
        var top = s.indexOf(src[0]), bottom = s.indexOf(src[src.length - 1]), to = s.indexOf(d.last);
        if (to > bottom) { return { dir: 1, records: s.getRange(bottom + 1, to) }; }
        if (to < top) { return { dir: -1, records: s.getRange(to, top - 1).reverse() }; }
        return { dir: 0, records: [] };
    },

    paintFillPreview: function (d) {
        this.paint();
        var me = this, t = me.fillTargets(d);
        Ext.Array.each(t.records, function (rec) { me.cellEl(rec, d.column, function (el) { el.addCls('gt-fill-preview'); }); });
    },

    fillFromHandle: function (d) {
        var me = this, t = me.fillTargets(d), column = d.column;
        if (!t.records.length) { me.paint(); return; }
        var src = t.dir > 0 ? d.source : d.source.slice().reverse();
        var values = Ext.Array.map(src, function (rec) { return rec.get(column.dataIndex); });
        me.applyValues(t.records, column, values);
        var all = t.dir > 0 ? d.source.concat(t.records) : t.records.slice().reverse().concat(d.source);
        me.range = { column: column, anchor: all[0], records: all };
        me.handleCell = { record: all[0], column: column };
        me.paint();
        me.updateInfo();
        GT.util.Toast.info('Copied into ' + t.records.length + ' more cell' + (t.records.length === 1 ? '' : 's'));
    },

    /** Sets values (repeating the list) on the records, then fires 'rangefill'. */
    applyValues: function (records, column, values, reported) {
        var me = this, grid = me.grid, field = column.dataIndex, changed = [];
        grid.getStore().suspendEvents(); // one refresh and one summary update instead of one per cell
        Ext.Array.each(records, function (rec, i) {
            var v = values[i % values.length];
            if (rec.get(field) !== v) { rec.set(field, v); changed.push(rec); }
        });
        grid.getStore().resumeEvents();
        grid.getView().refresh();
        grid.getStore().fireEvent('update', grid.getStore(), changed[0] || records[0], Ext.data.Model.EDIT, [field]);
        grid.fireEvent('rangefill', grid, reported || records, field, values);
    },

    // ---------- painting ----------
    cellEl: function (rec, column, fn) {
        var el = this.view && this.view.getCell(rec, column);
        if (el) { fn(Ext.get(el.dom || el)); }
    },

    paint: function () {
        var me = this, view = me.view;
        if (!view || !view.rendered || !view.getEl()) { return; }
        view.getEl().select('.gt-fill-sel, .gt-fill-top, .gt-fill-bottom, .gt-fill-handle, .gt-fill-preview, .gt-fill-anchor')
            .removeCls(['gt-fill-sel', 'gt-fill-top', 'gt-fill-bottom', 'gt-fill-handle', 'gt-fill-preview', 'gt-fill-anchor']);
        var r = me.range;
        if (r && me.store().indexOf(r.anchor) < 0) { me.range = r = null; }
        if (r) {
            Ext.Array.each(r.records, function (rec, i) {
                me.cellEl(rec, r.column, function (el) {
                    el.addCls('gt-fill-sel');
                    if (i === 0) { el.addCls('gt-fill-top'); }
                    if (i === r.records.length - 1) { el.addCls('gt-fill-bottom'); }
                    if (rec === r.anchor) { el.addCls('gt-fill-anchor'); }
                });
            });
        }
        var h = me.handleTarget();
        if (h && me.store().indexOf(h.record) >= 0 && me.canFill(h.column)) {
            me.cellEl(h.record, h.column, function (el) { el.addCls('gt-fill-handle'); });
        }
    },

    /** Footer text like Excel's status bar: count, sum and average of the selected numbers. */
    updateInfo: function () {
        var me = this, item = me.grid.down('#rangeInfo'), r = me.range;
        if (!item) { return; }
        if (!r || r.records.length < 2) { item.setHtml(''); return; }
        var nums = Ext.Array.filter(Ext.Array.map(r.records, function (rec) { return rec.get(r.column.dataIndex); }), Ext.isNumber);
        var text = '<i class="fa fa-th-list"></i> ' + r.records.length + ' cells selected';
        if (nums.length) {
            var sum = Ext.Array.sum(nums);
            text += ' · Sum ' + me.formatValue(r.column, sum) + ' · Avg ' + me.formatValue(r.column, sum / nums.length);
        }
        item.setHtml(text + ' <span class="gt-muted">— type a value and press Enter to fill them all</span>');
    },

    formatValue: function (column, v) {
        if (!Ext.isNumber(v)) { return Ext.String.htmlEncode(String(v === null || v === undefined ? '(blank)' : v)); }
        var editor = column.getEditor && column.getEditor(), dp = editor && editor.decimalPrecision;
        return Ext.util.Format.number(v, '0,000.' + new Array((dp === undefined ? 2 : dp) + 1).join('0'));
    },

    destroy: function () {
        this.stopDrag();
        Ext.destroy(this.scrollTask);
        this.callParent();
    }
});
