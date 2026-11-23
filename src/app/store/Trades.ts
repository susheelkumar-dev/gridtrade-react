/*
 * Ported from app/store/Trades.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** Trades grouped by product for the blotter's subtotal rows. */
Ext.define('GT.store.Trades', {
    extend: 'GT.core.BaseStore',
    alias: 'store.gt-trades',
    model: 'GT.model.Trade',
    groupField: 'product',
    sorters: [{ property: 'tradeDate', direction: 'DESC' }]
});
