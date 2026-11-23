import type { EntryHooks } from '@extreact/framework';

/**
 * Code for “My Test Entry”. UI Forge created this file once and never changes it: it is yours.
 *
 * afterLoad / beforeSave / afterSave   reshape what is loaded and saved; throw to stop a save
 * validators                           named field validators (FieldDef.validator)
 * validate                             cross-field rules: return { field: message }
 * onAction                             custom actions without a path
 * renderExtra                          extra content under the form
 */
export const hooks: EntryHooks = {
  // afterLoad: (record) => record,
  // beforeSave: async (values, ctx) => values,
  // afterSave: (saved, ctx) => {},
  // validators: { myRule: (value, values, field) => null },
  // validate: (values) => ({}),
};
