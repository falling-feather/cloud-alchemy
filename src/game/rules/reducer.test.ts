import { describe, it, expect } from 'vitest';
import { gameReducer } from './reducer';
import { createFreshGameState } from './initialState';

describe('gameReducer', () => {
  it('RESET_GAME restores initial progression', () => {
    const s = createFreshGameState();
    const mid = { ...s, day: 42, discovered: [...s.discovered, 'clay'] };
    const next = gameReducer(mid, { type: 'RESET_GAME' });
    expect(next.day).toBe(1);
    expect(next.discovered).toEqual(['water', 'earth', 'fire', 'air', 'wood']);
    expect(next.discoveredRecipes).toEqual([]);
    expect(next.lastSynthesis).toBeNull();
  });

  it('CLEAR_SYNTHESIS clears last synthesis only', () => {
    const s = createFreshGameState();
    const withFx = {
      ...s,
      lastSynthesis: { slotId: 0, itemType: 'clay', isNew: true },
    };
    const next = gameReducer(withFx, { type: 'CLEAR_SYNTHESIS' });
    expect(next.lastSynthesis).toBeNull();
    expect(next.day).toBe(withFx.day);
  });
});
