/*
 * Ported from app/ux/grid/BaseGrid.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * BaseGrid: the full-featured grid every list in the application is built on. Each feature is a switch, so a
 * screen only declares its store, columns and the features it needs:
 *
 *   store paging, remote/local sort and filter, grouping   -> any store; pageSize (+ pageSizes) adds a paging bar
 *   state (column width/order/visibility, sort, filters)   -> stateful + stateId
 *   locked columns                                          -> locked: true on a column
 *   checkbox multi-select                                   -> checkboxSelection
 *   column filters (string/number/date/list/boolean)        -> enableColumnFilters
 *   cell / row editing, with a Cell/Row switch              -> editing: 'cell' | 'row' | 'both'
 *   model validators applied while editing                  -> automatic when editing
 *   Excel-style range fill (drag to select, type once, fill handle) -> enableRangeFill (with cell editing)
 *   row details (expander)                                  -> rowBodyTpl
 *   export to Excel (.xlsx) and CSV                          -> enableExport
 *   grouping with group subtotals, group-by switch          -> enableGrouping, groupByOptions
 *   grand total row                                         -> enableSummaryRow (+ summaryType on columns)
 *   dirty-cell markers, row styling                         -> markDirty, rowCls(record)
 *   right-click menu                                        -> enableContextMenu + contextMenuItems(record)
 *   row numbers                                             -> showRowNumbers
 *   filter row under the headers (client-side)              -> enableFilterRow (filterRow: false|type on a column)
 *   quick search                                            -> enableSearch, searchFields
 *   inline add / delete selected                            -> addDefaults, enableDeleteSelected
 *   batch save (store.sync) and reject                      -> enableBatchSave
 *   tool icons in the title bar, filter pop-up, "Filtered by" chip, record count, reset layout
 *                                                           -> toolsPosition, filterPanel, showCount, enableResetView
 */
