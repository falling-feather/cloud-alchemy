import type { GameState } from '../types';

/** 根据天数、图鉴与标签推导商人档位 */
export function computeMerchantTier(state: Pick<GameState, 'day' | 'discovered' | 'unlockedEventTags'>): number {
  let t = 1;
  if (state.day >= 4) t = 2;
  if (state.day >= 10) t = 3;
  if (state.day >= 20) t = 4;
  if (state.discovered.includes('castle') || state.discovered.includes('mystic_crystal')) t = Math.max(t, 4);
  if (state.unlockedEventTags.includes('trade_route')) t = Math.max(t, 4);
  if (state.unlockedEventTags.includes('master_merchant')) t = 5;
  return Math.min(5, Math.max(1, t));
}
