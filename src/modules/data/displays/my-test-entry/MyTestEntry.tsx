/**
 * My Test Entry (entry-form). UI Forge created this component once; it is yours to change.
 * Layout and fields come from my-test-entry.config.generated.ts (regenerated from src/modules/data/ui-forge/my-test-entry.display.json);
 * add behaviour in my-test-entry.hooks.ts, or replace the template entirely.
 */
import { createEntryDisplay } from '@extreact/framework';
import { config } from './my-test-entry.config.generated';
import { hooks } from './my-test-entry.hooks';

const MyTestEntry = createEntryDisplay(config, hooks);
export default MyTestEntry;
