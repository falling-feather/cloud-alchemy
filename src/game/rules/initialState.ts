import type { GameState } from '../types';
import { assertValidGameContent } from '../content/validate';
import { createInitialInventory, STARTER_ITEM_IDS } from './inventory';
import { generateMerchantOffers } from './merchant';
import { computeMerchantTier } from '../progression/merchantTier';
import { createInitialFarmland } from '../systems/farmland';

assertValidGameContent();

const starters = [...STARTER_ITEM_IDS];

export function createFreshGameState(): GameState {
  const inventory = createInitialInventory();
  const discovered = [...starters];
  const tier = computeMerchantTier({
    day: 1,
    discovered,
    unlockedEventTags: [],
  });
  return {
    inventory,
    discovered,
    discoveredRecipes: [],
    day: 1,
    merchantOffers: generateMerchantOffers(inventory, discovered, undefined, tier),
    lastSynthesis: null,
    weather: 'sunny',
    merchantTier: tier,
    runSeed: 0xca11ab1e,
    completedOneShotEvents: [],
    unlockedEventTags: [],
    tutorial: {},
    farmland: createInitialFarmland(),
    eventLog: [],
    lastMorningSummary: null,
  };
}
