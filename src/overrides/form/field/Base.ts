/*
 * Ported from overrides/form/field/Base.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** Every field with allowBlank: false shows a red asterisk after its label, app-wide. */
Ext.define('GT.overrides.form.field.Base', {
    override: 'Ext.form.field.Base',

    initComponent: function () {
        if (this.allowBlank === false && this.fieldLabel && !this.afterLabelTextTpl) {
            this.afterLabelTextTpl = '<span class="gt-required" data-qtip="Required">*</span>';
        }
        this.callParent(arguments);
    }
});
