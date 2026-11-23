/*
 * Ported from app/model/Component.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** A product component of a contract (price leg or volume reference). Nested REST resource under its contract. */
Ext.define('GT.model.Component', {
    extend: 'GT.core.BaseModel',
    fields: [
        { name: 'contractId', type: 'int' },
        { name: 'name', type: 'string' },
        { name: 'commodity', type: 'string' },
        { name: 'product', type: 'string' },
        { name: 'granularity', type: 'string', defaultValue: 'Hourly' },
        { name: 'type', type: 'string', defaultValue: 'Fixed Price' },
        { name: 'price', type: 'number', allowNull: true },
        { name: 'indexSeriesId', type: 'int', allowNull: true },
        { name: 'adder', type: 'number', allowNull: true },
        { name: 'referenceSeriesId', type: 'int', allowNull: true },
        { name: 'updateValue', type: 'string', defaultValue: 'When underlying data changes' },
        { name: 'usage', type: 'string', defaultValue: 'Price' },
        { name: 'indexSeriesName', type: 'string', persist: false },
        { name: 'referenceSeriesName', type: 'string', persist: false },
        { name: 'pricing', persist: false, depends: ['type', 'price', 'adder', 'indexSeriesName', 'referenceSeriesName'], calculate: function (d) {
            if (d.type === 'Fixed Price') { return d.price ? '₹ ' + d.price + ' /MWh' : ''; }
            if (d.type === 'Index Price') { return (d.indexSeriesName || 'Index') + (d.adder ? ' + ₹ ' + d.adder : ''); }
            return d.referenceSeriesName ? 'Ref: ' + d.referenceSeriesName : '';
        } }
    ],
    proxy: { type: 'gt-rest', url: 'api/contracts/{contractId}/components' }
});
