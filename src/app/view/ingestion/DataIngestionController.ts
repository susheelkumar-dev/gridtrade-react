/*
 * Ported from app/view/ingestion/DataIngestionController.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.view.ingestion.DataIngestionController', {
    extend: 'GT.core.BaseController',
    alias: 'controller.dataingestion',
    requires: ['GT.util.Csv', 'GT.util.Lookups'],

    help: {
        trades: 'Columns: <code>tradeDate, buySell, counterparty, product, deliveryStart, deliveryEnd, volumeMw, priceInrMwh</code>. ' +
            'Counterparty is a code (e.g. ARV) or name; product is DAM, RTM, TAM, G-DAM or Bilateral. <a href="resources/samples/trades-sample.csv" download>Sample file</a>',
        meter: 'Columns: <code>series, date, interval, value</code>. Series is a time series code (e.g. METER_ARV_KWH) or name; interval 1-24 for hourly series. ' +
            '<a href="resources/samples/meter-sample.csv" download>Sample file</a>'
    },

    init: function () {
        this.lookup('helpText').setHtml(this.help.trades);
        this.lookup('jobGrid').getStore().on('load', function (store) {
            var grid = this.lookup('jobGrid');
            if (store.getCount() && !grid.getSelection().length) { grid.getSelectionModel().select(0); }
        }, this);
    },

    onTargetChange: function (group, value) {
        this.lookup('helpText').setHtml(this.help[value.target] || '');
    },

    onUpload: function () {
        var me = this;
        var field = me.lookup('fileField');
        var file = field.fileInputEl && field.fileInputEl.dom.files[0];
        var target = me.lookup('targetGroup').getValue().target;
        if (!file) {
            me.toast('Choose a CSV file first', 'warning');
            return;
        }
        if (!field.isValid()) { return; }
        if (file.size > 5 * 1024 * 1024) {
            me.toast('Files over 5 MB are not accepted in this demo', 'warning');
            return;
        }
        me.busy('Uploading and validating ' + file.name + '...', function () {
            return GT.util.Csv.readFile(file).then(function (content) {
                return me.api().post('/ingestion/upload', { target: target, fileName: file.name, content: content });
            });
        }).then(function (job) {
            var type = job.status === 'Completed' ? 'success' : (job.status === 'Failed' ? 'error' : 'warning');
            me.toast(job.fileName + ': ' + job.accepted + ' of ' + job.total + ' row(s) loaded, ' + job.rejected + ' rejected, ' + job.warnings + ' warning(s)', type);
            field.reset();
            var grid = me.lookup('jobGrid');
            grid.getStore().loadPromise().then(function () {
                var rec = grid.getStore().getById(job.id);
                if (rec) { grid.getSelectionModel().select(rec); }
            });
            if (target === 'trades' && job.accepted) { me.notifyChange('Trade'); }
        }).catch(me.ignore);
    },

    onJobSelect: function (sm, selected) {
        var grid = this.lookup('errorGrid');
        var job = selected[0];
        if (!job) {
            grid.getStore().removeAll();
            grid.setTitle('Row-level issues');
            return;
        }
        grid.setTitle('Row-level issues – ' + Ext.String.htmlEncode(job.get('fileName')) + ' (' + job.get('errorCount') + ')');
        grid.getStore().loadWith({ jobId: job.getId() });
    }
});
