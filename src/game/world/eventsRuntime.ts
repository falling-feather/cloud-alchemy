import type { GameState } from '../types';
import { DAILY_EVENTS } from '../content/dailyEvents';
import { grantItems } from '../systems/inventoryOps';

function lcg(n: number): number {
  return (Math.imul(n, 1664525) + 1013904223) >>> 0;
}

/** 有概率触发一条随机事件（加权），并更新标签 / 背包 */
export function pickAndApplyRandomEvent(state: GameState, seed: number): { state: GameState; nextSeed: number } {
  const roll = lcg(seed);
  const nextSeed = lcg(roll);
  // 约 40% 概率无事发生
  if (roll % 100 < 40) {
    return { state, nextSeed };
  }

  const candidates = DAILY_EVENTS.filter(def => {
    if (def.minDay !== undefined && state.day < def.minDay) return false;
    if (def.weather && def.weather !== state.weather) return false;
    if (def.requiresTags?.length && !def.requiresTags.every(t => state.unlockedEventTags.includes(t))) {
      return false;
    }
    if (def.oneShot && state.completedOneShotEvents.includes(def.id)) return false;
    return true;
  });

  if (candidates.length === 0) {
    return { state, nextSeed };
  }

  const totalW = candidates.reduce((acc, d) => acc + d.weight, 0);
  let r = nextSeed % totalW;
  let chosen = candidates[0]!;
  for (const c of candidates) {
    if (r < c.weight) {
      chosen = c;
      break;
    }
    r -= c.weight;
  }

  let s = state;
  const tags = new Set(s.unlockedEventTags);
  const done = new Set(s.completedOneShotEvents);
  if (chosen.oneShot) done.add(chosen.id);
  chosen.unlockTags?.forEach(t => tags.add(t));

  if (chosen.grant) {
    const g = grantItems(s.inventory, chosen.grant.itemId, chosen.grant.amount);
    const disc = new Set(s.discovered);
    disc.add(chosen.grant.itemId);
    s = {
      ...s,
      inventory: g.inventory,
      discovered: [...disc],
    };
  }

  s = {
    ...s,
    unlockedEventTags: [...tags],
    completedOneShotEvents: [...done],
    eventLog: [{ day: s.day, message: chosen.message }, ...s.eventLog].slice(0, 40),
    tutorial: {
      ...s.tutorial,
      seen_random_event: true,
    },
  };

  return { state: s, nextSeed: lcg(lcg(nextSeed)) };
}
