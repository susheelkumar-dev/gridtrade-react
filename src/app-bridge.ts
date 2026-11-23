/**
 * GridTrade's Ext-style screens inside the shell. Hosting them is generic and comes from @extreact/framework
 * (classicDisplays renders a view by its xtype, classicBridge signs every Ext Ajax / store request with the user's
 * token). Only what the old GT.Application.launch did is GridTrade-specific and stays here:
 *  - GT.util.Session reflects the signed-in user, so screens hide what the user may not do;
 *  - shared lookup lists are loaded once;
 *  - GT.util.Screens.open(...) (the 'gt-openscreen' event) opens the registered display for that screen key.
 */
import { Ext } from '@extreact/runtime';
import { classicBridge, classicDisplays } from '@extreact/framework';

export const screens = classicDisplays(Ext, {
  actionEvent: 'screenaction',
  screenConfig: (meta, params) => ({
    screenKey: meta.config.screenKey,
    recordId: params.id && params.id !== 'new' ? Number(params.id) : null,
  }),
});

export const bridge = classicBridge(Ext, {
  async start(shell) {
    const GT = (globalThis as any).GT;
    Ext.Ajax.setTimeout(60000);
    try {
      Ext.state.Manager.setProvider(new Ext.state.LocalStorageProvider({ prefix: 'gt-state-' }));
    } catch (e) { /* storage blocked: grids do not remember their layout */ }
    Ext.tip.QuickTipManager.init();

    const session = GT.util.Session;
    const me = await shell.api.get<{ user: any; permissions: string[] }>('/me');
    session.user = shell.session.user.username;
    session.profile = me.user;
    session.users = [];
    // always the current permissions (they are refreshed with the token)
    Object.defineProperty(session, 'permissions', { configurable: true, get: () => shell.session.permissions });
    // sign-in replaces the demo user switcher
    session.load = () => Ext.Promise.resolve(session);
    session.setUser = () => Ext.Promise.resolve(session);

    await GT.util.Lookups.preload();

    Ext.GlobalEvents.on('gt-openscreen', (key: string, id?: string | number | null, action?: string) => {
      const display = shell.findDisplay('screenKey', key);
      if (!display) {
        shell.notify('You do not have access to that screen.', 'warning');
        return;
      }
      shell.open(display.id, id !== undefined && id !== null ? { id } : {}, action);
    });
  },
});
