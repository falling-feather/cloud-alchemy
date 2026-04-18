import type { GameState } from '../types';
import { RECIPES, getRecipeKey } from '../content/recipes';
import { createFreshGameState } from './initialState';
import { applyNextDay } from '../world/dailyPipeline';
import {
  tryHarvestPlot,
  tryPlantPlot,
  tryUnlockFarmland,
} from '../systems/farmland';

export type GameAction =
  | { type: 'DRAG_DROP'; fromSlot: number; toSlot: number }
  | { type: 'NEXT_DAY' }
  | { type: 'ACCEPT_TRADE'; offerId: string }
  | { type: 'CLEAR_SYNTHESIS' }
  | { type: 'RESET_GAME' }
  | { type: 'UNLOCK_FARMLAND' }
  | { type: 'PLANT_PLOT'; plotIndex: number }
  | { type: 'HARVEST_PLOT'; plotIndex: number }
  | { type: 'DISMISS_MORNING_SUMMARY' };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'RESET_GAME':
      return createFreshGameState();

    case 'DISMISS_MORNING_SUMMARY':
      return { ...state, lastMorningSummary: null };

    case 'UNLOCK_FARMLAND': {
      const next = tryUnlockFarmland(state);
      return next ?? state;
    }

    case 'PLANT_PLOT': {
      const next = tryPlantPlot(state, action.plotIndex);
      return next ?? state;
    }

    case 'HARVEST_PLOT': {
      const next = tryHarvestPlot(state, action.plotIndex);
      return next ?? state;
    }

    case 'DRAG_DROP': {
      const { fromSlot, toSlot } = action;
      if (fromSlot === toSlot) return state;

      const inv = state.inventory.map(s => ({ ...s }));
      const slotA = inv[fromSlot];
      const slotB = inv[toSlot];

      if (!slotA.itemType) return state;

      if (!slotB.itemType) {
        slotB.itemType = slotA.itemType;
        slotB.amount = slotA.amount;
        slotA.itemType = null;
        slotA.amount = 0;
        return { ...state, inventory: inv, lastSynthesis: null };
      }

      if (slotA.itemType === slotB.itemType) {
        slotB.amount += slotA.amount;
        slotA.itemType = null;
        slotA.amount = 0;
        return { ...state, inventory: inv, lastSynthesis: null };
      }

      const recipeKey = getRecipeKey(slotA.itemType, slotB.itemType);
      const result = RECIPES[recipeKey];

      if (result) {
        slotA.amount -= 1;
        slotB.amount -= 1;
        const aEmpty = slotA.amount === 0;
        const bEmpty = slotB.amount === 0;
        if (aEmpty) { slotA.itemType = null; }
        if (bEmpty) { slotB.itemType = null; }

        let targetSlotId: number;
        if (bEmpty) {
          targetSlotId = toSlot;
        } else if (aEmpty) {
          targetSlotId = fromSlot;
        } else {
          const emptyIdx = inv.findIndex(s => !s.itemType);
          if (emptyIdx === -1) return state;
          targetSlotId = emptyIdx;
        }

        const existingIdx = inv.findIndex(
          (s, i) => s.itemType === result && i !== fromSlot && i !== toSlot,
        );
        if (existingIdx !== -1) {
          inv[existingIdx].amount += 1;
          targetSlotId = existingIdx;
        } else {
          inv[targetSlotId].itemType = result;
          inv[targetSlotId].amount = (inv[targetSlotId].amount || 0) + 1;
        }

        const newDiscovered = new Set(state.discovered);
        const isNew = !newDiscovered.has(result);
        newDiscovered.add(result);

        const newRecipes = new Set(state.discoveredRecipes);
        newRecipes.add(recipeKey);

        const tutorial =
          result === 'sapling'
            ? { ...state.tutorial, made_sapling: true }
            : state.tutorial;

        return {
          ...state,
          inventory: inv,
          discovered: [...newDiscovered],
          discoveredRecipes: [...newRecipes],
          lastSynthesis: { slotId: targetSlotId, itemType: result, isNew },
          tutorial,
        };
      }

      const tmpType = slotB.itemType;
      const tmpAmount = slotB.amount;
      slotB.itemType = slotA.itemType;
      slotB.amount = slotA.amount;
      slotA.itemType = tmpType;
      slotA.amount = tmpAmount;
      return { ...state, inventory: inv, lastSynthesis: null };
    }

    case 'NEXT_DAY':
      return applyNextDay(state);

    case 'ACCEPT_TRADE': {
      const offer = state.merchantOffers.find(o => o.id === action.offerId);
      if (!offer) return state;

      const inv = state.inventory.map(s => ({ ...s }));
      const total = inv
        .filter(s => s.itemType === offer.give.itemType)
        .reduce((sum, s) => sum + s.amount, 0);
      if (total < offer.give.amount) return state;

      let remaining = offer.give.amount;
      for (const slot of inv) {
        if (slot.itemType === offer.give.itemType && remaining > 0) {
          const take = Math.min(slot.amount, remaining);
          slot.amount -= take;
          remaining -= take;
          if (slot.amount === 0) slot.itemType = null;
        }
      }

      const newDiscovered = new Set(state.discovered);
      newDiscovered.add(offer.receive.itemType);

      const existing = inv.find(s => s.itemType === offer.receive.itemType);
      if (existing) {
        existing.amount += offer.receive.amount;
      } else {
        const empty = inv.find(s => !s.itemType);
        if (!empty) return state;
        empty.itemType = offer.receive.itemType;
        empty.amount = offer.receive.amount;
      }

      return {
        ...state,
        inventory: inv,
        merchantOffers: state.merchantOffers.filter(o => o.id !== action.offerId),
        discovered: [...newDiscovered],
        lastSynthesis: null,
      };
    }

    case 'CLEAR_SYNTHESIS':
      return { ...state, lastSynthesis: null };

    default:
      return state;
  }
}
