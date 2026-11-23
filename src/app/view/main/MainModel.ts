/*
 * Ported from app/view/main/MainModel.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.view.main.MainModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.main',

    data: {
        userName: '',
        userRole: '',
        clock: '',
        apiOk: true
    },

    formulas: {
        apiStatusHtml: function (get) {
            return get('apiOk')
                ? '<i class="fa fa-circle gt-dot-ok"></i> API connected'
                : '<i class="fa fa-circle gt-dot-down"></i> API unreachable';
        }
    }
});
