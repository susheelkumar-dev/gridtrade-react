/**
 * Generation Assets (summary). UI Forge created this component once; it is yours to change.
 * Layout and fields come from generation-asset-summary.config.generated.ts (regenerated from src/modules/assets/ui-forge/generation-asset-summary.display.json);
 * add behaviour in generation-asset-summary.hooks.ts, or replace the template entirely.
 */
import { createSummaryDisplay } from '@extreact/framework';
import { config } from './generation-asset-summary.config.generated';
import { hooks } from './generation-asset-summary.hooks';

const GenerationAssetSummary = createSummaryDisplay(config, hooks);
export default GenerationAssetSummary;
