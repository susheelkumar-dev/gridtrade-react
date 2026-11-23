/*
 * Ported from app/view/contract/ContractEntryController.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/**
 * Contract entry workflow: load or create, save (each save of a changed contract becomes a new version),
 * server-side validation, four-eyes approval, delete, and component maintenance through pop-up windows.
 * Plain CRUD goes through the model's REST proxy; workflow actions call the API directly.
 */
Ext.define('GT.view.contract.ContractEntryController', {
    extend: 'GT.core.BaseController',
    alias: 'controller.contractentry',
    requires: ['GT.model.Contract', 'GT.model.Component', 'GT.util.Lookups', 'GT.util.Screens', 'GT.util.Session'],

    init: function () {
        var view = this.getView();
        if (view.recordId) {
            view.on('afterrender', function () { this.load(view.recordId); }, this, { single: true });
        } else {
            this.setRecord(Ext.create('GT.model.Contract', {
                effectiveDate: Ext.Date.clearTime(new Date()),
                startDate: Ext.Date.getFirstDateOfMonth(Ext.Date.add(new Date(), Ext.Date.MONTH, 1)),
                endDate: Ext.Date.getLastDateOfMonth(Ext.Date.add(new Date(), Ext.Date.MONTH, 12)),
                commodities: ['Energy']
            }));
        }
    },

    listen: { global: { 'gt-userchange': 'applyReadOnly' } },

    /** Header fields are read only for users without contracts.edit (re-checked when the acting user changes). */
    applyReadOnly: function () {
        var ro = !GT.util.Session.can('contracts.edit');
        this.lookup('contractForm').getForm().getFields().each(function (f) { f.setReadOnly(ro); });
        this.lookup('notesField').setReadOnly(ro);
    },

    // ---------- loading ----------
    load: function (id) {
        var me = this;
        me.mask('Loading contract...');
        GT.model.Contract.load(id, {
            success: function (rec) {
                me.unmask();
                me.setRecord(rec);
            },
            failure: function () {
                me.unmask();
                me.getView().setTitle('Contract #' + id + ' (not found)');
            }
        });
    },

    setRecord: function (rec) {
        var me = this;
        var view = me.getView();
        var vm = me.getViewModel();
        rec.set('versionComment', '', { dirty: false });
        me.record = rec;
        me.lookup('contractForm').loadRecord(rec);
        me.applyReadOnly();
        me.lookup('notesField').setValue(rec.get('notes'));
        me.lookup('notesField').resetOriginalValue();
        vm.set({
            contract: rec, isNew: rec.phantom, status: rec.get('status'), version: rec.get('version'),
            audit: rec.phantom ? null : { createdBy: rec.get('createdBy'), createdAt: rec.get('createdAt'), updatedBy: rec.get('updatedBy'), updatedAt: rec.get('updatedAt'), approvedBy: rec.get('approvedBy') }
        });
        view.setTitle(rec.phantom ? 'New Contract' : rec.get('name'));
        if (!rec.phantom) {
            view.recordId = rec.getId();
            me.lookup('componentGrid').getStore().loadWith({ contractId: rec.getId() });
            me.lookup('tradeGrid').getStore().loadWith({ contractId: rec.getId() });
            me.lookup('recentChanges').setEntity('Contract', rec.getId());
        }
    },

    /** Re-reads the contract (status and version change on the server after component edits). */
    refreshHeader: function () {
        var me = this;
        if (!me.record || me.record.phantom) { return; }
        me.api().get('/contracts/' + me.record.getId(), null, { silent: true }).then(function (data) {
            me.record.set(data, { dirty: false });
            me.getViewModel().set({ status: data.status, version: data.version });
            me.lookup('recentChanges').reload();
            me.notifyChange('Contract');
        });
    },

    isDirty: function () {
        return this.lookup('contractForm').isFormDirty() || this.lookup('notesField').isDirty();
    },

    // ---------- header actions ----------
    onSave: function () {
        var me = this;
        var form = me.lookup('contractForm');
        var rec = me.record;
        if (!form.validateAndFocus()) {
            me.toast('Please correct the highlighted fields', 'warning');
            return Ext.Promise.resolve(false);
        }
        var wasNew = rec.phantom;
        form.getForm().updateRecord(rec);
        rec.set('notes', me.lookup('notesField').getValue());
        if (!wasNew && !rec.dirty) {
            me.toast('No changes to save', 'info');
            return Ext.Promise.resolve(true);
        }
        return me.busy('Saving contract...', function () { return rec.savePromise(); }).then(function (saved) {
            me.setRecord(saved);
            me.notifyChange('Contract');
            GT.util.Lookups.reload('contracts');
            if (wasNew) {
                var view = me.getView();
                view.itemId = 'contract-' + saved.getId();
                me.redirectTo(GT.util.Screens.token('contract', saved.getId()));
                me.toast('Contract created. Add its components, then Validate.');
            } else {
                me.toast('Saved as version ' + saved.get('version') + '. Validate again before approval.');
            }
            return true;
        }, function (err) {
            rec.reject();
            me.applyFieldErrors(form, err);
            return false;
        });
    },

    onValidate: function () {
        var me = this;
        var run = function () {
            return me.busy('Validating...', function () {
                return me.api().post('/contracts/' + me.record.getId() + '/validate');
            }).then(function (result) {
                me.showValidation(result);
                me.record.set(result.contract, { dirty: false });
                me.getViewModel().set({ status: result.contract.status });
                me.notifyChange('Contract');
            }).catch(me.ignore);
        };
        if (me.isDirty()) {
            me.confirm('Save first?', 'The contract has unsaved changes. Save them and validate?').then(function (yes) {
                if (yes) { me.onSave().then(function (ok) { if (ok) { run(); } }); }
            });
            return;
        }
        run();
    },

    showValidation: function (result) {
        var banner = this.lookup('validationBanner');
        var errors = Ext.Array.filter(result.messages, function (m) { return m.level === 'Error'; }).length;
        var warnings = result.messages.length - errors;
        this.lookup('validationGrid').getStore().loadData(result.messages);
        banner.removeCls(['gt-banner-ok', 'gt-banner-error']);
        banner.addCls(result.valid ? 'gt-banner-ok' : 'gt-banner-error');
        banner.setHtml(result.valid
            ? '<i class="fa fa-check-circle"></i> Contract validation passed' + (warnings ? ' with ' + warnings + ' warning' + (warnings > 1 ? 's' : '') : '') + '. It can now be approved by another user.'
            : '<i class="fa fa-times-circle"></i> Validation failed: ' + errors + ' error' + (errors > 1 ? 's' : '') + '. See the Validation tab.');
        banner.show();
        if (!result.valid) {
            this.lookup('detailTabs').setActiveTab(this.lookup('validationGrid'));
        }
        this.toast(result.valid ? 'Validation passed' : 'Validation failed', result.valid ? 'success' : 'error');
    },

    onApprove: function () {
        var me = this;
        me.prompt('Approve contract', 'Approval comment (optional):').then(function (comment) {
            if (comment === null) { return; }
            return me.busy('Approving...', function () {
                return me.api().post('/contracts/' + me.record.getId() + '/approve', { comment: comment });
            }).then(function (data) {
                me.record.set(data, { dirty: false });
                me.getViewModel().set({ status: data.status, audit: Ext.apply({}, me.getViewModel().get('audit'), { approvedBy: data.approvedBy }) });
                me.lookup('recentChanges').reload();
                me.notifyChange('Contract');
                me.toast('Contract approved');
            });
        }).catch(me.ignore);
    },

    onDelete: function () {
        var me = this;
        me.confirm('Delete contract', 'Delete <b>' + Ext.String.htmlEncode(me.record.get('name')) + '</b> and its components?').then(function (yes) {
            if (!yes) { return; }
            return me.busy('Deleting...', function () { return me.record.erasePromise(); }).then(function () {
                me.notifyChange('Contract');
                GT.util.Lookups.reload('contracts');
                me.toast('Contract deleted');
                var view = me.getView();
                view.allowClose = true;
                view.close();
            });
        }).catch(me.ignore);
    },

    onReload: function () {
        var me = this;
        var go = function () { me.load(me.record.getId()); };
        if (me.isDirty()) {
            me.confirm('Discard changes?', 'Reloading discards your unsaved changes.').then(function (yes) { if (yes) { go(); } });
        } else {
            go();
        }
    },

    onVersions: function () {
        Ext.GlobalEvents.fireEvent('gt-openscreen', 'versions', null, 'contract:' + this.record.getId());
    },

    /** Suggest the commodities a contract type normally carries. */
    onTypeChange: function (field, type) {
        var me = this;
        if (!type || !me.record || !me.record.phantom) { return; }
        var commodities = [];
        GT.util.Lookups.getStore('commodities').each(function (c) {
            if (c.get('enabled') && Ext.Array.contains(c.get('contractTypes') || [], type)) { commodities.push(c.getId()); }
        });
        if (type === 'Green PPA') {
            me.lookup('commoditiesField').setValue(Ext.Array.intersect(commodities, ['Energy', 'Renewable Energy Certificate']));
        } else if (commodities.length) {
            me.lookup('commoditiesField').setValue(['Energy']);
        }
    },

    onBeforeClose: function (view) {
        var me = this;
        if (view.allowClose || !me.isDirty()) { return true; }
        me.confirm('Discard changes?', 'This contract has unsaved changes. Close it anyway?').then(function (yes) {
            if (yes) { view.allowClose = true; view.close(); }
        });
        return false;
    },

    // ---------- components ----------
    openComponent: function (rec) {
        var me = this;
        Ext.create('GT.view.contract.ComponentWindow', {
            record: rec,
            contractCommodities: me.record.get('commodities'),
            contractName: me.record.get('name'),
            listeners: {
                saved: function () {
                    me.lookup('componentGrid').getStore().load();
                    me.refreshHeader();
                }
            }
        }).show();
    },

    onAddComponent: function () {
        if (this.record.phantom) {
            this.toast('Save the contract before adding components', 'warning');
            return;
        }
        this.openComponent(Ext.create('GT.model.Component', {
            contractId: this.record.getId(),
            commodity: (this.record.get('commodities') || [])[0],
            product: 'Round The Clock',
            name: ''
        }));
    },

    onEditComponent: function () {
        var rec = this.lookup('componentGrid').getSelectedRecord();
        if (rec) { this.openComponent(rec); }
    },

    onComponentLink: function (grid, rec) {
        this.openComponent(rec);
    },

    onDeleteComponent: function () {
        var me = this;
        var rec = me.lookup('componentGrid').getSelectedRecord();
        if (!rec) { return; }
        me.confirm('Remove component', 'Remove <b>' + Ext.String.htmlEncode(rec.get('name')) + '</b> from this contract?').then(function (yes) {
            if (!yes) { return; }
            return rec.erasePromise().then(function () {
                me.toast('Component removed');
                me.refreshHeader();
            });
        }).catch(me.ignore);
    }
});
