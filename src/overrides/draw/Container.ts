/*
 * Ported from overrides/draw/Container.js (Ext JS) by extjs-migration-agent.
 * Written against @extreact/runtime (the Ext JS-style class system, stores and components for React), so it keeps
 * its Ext.define structure. Edit it like any other module.
 */
import { Ext } from '@extreact/runtime';
void Ext;

/** Charts in this app never post images to Sencha's public export server. */
Ext.define('GT.overrides.draw.Container', {
    override: 'Ext.draw.Container',
    config: {
        downloadServerUrl: 'about:blank'
    }
});
