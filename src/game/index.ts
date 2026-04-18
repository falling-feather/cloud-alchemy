export type {
  GameState,
  Item,
  InventorySlot,
  TradeOffer,
  SynthesisEvent,
  Rarity,
} from './types';
export { ITEMS, ITEM_LIST, RECIPES, getRecipeKey, RECIPE_INFO, assertValidGameContent } from './content';
export { MERCHANT_CONFIG } from './rules/merchantConfig';
export { gameReducer, type GameAction } from './rules/reducer';
export { createFreshGameState } from './rules/initialState';
export { SLOT_COUNT, createInitialInventory, STARTER_ITEM_IDS } from './rules/inventory';
export { generateMerchantOffers } from './rules/merchant';
export { MILESTONE_GOALS, milestoneProgress, type MilestoneGoal } from './rules/goals';
export {
  buildInitialGameState,
} from './persistence/hydrate';
export {
  persistGameState,
  tryLoadPersistedState,
  clearPersistedGame,
  SAVE_STORAGE_KEY,
} from './persistence/storage';
export { applyNextDay } from './world/dailyPipeline';
export { weatherLabel } from './world/weather';
export { computeMerchantTier } from './progression/merchantTier';
