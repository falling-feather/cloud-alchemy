import type { InventorySlot } from '../types';

/** 向背包添加物品，优先堆叠已有格，否则使用空位 */
export function grantItems(
  inventory: InventorySlot[],
  itemType: string,
  amount: number,
): { inventory: InventorySlot[]; granted: number } {
  if (amount <= 0) return { inventory: inventory.map(s => ({ ...s })), granted: 0 };
  const inv = inventory.map(s => ({ ...s }));
  let left = amount;

  const tryAddToStack = () => {
    const stack = inv.find(s => s.itemType === itemType);
    if (stack) {
      stack.amount += left;
      const g = left;
      left = 0;
      return g;
    }
    return 0;
  };

  tryAddToStack();
  while (left > 0) {
    const empty = inv.find(s => !s.itemType);
    if (!empty) break;
    empty.itemType = itemType;
    empty.amount = left;
    left = 0;
  }

  const granted = amount - left;
  return { inventory: inv, granted };
}

/** 从背包扣除物品（跨多格），不足则返回原状与 0 */
export function takeItems(
  inventory: InventorySlot[],
  itemType: string,
  amount: number,
): { inventory: InventorySlot[]; taken: number } | null {
  const inv = inventory.map(s => ({ ...s }));
  const total = inv
    .filter(s => s.itemType === itemType)
    .reduce((sum, s) => sum + s.amount, 0);
  if (total < amount) return null;

  let remaining = amount;
  for (const slot of inv) {
    if (slot.itemType === itemType && remaining > 0) {
      const take = Math.min(slot.amount, remaining);
      slot.amount -= take;
      remaining -= take;
      if (slot.amount === 0) slot.itemType = null;
    }
  }
  return { inventory: inv, taken: amount };
}

/** 将背包中某物品全部替换为另一种（用于树苗长成木材） */
export function transformItemInInventory(
  inventory: InventorySlot[],
  fromType: string,
  toType: string,
): InventorySlot[] {
  return inventory.map(s => {
    if (s.itemType === fromType) {
      return { ...s, itemType: toType };
    }
    return { ...s };
  });
}
