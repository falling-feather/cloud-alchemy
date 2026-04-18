import type { InventorySlot } from '../types';

export const SLOT_COUNT = 36;

export function createInitialInventory(): InventorySlot[] {
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

export const STARTER_ITEM_IDS = ['water', 'earth', 'fire', 'air', 'wood'] as const;
