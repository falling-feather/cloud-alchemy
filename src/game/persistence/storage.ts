import type { GameState } from '../types';
import type { InventorySlot } from '../types';
import { persistedGameStateSchema, persistedGameStateSchemaV2 } from '../content/schemas';
import { generateMerchantOffers } from '../rules/merchant';
import { createInitialFarmland } from '../systems/farmland';
import { computeMerchantTier } from '../progression/merchantTier';
import { SLOT_COUNT } from '../rules/inventory';

export const SAVE_STORAGE_KEY = 'cloud-alchemy-save';

function normalizeInventorySlots(raw: InventorySlot[]): InventorySlot[] {
  const next = raw.map((s, i) => ({ ...s, slotId: i }));
  while (next.length < SLOT_COUNT) {
    next.push({ slotId: next.length, itemType: null, amount: 0 });
  }
  if (next.length > SLOT_COUNT) {
    return next.slice(0, SLOT_COUNT).map((s, i) => ({ ...s, slotId: i }));
  }
  return next;
}

function defaultMetaFromV1(
  discovered: string[],
  day: number,
): Pick<GameState,
  'weather' | 'merchantTier' | 'runSeed' | 'completedOneShotEvents' | 'unlockedEventTags' | 'tutorial' | 'farmland' | 'eventLog' | 'lastMorningSummary'
> {
  let seed = 0;
  for (let i = 0; i < discovered.length; i++) seed = (seed + discovered.charCodeAt(i) * (i + 1)) >>> 0;
  seed = (seed + day * 9973) >>> 0;
  return {
    weather: 'sunny',
    merchantTier: computeMerchantTier({ day, discovered, unlockedEventTags: [] }),
    runSeed: seed || 1,
    completedOneShotEvents: [],
    unlockedEventTags: [],
    tutorial: {},
    farmland: createInitialFarmland(),
    eventLog: [],
    lastMorningSummary: null,
  };
}

export function tryLoadPersistedState(): Omit<GameState, 'lastSynthesis'> | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return null;
    const json: unknown = JSON.parse(raw);

    const v2 = persistedGameStateSchemaV2.safeParse(json);
    if (v2.success) {
      const d = v2.data;
      const inventory = normalizeInventorySlots(d.inventory);
      return {
        inventory,
        discovered: d.discovered,
        discoveredRecipes: d.discoveredRecipes,
        day: d.day,
        merchantOffers:
          d.merchantOffers.length > 0
            ? d.merchantOffers
            : generateMerchantOffers(d.inventory, d.discovered, undefined, d.merchantTier),
        weather: d.weather,
        merchantTier: d.merchantTier,
        runSeed: d.runSeed,
        completedOneShotEvents: d.completedOneShotEvents,
        unlockedEventTags: d.unlockedEventTags,
        tutorial: d.tutorial,
        farmland: d.farmland,
        eventLog: d.eventLog,
        lastMorningSummary: d.lastMorningSummary,
      };
    }

    const v1 = persistedGameStateSchema.safeParse(json);
    if (!v1.success) return null;
    const d = v1.data;
    const inventory = normalizeInventorySlots(d.inventory);
    const meta = defaultMetaFromV1(d.discovered, d.day);
    return {
      inventory,
      discovered: d.discovered,
      discoveredRecipes: d.discoveredRecipes,
      day: d.day,
      merchantOffers:
        d.merchantOffers.length > 0
          ? d.merchantOffers
          : generateMerchantOffers(d.inventory, d.discovered, undefined, meta.merchantTier),
      ...meta,
    };
  } catch {
    return null;
  }
}

export function persistGameState(state: GameState): void {
  if (typeof localStorage === 'undefined') return;
  const payload = {
    version: 2 as const,
    inventory: state.inventory,
    discovered: state.discovered,
    discoveredRecipes: state.discoveredRecipes,
    day: state.day,
    merchantOffers: state.merchantOffers,
    weather: state.weather,
    merchantTier: state.merchantTier,
    runSeed: state.runSeed,
    completedOneShotEvents: state.completedOneShotEvents,
    unlockedEventTags: state.unlockedEventTags,
    tutorial: state.tutorial,
    farmland: state.farmland,
    eventLog: state.eventLog,
    lastMorningSummary: state.lastMorningSummary,
  };
  localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
}

export function clearPersistedGame(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(SAVE_STORAGE_KEY);
  }
}
