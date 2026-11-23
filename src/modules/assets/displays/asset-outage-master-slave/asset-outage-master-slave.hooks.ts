import type { MasterSlaveHooks } from '@extreact/framework';

/**
 * Code for “Asset Outages”. UI Forge created this file once and never changes it: it is yours.
 *
 * master      Summary hooks of the master list
 * detailList  Summary hooks of the child list (relation 'child')
 * detail      Entry hooks of the detail form
 */
export const hooks: MasterSlaveHooks = {
  master: {
  },
  detailList: {},
  detail: {
    // afterLoad: (record) => record,
    // beforeSave: async (values, ctx) => values,
    // afterSave: (saved, ctx) => {},
    // validators: { myRule: (value, values, field) => null },
    // validate: (values) => ({}),
  },
};
