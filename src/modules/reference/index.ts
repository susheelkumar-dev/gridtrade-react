/** Reference Data module: the display implementations it provides, by key (see registration/). */
import { defineDisplays } from '@extreact/framework';

export const referenceDisplays = defineDisplays({
  CounterpartySummary: { load: () => import('./displays/counterparty-summary/CounterpartySummary'), types: ['summary'] },
  CounterpartyEntry: { load: () => import('./displays/counterparty-entry/CounterpartyEntry'), types: ['entry-form'] },
});
