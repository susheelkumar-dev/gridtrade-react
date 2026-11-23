/*
 * Ported from app/model/Trade.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

Ext.define('GT.model.Trade', {
    extend: 'GT.core.BaseModel',
    fields: [
        { name: 'tradeRef', type: 'string', persist: false },
        { name: 'tradeDate', type: 'date', dateFormat: 'Y-m-d' },
        { name: 'buySell', type: 'string', defaultValue: 'Buy' },
        { name: 'counterpartyId', type: 'int', allowNull: true },
        { name: 'product', type: 'string', defaultValue: 'DAM' },
        { name: 'deliveryStart', type: 'date', dateFormat: 'Y-m-d' },
        { name: 'deliveryEnd', type: 'date', dateFormat: 'Y-m-d' },
        { name: 'block', type: 'string', defaultValue: '00:00-24:00' },
        { name: 'volumeMw', type: 'number', allowNull: true },
        { name: 'priceInrMwh', type: 'number', allowNull: true },
        { name: 'contractId', type: 'int', allowNull: true },
        { name: 'comments', type: 'string' },
        { name: 'status', type: 'string', defaultValue: 'New', persist: false },
        { name: 'trader', type: 'string', persist: false },
        { name: 'source', type: 'string', persist: false },
        { name: 'counterpartyName', type: 'string', persist: false },
        { name: 'contractName', type: 'string', persist: false },
        { name: 'notionalInr', type: 'number', persist: false }
    ],
    proxy: { type: 'gt-rest', url: 'api/trades' }
});
