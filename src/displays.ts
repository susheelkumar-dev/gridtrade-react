/**
 * Every implementation a registered GridTrade display may use. The menu comes from the display registry;
 * this list only says which code exists in this build.
 */
import { builtinDisplays, mergeDisplays } from '@extreact/framework';
import { screens } from './app-bridge';
import { referenceDisplays } from './modules/reference';

// <ui-forge:import>
import { generatedDisplays } from './modules/generated-displays';
// </ui-forge:import>
export const displays = mergeDisplays(
  builtinDisplays,  // SummaryDisplay, EntryForm, MasterSlave: screens configured purely by metadata
  screens,          // 'ExtScreen': GridTrade's Ext-style views, by xtype (display type 'custom')
  referenceDisplays,
  // <ui-forge:registry>
  generatedDisplays,
  // </ui-forge:registry>
);
