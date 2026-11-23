/**
 * My Test Entries (summary). UI Forge created this component once; it is yours to change.
 * Layout and fields come from my-test-entries-summary.config.generated.ts (regenerated from src/modules/data/ui-forge/my-test-entries-summary.display.json);
 * add behaviour in my-test-entries-summary.hooks.ts, or replace the template entirely.
 */
import { createSummaryDisplay } from '@extreact/framework';
import { config } from './my-test-entries-summary.config.generated';
import { hooks } from './my-test-entries-summary.hooks';

const MyTestEntriesSummary = createSummaryDisplay(config, hooks);
export default MyTestEntriesSummary;
