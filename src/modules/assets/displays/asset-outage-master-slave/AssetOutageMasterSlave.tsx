/**
 * Asset Outages (master-slave). UI Forge created this component once; it is yours to change.
 * Layout and fields come from asset-outage-master-slave.config.generated.ts (regenerated from src/modules/assets/ui-forge/asset-outage-master-slave.display.json);
 * add behaviour in asset-outage-master-slave.hooks.ts, or replace the template entirely.
 */
import { createMasterSlaveDisplay } from '@extreact/framework';
import { config } from './asset-outage-master-slave.config.generated';
import { hooks } from './asset-outage-master-slave.hooks';

const AssetOutageMasterSlave = createMasterSlaveDisplay(config, hooks);
export default AssetOutageMasterSlave;
