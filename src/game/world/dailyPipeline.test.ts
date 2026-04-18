import { describe, it, expect } from 'vitest';
import { applyNextDay } from './dailyPipeline';
import { createFreshGameState } from '../rules/initialState';

describe('applyNextDay', () => {
  it('increments day and refreshes merchant offers', () => {
    const s = createFreshGameState();
    const next = applyNextDay(s);
    expect(next.day).toBe(2);
    expect(next.merchantOffers.length).toBeGreaterThan(0);
  });

  it('grants rain bonus water when weather is rain', () => {
    const s = {
      ...createFreshGameState(),
      runSeed: 100,
    };
    let found = false;
    for (let i = 0; i < 80; i++) {
      const t = { ...s, runSeed: (s.runSeed + i * 1337) >>> 0 };
      const next = applyNextDay(t);
      if (next.weather === 'rain') {
        const w = next.inventory
          .filter(x => x.itemType === 'water')
          .reduce((a, x) => a + x.amount, 0);
        expect(w).toBeGreaterThanOrEqual(3 + 3);
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });
});
