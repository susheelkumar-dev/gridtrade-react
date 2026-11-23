/**
 * Counterparty fields and columns, taken from the Ext JS screen (GT.view.reference.Counterparties and
 * GT.model.Counterparty). Both displays use these, and the server validates the same rules again.
 */
import type { ColumnDef, EntryConfig, FieldDef, SummaryConfig } from '@extreact/framework';

export const COUNTERPARTY_ENDPOINT = '/counterparties';
export const SUMMARY_DISPLAY = 'reference.counterparties';
export const ENTRY_DISPLAY = 'reference.counterparty';

export const counterpartyFields: FieldDef[] = [
  { name: 'code', label: 'Code', required: true, maxLength: 6, upperCase: true, readOnlyOnEdit: false },
  { name: 'name', label: 'Name', required: true, maxLength: 80 },
  { name: 'type', label: 'Type', type: 'lookup', required: true, lookup: { endpoint: '/lookups/counterpartyTypes', valueField: 'id' }, defaultValue: 'Industrial' },
  { name: 'region', label: 'Region', type: 'lookup', lookup: { endpoint: '/lookups/regions', valueField: 'id' }, defaultValue: 'North' },
  { name: 'creditLimit', label: 'Credit Limit (₹ lakh)', type: 'number', min: 0 },
  { name: 'enabled', label: 'Enabled', type: 'boolean', defaultValue: true, help: 'Available for new contracts and trades' },
];

export const counterpartyColumns: ColumnDef[] = [
  { field: 'code', text: 'Code', width: 90 },
  { field: 'name', text: 'Name', flex: 1 },
  { field: 'type', text: 'Type', width: 130, options: ['Industrial', 'Commercial', 'Generator', 'Utility', 'Trader'] },
  { field: 'region', text: 'Region', width: 110, options: ['North', 'West', 'South', 'East', 'Central'] },
  { field: 'creditLimit', text: 'Credit Limit (₹ lakh)', type: 'number', width: 170, align: 'right', renderer: 'indian' },
  { field: 'enabled', text: 'Enabled', type: 'boolean', width: 100, align: 'center', trueText: 'Yes', falseText: 'No' },
];

export const counterpartySummary: SummaryConfig = {
  entity: 'Counterparty',
  entityPlural: 'Counterparties',
  endpoint: COUNTERPARTY_ENDPOINT,
  columns: counterpartyColumns,
  entryDisplay: ENTRY_DISPLAY,
  sorters: [{ property: 'name' }],
};

export const counterpartyEntry: EntryConfig = {
  entity: 'Counterparty',
  endpoint: COUNTERPARTY_ENDPOINT,
  titleField: 'name',
  fields: counterpartyFields,
  summaryDisplay: SUMMARY_DISPLAY,
  columns: 2,
};
