import { itemSchema } from './schemas';
import { ITEMS, ITEM_LIST } from './items';
import { RECIPES, getRecipeKey } from './recipes';

let validated = false;

/** 启动时校验物品与配方表一致性（失败则抛错，避免静默坏档） */
export function assertValidGameContent(): void {
  if (validated) return;

  const ids = new Set<string>();
  for (const item of ITEM_LIST) {
    const r = itemSchema.safeParse(item);
    if (!r.success) {
      throw new Error(`Invalid item definition: ${item.id}\n${r.error.message}`);
    }
    if (item.id !== item.id.trim()) {
      throw new Error(`Item id has whitespace: ${item.id}`);
    }
    if (ids.has(item.id)) {
      throw new Error(`Duplicate item id: ${item.id}`);
    }
    ids.add(item.id);
  }

  for (const [key, resultId] of Object.entries(RECIPES)) {
    const parts = key.split('+');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error(`Invalid recipe key (need a+b): ${key}`);
    }
    const [a, b] = parts;
    const sortedKey = getRecipeKey(a, b);
    if (sortedKey !== key) {
      throw new Error(
        `Recipe key must be sorted (a+b sorted): got "${key}", expected "${sortedKey}"`,
      );
    }
    if (!ids.has(a) || !ids.has(b)) {
      throw new Error(`Recipe ${key} references unknown ingredient`);
    }
    if (!ids.has(resultId)) {
      throw new Error(`Recipe ${key} result "${resultId}" is not a defined item`);
    }
  }

  validated = true;
}
