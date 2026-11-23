/*
 * Ported from app.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/*
 * GridTrade Contracts - Ext JS 7.2 (classic toolkit).
 * Application code lives in app/ (namespace GT); framework overrides in overrides/; styles in sass/.
 */
// Accessibility hints are useful while building screens but noisy in the console for this demo.
Ext.ariaWarn = Ext.emptyFn;

Ext.application({
    name: 'GT',
    extend: 'GT.Application'
});
