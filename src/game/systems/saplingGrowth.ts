import type { GameState } from '../types';
import { grantItems, transformItemInInventory } from './inventoryOps';

/** 过天后：树苗长成木材（按数量 1:1 转化堆叠） */
export function growSaplingsToWood(state: GameState): GameState {
  const hasSapling = state.inventory.some(s => s.itemType === 'sapling' && s.amount > 0);
  if (!hasSapling) return state;

  let inv = transformItemInInventory(state.inventory, 'sapling', 'wood');
  const disc = new Set(state.discovered);
  disc.add('wood');

  return {
    ...state,
    inventory: inv,
    discovered: [...disc],
  };
}

/** 雨天：赠送清水 */
export function applyRainWater(state: GameState, amount: number): GameState {
  const { inventory, granted } = grantItems(state.inventory, 'water', amount);
  const lines: string[] = [];
  if (granted > 0) lines.push(`雨天收集了雨水：水 ×${granted}`);
  return {
    ...state,
    inventory,
    eventLog: [
      ...(lines.length ? [{ day: state.day, message: lines[0]! }] : []),
      ...state.eventLog,
    ].slice(0, 40),
  };
}