Ext.define('GT.ux.grid.BaseGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'gt-basegrid',
    requires: [
        'Ext.grid.filters.Filters', 'Ext.grid.plugin.CellEditing', 'Ext.grid.plugin.RowEditing', 'Ext.grid.plugin.RowExpander',
        'Ext.grid.feature.GroupingSummary', 'Ext.grid.feature.Summary', 'Ext.selection.CheckboxModel', 'Ext.toolbar.Paging',
        'Ext.toolbar.TextItem', 'Ext.form.field.Text', 'Ext.form.field.ComboBox', 'Ext.menu.Menu', 'Ext.menu.CheckItem',
        'Ext.button.Segmented', 'Ext.window.Window', 'Ext.state.Manager',
        'Ext.grid.column.Date', 'Ext.grid.column.Number', 'Ext.grid.column.Boolean', 'Ext.grid.column.Action', 'Ext.grid.column.RowNumberer',
        'Ext.grid.column.Check', 'Ext.grid.column.Template',
        'GT.ux.grid.plugin.RangeFill', 'GT.util.Csv', 'GT.util.Xlsx', 'GT.util.Toast', 'GT.ux.filter.FilterPanel'
    ],

    // ---------- feature switches ----------
    checkboxSelection: false,
    enableColumnFilters: true,
    /**
     * @cfg {Boolean} enableFilterRow adds a filter field under each column header that filters the loaded rows:
     * text "contains", numbers (100, >100, <=50, 10..20), dates (same day), Yes/No and pick lists.
     * A column can opt out with filterRow: false or force a type with filterRow: 'string'|'number'|'date'|'boolean'|'list'.
     */
    enableFilterRow: false,
    /** @cfg {String} editing null (read-only), 'cell', 'row' or 'both' (both adds a Cell/Row switch). */
    editing: null,
    clicksToEdit: 2,
    /**
     * @cfg {Boolean} enableRangeFill Excel-style editing of editable columns: drag down a column to select cells,
     * type a value in the first one and press Enter to fill them all; drag the fill handle to copy values.
     * Needs editing 'cell' or 'both'. See GT.ux.grid.plugin.RangeFill.
     */
    enableRangeFill: false,
    /** @cfg {String/Ext.XTemplate} rowBodyTpl enables the row expander. */
    rowBodyTpl: null,
    enableExport: true,
    enableGrouping: false,
    groupHeaderTpl: '{name} ({rows.length})',
    enableSummaryRow: false,
    markDirty: true,
    /** @cfg {Function} rowCls function (record) returning a CSS class for the row. */
    rowCls: null,
    enableContextMenu: false,
    /** @cfg {Function} contextMenuItems function (record, grid) returning extra menu items. */
    contextMenuItems: null,
    showRowNumbers: false,
    enableSearch: true,
    /** @cfg {String[]} searchFields fields searched by quick search (default: visible columns). */
    searchFields: null,
    /** @cfg {Object/Function} addDefaults shows an Add button that inserts a record and starts editing it. */
    addDefaults: null,
    enableDeleteSelected: false,
    /** @cfg {Array} groupByOptions [[field, label], ...] shows a Group-by combo with expand/collapse all. */
    groupByOptions: null,
    enableBatchSave: false,
    enableResetView: true,
    pageSize: 0,
    pageSizes: [25, 50, 100, 250],

    // ---------- toolbar / app conventions ----------
    /** @cfg {Array} toolbarActions Buttons placed at the left of the top toolbar. */
    toolbarActions: null,
    enableRefresh: true,
    enableColumnChooser: true,
    /** @cfg {String} toolsPosition 'auto' (title bar when the grid has a title), 'header' or 'toolbar'. */
    toolsPosition: 'auto',
    /** @cfg {Object} filterPanel GT.ux.filter.FilterPanel config shown in a pop-up from the filter icon. */
    filterPanel: null,
    showCount: true,
    exportFileName: null,
    emptyMessage: 'No records found',

    columnLines: true,
    loadMask: true,
    cls: 'gt-basegrid',

    initComponent: function () {
        var me = this;

        // view behaviour
        me.viewConfig = Ext.apply({
            markDirty: me.markDirty,
            enableTextSelection: true,
            stripeRows: true,
            deferEmptyText: false,
            emptyText: '<div class="gt-empty"><i class="fa fa-inbox"></i> ' + me.emptyMessage + '</div>'
        }, me.viewConfig);
        if (me.rowCls && !me.viewConfig.getRowClass) {
            me.viewConfig.getRowClass = me.rowCls;
        }

        // selection
        if (me.checkboxSelection && !me.selModel) {
            me.selModel = { type: 'checkboxmodel', mode: 'MULTI', checkOnly: true };
        }

        // plugins
        var plugins = Ext.Array.from(me.plugins);
        if (me.enableColumnFilters) { plugins.push({ ptype: 'gridfilters', menuFilterText: 'Filter' }); }
        if (me.editing) {
            plugins.push({ ptype: 'cellediting', pluginId: 'cellEditor', clicksToEdit: me.clicksToEdit, disabled: me.editing === 'row' });
            if (me.enableRangeFill) { plugins.push({ ptype: 'gt-rangefill', pluginId: 'rangeFill' }); }
            if (me.editing !== 'cell') {
                plugins.push({ ptype: 'rowediting', pluginId: 'rowEditor', clicksToEdit: me.clicksToEdit, disabled: me.editing !== 'row' });
            }
        }
        if (me.rowBodyTpl) {
            plugins.push({ ptype: 'rowexpander', pluginId: 'expander',
                rowBodyTpl: me.rowBodyTpl.isTemplate ? me.rowBodyTpl : new Ext.XTemplate(me.rowBodyTpl) });
        }
        me.plugins = plugins;
        me.editMode = me.editing === 'row' ? 'row' : 'cell';

        // features
        var features = Ext.Array.from(me.features);
        if (me.enableGrouping) {
            features.push({ ftype: 'groupingsummary', id: 'grouping', groupHeaderTpl: me.groupHeaderTpl, enableGroupingMenu: true, startCollapsed: false });
        }
        if (me.enableSummaryRow) { features.push({ ftype: 'summary', dock: 'bottom' }); }
        me.features = features;

        // row numbers
        if (me.showRowNumbers) {
            var rn = { xtype: 'rownumberer', width: 50, locked: me.enableLocking || undefined };
            if (Ext.isArray(me.columns)) { me.columns = [rn].concat(me.columns); }
            else if (me.columns && me.columns.items) { me.columns = Ext.apply({}, { items: [rn].concat(me.columns.items) }, me.columns); }
        }

        if (me.enableFilterRow) {
            me.columns = me.addFilterRowFields(me.columns);
        }

        me.buildToolbars();
        me.callParent(arguments);

        if (me.pageSize) {
            me.getStore().setPageSize(me.pageSize);
        }
        var groupCombo = me.down('#groupCombo');
        if (groupCombo) {
            groupCombo.suspendEvents();
            groupCombo.setValue(me.getStore().getGroupField() || '');
            groupCombo.resumeEvents();
        }
        me.attachStore(me.getStore());
        me.on('reconfigure', function (grid, store, columns, oldStore) {
            if (store && store !== oldStore) { me.attachStore(store); }
        });
        if (me.editing) {
            me.on({ validateedit: me.onValidateEdit, scope: me });
        }
        if (me.enableContextMenu) {
            me.on('itemcontextmenu', me.onItemContextMenu, me);
        }
        if (me.enableDeleteSelected) {
            me.on('selectionchange', function (sm, sel) { me.down('#deleteSelBtn').setDisabled(!sel.length); });
        }
        if (me.filterPanel) {
            // Apply the remembered (or default) filters once, even if the pop-up is never opened.
            me.on('afterrender', function () { me.getFilterPanel().initFilters(); }, me, { single: true });
        }
    },

    // ======================= toolbars =======================
    buildToolbars: function () {
        var me = this;
        var left = [].concat(me.toolbarActions || []);
        var tools = me.buildTools();
        var inHeader = me.toolsPosition === 'header' || (me.toolsPosition === 'auto' && !!me.title && me.header !== false);

        if (me.addDefaults) {
            left.push({ text: 'Add', iconCls: 'x-fa fa-plus', handler: me.onAddRecord, scope: me });
        }
        if (me.enableDeleteSelected) {
            left.push({ text: 'Delete', iconCls: 'x-fa fa-trash-alt', itemId: 'deleteSelBtn', disabled: true, handler: me.onDeleteSelected, scope: me });
        }
        if (me.groupByOptions) {
            left.push('-', {
                xtype: 'combobox', itemId: 'groupCombo', fieldLabel: 'Group by', labelWidth: 60, width: 210, editable: false,
                store: [['', '(none)']].concat(me.groupByOptions),
                listeners: { change: me.onGroupChange, scope: me }
            }, { iconCls: 'x-fa fa-plus-square', tooltip: 'Expand all groups', handler: me.expandAllGroups, scope: me },
            { iconCls: 'x-fa fa-minus-square', tooltip: 'Collapse all groups', handler: me.collapseAllGroups, scope: me });
        }
        if (me.editing === 'both') {
            left.push('-', { xtype: 'segmentedbutton', allowMultiple: false,
                items: [{ text: 'Cell edit', pressed: me.editMode === 'cell', value: 'cell' }, { text: 'Row edit', pressed: me.editMode === 'row', value: 'row' }],
                listeners: { change: function (seg, value) { me.setEditMode(Ext.isArray(value) ? value[0] : value); } } });
        }
        if (me.enableBatchSave) {
            left.push('-', { text: 'Save', iconCls: 'x-fa fa-save', itemId: 'saveChangesBtn', cls: 'gt-btn-primary', handler: me.saveChanges, scope: me },
                { text: 'Reject', iconCls: 'x-fa fa-undo', handler: me.rejectChanges, scope: me });
        }

        var chip = { xtype: 'tbtext', itemId: 'filterSummary', cls: 'gt-filter-summary', hidden: true };
        var docked = [].concat(me.dockedItems || []);
        if (inHeader) {
            me.header = Ext.apply({ cls: 'gt-grid-header', items: tools }, Ext.isObject(me.header) ? me.header : null);
            if (left.length || me.filterPanel) {
                docked.unshift({ xtype: 'toolbar', dock: 'top', itemId: 'gridTbar', cls: 'gt-grid-tbar', overflowHandler: 'menu', items: left.concat([chip]) });
            }
        } else {
            docked.unshift({ xtype: 'toolbar', dock: 'top', itemId: 'gridTbar', cls: 'gt-grid-tbar', overflowHandler: 'menu',
                items: left.concat([chip, '->'], tools) });
        }

        if (me.pageSize) {
            docked.push({ xtype: 'pagingtoolbar', dock: 'bottom', itemId: 'pager', displayInfo: true, items: ['-', {
                xtype: 'combobox', fieldLabel: 'Page size', labelWidth: 65, width: 150, editable: false, value: me.pageSize, store: me.pageSizes,
                listeners: { change: function (c, size) { var s = me.getStore(); s.setPageSize(size); s.loadPage(1); } }
            }] });
        } else if (me.showCount) {
            docked.push({ xtype: 'toolbar', dock: 'bottom', cls: 'gt-grid-bbar', items: Ext.Array.clean([
                { xtype: 'tbtext', itemId: 'refreshed', cls: 'gt-muted' },
                me.enableRangeFill ? { xtype: 'tbtext', itemId: 'rangeInfo', cls: 'gt-range-info' } : null,
                '->', { xtype: 'tbtext', itemId: 'count' }
            ]) });
        }
        me.dockedItems = docked;
    },

    /** Search, refresh, columns, clear filters, export, filter pop-up and reset view. */
    buildTools: function () {
        var me = this, tools = [];
        var cls = 'gt-tool-btn';
        if (me.enableSearch) {
            tools.push({ xtype: 'textfield', itemId: 'quickSearch', emptyText: 'Search this list', width: 210, cls: 'gt-quicksearch',
                triggers: { clear: { cls: 'x-form-clear-trigger', hidden: true, handler: function (f) { f.setValue(''); } },
                    search: { cls: 'x-form-search-trigger' } },
                listeners: { change: { fn: me.onQuickSearch, scope: me, buffer: 250 } } });
        }
        if (me.enableRefresh) { tools.push({ xtype: 'button', cls: cls, iconCls: 'x-fa fa-sync-alt', tooltip: 'Refresh', itemId: 'refreshBtn', handler: me.onRefresh, scope: me }); }
        if (me.enableColumnChooser) {
            tools.push({ xtype: 'button', cls: cls, iconCls: 'x-fa fa-columns', tooltip: 'Show or hide columns', itemId: 'columnChooser', arrowVisible: false,
                menu: { items: [], listeners: { beforeshow: me.buildColumnMenu, scope: me } } });
        }
        if (me.enableColumnFilters) {
            tools.push({ xtype: 'button', cls: cls, iconCls: 'x-fa fa-eraser', tooltip: 'Clear column filters and search', handler: me.clearAllFilters, scope: me });
        }
        if (me.enableExport) {
            tools.push({ xtype: 'button', cls: cls, iconCls: 'x-fa fa-download', tooltip: 'Export', itemId: 'exportBtn', arrowVisible: false,
                menu: [
                    { text: 'Excel (.xlsx)', iconCls: 'x-fa fa-file-excel', handler: function () { me.exportAs('xlsx'); } },
                    { text: 'CSV', iconCls: 'x-fa fa-file-csv', handler: function () { me.exportAs('csv'); } }
                ] });
        }
        if (me.filterPanel) {
            tools.push({ xtype: 'button', cls: cls, iconCls: 'x-fa fa-filter', tooltip: 'Filtering options', itemId: 'filterBtn', handler: me.openFilterWindow, scope: me });
        }
        if (me.stateful && me.stateId && me.enableResetView) {
            tools.push({ xtype: 'button', cls: cls, iconCls: 'x-fa fa-undo-alt', tooltip: 'Reset layout (columns, sort, filters)', handler: me.resetView, scope: me });
        }
        return tools;
    },

    // ======================= store / footer =======================
    attachStore: function (store) {
        var me = this;
        if (!store || store.isEmptyStore) { return; }
        Ext.destroy(me.storeListeners);
        me.storeListeners = me.mon(store, {
            datachanged: me.updateCount, filterchange: me.updateCount, load: me.onStoreLoad, update: me.onStoreUpdate,
            scope: me, destroyable: true
        });
        me.updateCount();
    },

    onStoreLoad: function (store, records, success) {
        this.refreshFilterRowLists();
        var item = this.down('#refreshed');
        if (item && success) {
            item.setHtml('<i class="fa fa-clock"></i> ' + Ext.Date.format(new Date(), 'd-M-Y H:i:s'));
        }
        this.updateCount();
    },

    onStoreUpdate: function () {
        var btn = this.down('#saveChangesBtn');
        if (btn) {
            var n = this.getStore().getModifiedRecords().length + this.getStore().getRemovedRecords().length;
            btn.setText(n ? 'Save (' + n + ')' : 'Save');
        }
    },

    updateCount: function () {
        var item = this.down('#count');
        var store = this.getStore();
        if (!item || !store || store.isEmptyStore) { return; }
        var shown = store.getCount();
        var all = store.isFiltered() ? store.getData().getSource().getCount() : shown;
        item.setHtml('Displaying ' + Ext.util.Format.number(shown, '0,000') + (all !== shown ? ' of ' + Ext.util.Format.number(all, '0,000') : '') + ' record' + (all === 1 ? '' : 's'));
        this.onStoreUpdate();
    },

    onRefresh: function () {
        var me = this, store = me.getStore();
        if (me.enableBatchSave && (store.getModifiedRecords().length || store.getRemovedRecords().length)) {
            Ext.Msg.confirm('Discard changes?', 'Refreshing discards your unsaved changes. Continue?', function (btn) {
                if (btn === 'yes') { store.rejectChanges(); store.load(); }
            });
            return;
        }
        store.load();
    },

    // ======================= quick search =======================
    onQuickSearch: function (field, value) {
        var me = this;
        var store = me.getStore();
        var fields = me.searchFields || Ext.Array.map(Ext.Array.filter(me.headerCt.getVisibleGridColumns(), function (c) { return !!c.dataIndex; }), function (c) { return c.dataIndex; });
        value = Ext.String.trim(value || '').toLowerCase();
        field.getTrigger('clear').setHidden(!value);
        store.removeFilter('gt-quicksearch', !!value);
        if (value) {
            store.addFilter({
                id: 'gt-quicksearch',
                filterFn: function (rec) {
                    return Ext.Array.some(fields, function (f) {
                        var v = rec.get(f);
                        if (Ext.isDate(v)) { v = Ext.Date.format(v, 'd-M-Y Y-m-d'); }
                        return v !== null && v !== undefined && String(v).toLowerCase().indexOf(value) >= 0;
                    });
                }
            });
        }
    },

    buildColumnMenu: function (menu) {
        var me = this;
        menu.removeAll();
        Ext.Array.each(me.headerCt.getGridColumns(), function (col) {
            if (col.hideable === false || !col.text || col.isXType('rownumberer') || col.isCheckerHd) { return; }
            menu.add({
                xtype: 'menucheckitem', text: GT.util.Csv.stripHtml(col.text), checked: !col.hidden, hideOnClick: false,
                checkHandler: function (item, checked) { col.setHidden(!checked); }
            });
        });
    },

    clearAllFilters: function () {
        var plugin = this.findPlugin('gridfilters');
        var search = this.down('#quickSearch');
        if (plugin) { plugin.clearFilters(); }
        if (search) { search.setValue(''); }
        Ext.Array.each(this.getFilterRowFields(), function (f) { f.reset(); });
    },

    // ======================= filter row =======================
    addFilterRowFields: function (columns) {
        var me = this;
        var defaults = Ext.isArray(columns) ? {} : (columns && columns.defaults) || {};
        var walk = function (cols) {
            return Ext.Array.map(cols || [], function (c) {
                if (!c || typeof c === 'string') { return c; }
                c = Ext.apply({}, c);
                if (c.columns) { c.columns = walk(c.columns); return c; }
                var type = me.filterRowType(c, defaults);
                if (type) {
                    c.items = [me.filterRowField(c, type)];
                    c.layout = { type: 'hbox', align: 'stretch' };   // field fills the column width
                }
                return c;
            });
        };
        if (Ext.isArray(columns)) { return walk(columns); }
        return Ext.apply({}, { items: walk(columns && columns.items) }, columns);
    },

    filterRowType: function (c, defaults) {
        if (c.filterRow === false || !c.dataIndex) { return null; }
        if (typeof c.filterRow === 'string') { return c.filterRow; }
        var x = c.xtype || '';
        if (/^(actioncolumn|rownumberer|widgetcolumn|templatecolumn)$/.test(x)) { return null; }
        if (x === 'datecolumn') { return 'date'; }
        if (x === 'numbercolumn') { return 'number'; }
        if (x === 'booleancolumn' || x === 'checkcolumn') { return 'boolean'; }
        if (x === 'gt-statuscolumn') { return 'list'; }
        var f = c.filter !== undefined ? c.filter : defaults.filter;
        var t = typeof f === 'string' ? f : (f && f.type);
        return t === 'list' || t === 'number' || t === 'date' || t === 'boolean' ? t : 'string';
    },

    filterRowField: function (c, type) {
        var me = this;
        var base = {
            isFilterRowField: true, filterDataIndex: c.dataIndex, filterType: type, hideLabel: true, flex: 1, minWidth: 40,
            cls: 'gt-filterrow-field', margin: '0 4 5 4', msgTarget: 'qtip', validateOnChange: false,
            listeners: {
                change: { fn: me.onFilterRowChange, scope: me, buffer: type === 'string' || type === 'number' ? 350 : 10 },
                // keep clicks and keys inside the field from sorting or dragging the column
                afterrender: function (f) { f.getEl().on({ mousedown: function (e) { e.stopPropagation(); }, click: function (e) { e.stopPropagation(); }, keydown: function (e) { e.stopPropagation(); } }); }
            }
        };
        if (type === 'date') {
            return Ext.apply(base, { xtype: 'datefield', emptyText: 'On date' });
        }
        if (type === 'boolean') {
            return Ext.apply(base, { xtype: 'combobox', editable: false, store: [['', 'All'], ['true', 'Yes'], ['false', 'No']], value: '' });
        }
        if (type === 'list') {
            return Ext.apply(base, { xtype: 'combobox', isListFilter: true, queryMode: 'local', anyMatch: true, forceSelection: false,
                displayField: 'value', valueField: 'value', emptyText: 'All', store: { fields: ['value'], data: [] },
                triggers: { clear: { cls: 'x-form-clear-trigger', weight: -1, hidden: true, handler: function (f) { f.setValue(null); } } } });
        }
        return Ext.apply(base, { xtype: 'textfield', emptyText: type === 'number' ? '>, <, a..b' : 'Contains' });
    },

    getFilterRowFields: function () {
        return this.enableFilterRow ? Ext.ComponentQuery.query('[isFilterRowField]', this) : [];
    },

    /** Fills the pick lists of list-type filter fields with the distinct values present in the loaded rows. */
    refreshFilterRowLists: function () {
        var store = this.getStore();
        if (!store || store.isEmptyStore) { return; }
        var data = store.getData();
        var all = (data.getSource && data.getSource()) || data;
        Ext.Array.each(this.getFilterRowFields(), function (f) {
            if (!f.isListFilter) { return; }
            var seen = {}, values = [];
            all.each(function (r) {
                var v = r.get(f.filterDataIndex);
                if (v !== null && v !== undefined && v !== '' && !seen[v]) { seen[v] = true; values.push({ value: String(v) }); }
            });
            values.sort(function (a, b) { return a.value.localeCompare(b.value); });
            f.getStore().loadData(values);
        });
    },

    onFilterRowChange: function (field, value) {
        var store = this.getStore();
        if (field.isListFilter) { field.getTrigger('clear').setHidden(value === null || value === undefined || value === ''); }
        var id = 'gt-row-' + field.filterDataIndex;
        var fn = this.buildRowFilterFn(field, value);
        if (fn) {
            store.addFilter({ id: id, filterFn: fn });
        } else if (store.getFilters().get(id)) {
            store.removeFilter(id);
        }
    },

    buildRowFilterFn: function (field, value) {
        var key = field.filterDataIndex, type = field.filterType, m;
        field.clearInvalid();
        if (value === null || value === undefined || value === '') { return null; }
        if (type === 'date') {
            if (!Ext.isDate(value)) { return null; }
            var day = Ext.Date.clearTime(value, true).getTime();
            return function (r) { var v = r.get(key); return Ext.isDate(v) && Ext.Date.clearTime(v, true).getTime() === day; };
        }
        if (type === 'boolean') {
            var want = value === 'true' || value === true;
            return function (r) { return !!r.get(key) === want; };
        }
        if (type === 'list') {
            // Picking from the list gives an exact value; typing part of one also works.
            var part = String(value).toLowerCase();
            return function (r) { var v = r.get(key); return v !== null && v !== undefined && String(v).toLowerCase().indexOf(part) >= 0; };
        }
        if (type === 'number') {
            var text = String(value).replace(/,/g, '').trim();
            if ((m = /^(-?\d+(?:\.\d+)?)\s*\.\.\s*(-?\d+(?:\.\d+)?)$/.exec(text))) {
                var lo = Number(m[1]), hi = Number(m[2]);
                return function (r) { var v = r.get(key); return v !== null && v >= lo && v <= hi; };
            }
            if ((m = /^(<=|>=|<>|!=|<|>|=)?\s*(-?\d+(?:\.\d+)?)$/.exec(text))) {
                var op = m[1] || '=', n = Number(m[2]);
                return function (r) {
                    var v = r.get(key);
                    if (v === null || v === undefined || v === '') { return false; }
                    v = Number(v);
                    return op === '>' ? v > n : op === '<' ? v < n : op === '>=' ? v >= n : op === '<=' ? v <= n : (op === '!=' || op === '<>') ? v !== n : v === n;
                };
            }
            field.markInvalid('Use 100, >100, <=50, !=0 or 10..20');
            return null;
        }
        var needle = String(value).toLowerCase();
        return function (r) {
            var v = r.get(key);
            if (v === null || v === undefined) { return false; }
            if (Ext.isDate(v)) { v = Ext.Date.format(v, 'd-M-Y'); }
            return String(v).toLowerCase().indexOf(needle) >= 0;
        };
    },

    // ======================= export =======================
    exportAs: function (type, fileName) {
        var base = (fileName || this.exportFileName || this.title || 'export').replace(/[^\w\- ]+/g, '').trim() || 'export';
        var stamp = '_' + Ext.Date.format(new Date(), 'Ymd_His');
        if (type === 'xlsx') {
            var d = GT.util.Csv.gridData(this);
            GT.util.Xlsx.download(base + stamp + '.xlsx', base, d.header, d.rows);
        } else {
            GT.util.Csv.download(base + stamp + '.csv', GT.util.Csv.fromGrid(this));
        }
    },

    /** Same signature as the Ext JS exporter plugin's saveDocumentAs, so existing calls keep working. */
    saveDocumentAs: function (cfg) {
        cfg = cfg || {};
        var name = (cfg.fileName || '').replace(/\.(xlsx|csv|xls)$/i, '');
        this.exportAs(cfg.type === 'csv' ? 'csv' : 'xlsx', name || cfg.title);
    },

    // ======================= filter pop-up =======================
    getFilterPanel: function () {
        var me = this;
        if (!me.filterWindow) {
            me.filterWindow = Ext.create('Ext.window.Window', {
                title: 'Filtering Options', iconCls: 'x-fa fa-sliders-h', cls: 'gt-filter-window',
                width: 340, height: Math.min(560, Ext.Element.getViewportHeight() - 120), layout: 'fit',
                closeAction: 'hide', constrain: true, resizable: true, ownerCmp: me,
                items: [Ext.apply({ xtype: 'gt-filterpanel', header: false, collapsible: false, border: false, applyOnRender: false, targetGrid: me }, me.filterPanel)]
            });
            me.filterWindow.down('gt-filterpanel').on('apply', function () { me.filterWindow.hide(); });
        }
        return me.filterWindow.down('gt-filterpanel');
    },

    openFilterWindow: function () {
        var me = this;
        me.getFilterPanel();
        var btn = me.down('#filterBtn');
        if (me.filterWindow.isVisible()) { me.filterWindow.hide(); return; }
        if (btn && btn.rendered) {
            me.filterWindow.showBy(btn, 'tr-br', [0, 4]);
        } else {
            me.filterWindow.show();
        }
    },

    /** Shows "Filtered by: ..." in the toolbar (called by GT.ux.filter.FilterPanel). */
    setFilterSummary: function (text) {
        var item = this.down('#filterSummary');
        var btn = this.down('#filterBtn');
        if (btn) { btn[text ? 'addCls' : 'removeCls']('gt-tool-active'); }
        if (!item) { return; }
        item.setHtml(text ? '<i class="fa fa-filter"></i> Filtered by: ' + Ext.String.htmlEncode(text) : '');
        item.setHidden(!text);
    },

    // ======================= add / delete =======================
    onAddRecord: function () {
        var me = this;
        var defaults = Ext.isFunction(me.addDefaults) ? me.addDefaults(me) : Ext.apply({}, me.addDefaults);
        var rec = me.getStore().insert(0, defaults)[0];
        me.getSelectionModel().select(rec);
        me.startEditing(rec);
        me.fireEvent('recordadded', me, rec);
    },

    startEditing: function (rec) {
        var me = this;
        var plugin = me.getPlugin(me.editMode === 'row' ? 'rowEditor' : 'cellEditor');
        if (!plugin) { return; }
        var col = Ext.Array.findBy(me.headerCt.getGridColumns(), function (c) { return !!c.getEditor && !!c.getEditor(rec); });
        plugin.startEdit(rec, col || 0);
    },

    onDeleteSelected: function () {
        var me = this, sel = me.getSelection();
        if (!sel.length) { return; }
        Ext.Msg.confirm('Delete', 'Delete ' + sel.length + ' record(s)?' + (me.enableBatchSave ? ' Click Save to apply.' : ''), function (btn) {
            if (btn === 'yes') {
                me.getStore().remove(sel);
                me.fireEvent('recordsdeleted', me, sel);
            }
        });
    },

    // ======================= grouping =======================
    onGroupChange: function (combo, value) {
        var store = this.getStore();
        if (value) { store.group(value); } else { store.clearGrouping(); }
    },

    getGroupingFeature: function () {
        var view = this.getView();
        var f = view.getFeature ? view.getFeature('grouping') : null;
        if (!f && this.normalGrid) { f = this.normalGrid.getView().getFeature('grouping'); }
        return f;
    },

    expandAllGroups: function () { var f = this.getGroupingFeature(); if (f) { f.expandAll(); } },
    collapseAllGroups: function () { var f = this.getGroupingFeature(); if (f) { f.collapseAll(); } },

    // ======================= editing =======================
    setEditMode: function (mode) {
        this.editMode = mode;
        var cell = this.getPlugin('cellEditor'), row = this.getPlugin('rowEditor');
        if (cell) { cell[mode === 'row' ? 'disable' : 'enable'](); }
        if (row) { row[mode !== 'row' ? 'disable' : 'enable'](); }
    },

    /** Runs the model's validators on the proposed value and blocks invalid edits. */
    onValidateEdit: function (editor, ctx) {
        var rec = ctx.record;
        if (!rec || !rec.getValidation) { return; }
        var fields = ctx.field ? [ctx.field] : Ext.Object.getKeys(ctx.newValues || {});
        var olds = {}, msg = null;
        Ext.Array.each(fields, function (f) { olds[f] = rec.get(f); rec.set(f, ctx.field ? ctx.value : ctx.newValues[f], { silent: true, dirty: false }); });
        Ext.Array.each(fields, function (f) { var r = rec.getValidation(true).get(f); if (r !== true && !msg) { msg = r; } });
        Ext.Array.each(fields, function (f) { rec.set(f, olds[f], { silent: true, dirty: false }); });
        if (msg) {
            GT.util.Toast.warning(msg, 'Validation');
            return false;
        }
    },

    // ======================= batch save =======================
    saveChanges: function () {
        var me = this, store = me.getStore();
        var invalid = Ext.Array.filter(store.getModifiedRecords(), function (r) { return r.isValid && !r.isValid(); });
        if (invalid.length) {
            Ext.Msg.alert('Validation', invalid.length + ' record(s) have errors. Fix them before saving.');
            return;
        }
        if (!store.getModifiedRecords().length && !store.getRemovedRecords().length) {
            GT.util.Toast.info('No changes to save');
            return;
        }
        me.mask('Saving...');
        store.sync({
            callback: function (batch) {
                me.unmask();
                if (!batch.hasException || !batch.hasException()) { GT.util.Toast.success('Changes saved'); }
                me.onStoreUpdate();
            }
        });
    },

    rejectChanges: function () {
        this.getStore().rejectChanges();
        this.onStoreUpdate();
    },

    // ======================= state =======================
    resetView: function () {
        var me = this;
        if (me.stateId) { Ext.state.Manager.clear(me.stateId); }
        me.clearAllFilters();
        if (me.initialConfig.columns) {
            me.reconfigure(null, Ext.clone(me.initialConfig.columns));
        }
        GT.util.Toast.info('Layout reset');
    },

    // ======================= context menu =======================
    onItemContextMenu: function (view, rec, item, idx, e) {
        var me = this;
        e.stopEvent();
        var first = Ext.Array.findBy(me.headerCt.getGridColumns(), function (c) { return !!c.dataIndex && !c.hidden; });
        var items = [];
        if (first) {
            items.push({ text: 'Copy ' + GT.util.Csv.stripHtml(first.text), iconCls: 'x-fa fa-clipboard', handler: function () {
                if (navigator.clipboard) { navigator.clipboard.writeText(String(rec.get(first.dataIndex))); GT.util.Toast.info('Copied'); }
            } });
        }
        if (me.getPlugin('expander')) {
            items.push({ text: 'Show details', iconCls: 'x-fa fa-info-circle', handler: function () {
                var exp = me.getPlugin('expander');
                exp.toggleRow(me.getStore().indexOf(rec), rec);
            } });
        }
        var extra = me.contextMenuItems ? me.contextMenuItems(rec, me) : [];
        if (extra && extra.length) { items.push('-'); items = items.concat(extra); }
        Ext.destroy(me.contextMenu);
        me.contextMenu = Ext.create('Ext.menu.Menu', { items: items, ownerCmp: me });
        me.contextMenu.showAt(e.getXY());
    },

    // ======================= helpers =======================
    getSelectedRecord: function () {
        return this.getSelectionModel().getSelection()[0] || null;
    },

    doDestroy: function () {
        Ext.destroy(this.filterWindow, this.contextMenu, this.storeListeners);
        this.callParent();
    }
});
