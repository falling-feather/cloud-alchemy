import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { GameState, InventorySlot, TradeOffer } from '../types/game';
import { ITEMS } from '../data/items';
import { RECIPES, getRecipeKey } from '../data/recipes';

const SLOT_COUNT = 30;

function createInitialInventory(): InventorySlot[] {
  const slots: InventorySlot[] = Array.from({ length: SLOT_COUNT }, (_, i) => ({
    slotId: i,
    itemType: null,
    amount: 0,
  }));
  const starters = ['water', 'earth', 'fire', 'air', 'wood'];
  starters.forEach((item, i) => {
    slots[i] = { slotId: i, itemType: item, amount: 3 };
  });
  return slots;
}

function generateMerchantOffers(inventory: InventorySlot[], discovered: string[]): TradeOffer[] {
  const discoveredSet = new Set(discovered);
  const allItemIds = Object.keys(ITEMS);
  const basicIds = allItemIds.filter(id => ITEMS[id].rarity === 'basic');

  const playerItems = inventory
    .filter(s => s.itemType && s.amount > 0)
    .map(s => ({ itemType: s.itemType as string, amount: s.amount }));
  const playerHas = new Set(playerItems.map(p => p.itemType));

  const rarityPrice: Record<string, number> = {
    basic: 2, common: 3, uncommon: 4, rare: 5, legendary: 7,
  };

  const undiscovered = allItemIds.filter(id => !discoveredSet.has(id));
  const discPool = allItemIds.filter(id => discoveredSet.has(id));
  const receivePool = [...undiscovered, ...undiscovered, ...undiscovered, ...discPool];

  const offers: TradeOffer[] = [];
  const usedReceive = new Set<string>();

  const basicReceive = basicIds.filter(id => !usedReceive.has(id));
  if (basicReceive.length > 0) {
    const receiveItem = basicReceive[Math.floor(Math.random() * basicReceive.length)];
    usedReceive.add(receiveItem);
    const giveOptions = playerItems.filter(p => p.itemType !== receiveItem && p.amount >= 2);
    const giveItem = giveOptions.length > 0
      ? giveOptions[Math.floor(Math.random() * giveOptions.length)].itemType
      : basicIds[Math.floor(Math.random() * basicIds.length)];
    offers.push({
      id: `offer-${Date.now()}-0`,
      give: { itemType: giveItem, amount: 2 },
      receive: { itemType: receiveItem, amount: 2 },
    });
  }

  for (let i = 1; offers.length < 3; i++) {
    if (i > 10) break;
    const available = receivePool.filter(id => !usedReceive.has(id));
    if (available.length === 0) break;

    const receiveItem = available[Math.floor(Math.random() * available.length)];
    usedReceive.add(receiveItem);
    const rarity = ITEMS[receiveItem]?.rarity ?? 'basic';
    const giveAmount = rarityPrice[rarity] ?? 3;

    const giveOptions = playerItems.filter(
      p => p.itemType !== receiveItem && p.amount >= giveAmount,
    );
    let giveItem: string;
    if (giveOptions.length > 0) {
      giveItem = giveOptions[Math.floor(Math.random() * giveOptions.length)].itemType;
    } else if (playerHas.size > 0) {
      const arr = [...playerHas].filter(id => id !== receiveItem);
      giveItem = arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : basicIds[0];
    } else {
      giveItem = basicIds[Math.floor(Math.random() * basicIds.length)];
    }

    offers.push({
      id: `offer-${Date.now()}-${i}`,
      give: { itemType: giveItem, amount: giveAmount },
      receive: { itemType: receiveItem, amount: 1 },
    });
  }

  return offers;
}

const initialInventory = createInitialInventory();
const initialState: GameState = {
  inventory: initialInventory,
  discovered: ['water', 'earth', 'fire', 'air', 'wood'],
  discoveredRecipes: [],
  day: 1,
  merchantOffers: generateMerchantOffers(initialInventory, ['water', 'earth', 'fire', 'air', 'wood']),
  lastSynthesis: null,
};

type Action =
  | { type: 'DRAG_DROP'; fromSlot: number; toSlot: number }
  | { type: 'NEXT_DAY' }
  | { type: 'ACCEPT_TRADE'; offerId: string }
  | { type: 'CLEAR_SYNTHESIS' };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'DRAG_DROP': {
      const { fromSlot, toSlot } = action;
      if (fromSlot === toSlot) return state;

      const inv = state.inventory.map(s => ({ ...s }));
      const slotA = inv[fromSlot];
      const slotB = inv[toSlot];

      if (!slotA.itemType) return state;

      // Move to empty slot
      if (!slotB.itemType) {
        slotB.itemType = slotA.itemType;
        slotB.amount = slotA.amount;
        slotA.itemType = null;
        slotA.amount = 0;
        return { ...state, inventory: inv, lastSynthesis: null };
      }

      // Same type: stack
      if (slotA.itemType === slotB.itemType) {
        slotB.amount += slotA.amount;
        slotA.itemType = null;
        slotA.amount = 0;
        return { ...state, inventory: inv, lastSynthesis: null };
      }

      // Check recipe
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

        // Stack with existing if possible
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

        return {
          ...state,
          inventory: inv,
          discovered: [...newDiscovered],
          discoveredRecipes: [...newRecipes],
          lastSynthesis: { slotId: targetSlotId, itemType: result, isNew },
        };
      }

      // No recipe: swap
      const tmpType = slotB.itemType;
      const tmpAmount = slotB.amount;
      slotB.itemType = slotA.itemType;
      slotB.amount = slotA.amount;
      slotA.itemType = tmpType;
      slotA.amount = tmpAmount;
      return { ...state, inventory: inv, lastSynthesis: null };
    }

    case 'NEXT_DAY': {
      const newOffers = generateMerchantOffers(state.inventory, state.discovered);
      return { ...state, day: state.day + 1, merchantOffers: newOffers, lastSynthesis: null };
    }

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

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}

export function useDispatch() {
  const { dispatch } = useGame();
  const dragDrop = useCallback((fromSlot: number, toSlot: number) =>
    dispatch({ type: 'DRAG_DROP', fromSlot, toSlot }), [dispatch]);
  const nextDay = useCallback(() => dispatch({ type: 'NEXT_DAY' }), [dispatch]);
  const acceptTrade = useCallback((offerId: string) =>
    dispatch({ type: 'ACCEPT_TRADE', offerId }), [dispatch]);
  const clearSynthesis = useCallback(() => dispatch({ type: 'CLEAR_SYNTHESIS' }), [dispatch]);
  return { dragDrop, nextDay, acceptTrade, clearSynthesis };
}
