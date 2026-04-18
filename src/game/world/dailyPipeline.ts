import type { GameState } from '../types';
import { generateMerchantOffers } from '../rules/merchant';
import { MERCHANT_CONFIG } from '../rules/merchantConfig';
import { computeMerchantTier } from '../progression/merchantTier';
import { rollNextWeather, weatherLabel } from './weather';
import { pickAndApplyRandomEvent } from './eventsRuntime';
import { applyRainWater, growSaplingsToWood } from '../systems/saplingGrowth';

export function applyNextDay(prev: GameState): GameState {
  let s: GameState = { ...prev, lastSynthesis: null };
  const newDay = s.day + 1;
  s = { ...s, day: newDay };

  const wr = rollNextWeather(s.runSeed);
  s = { ...s, weather: wr.weather, runSeed: wr.nextSeed };

  s = {
    ...s,
    eventLog: [{ day: newDay, message: `天气：${weatherLabel(s.weather)}` }, ...s.eventLog].slice(0, 40),
  };

  if (s.weather === 'rain') {
    s = applyRainWater(s, 3);
  }

  const hadSapling = prev.inventory.some(x => x.itemType === 'sapling');
  s = growSaplingsToWood(s);
  if (hadSapling) {
    s = {
      ...s,
      eventLog: [{ day: newDay, message: '树苗已长成木材' }, ...s.eventLog].slice(0, 40),
    };
  }

  const ev = pickAndApplyRandomEvent(s, s.runSeed);
  s = ev.state;
  s = { ...s, runSeed: ev.nextSeed };

  const tier = computeMerchantTier(s);
  s = { ...s, merchantTier: tier };

  s = {
    ...s,
    merchantOffers: generateMerchantOffers(
      s.inventory,
      s.discovered,
      MERCHANT_CONFIG,
      tier,
    ),
  };

  if (s.weather === 'rain' && !s.tutorial.seen_rain) {
    s = {
      ...s,
      tutorial: { ...s.tutorial, seen_rain: true },
    };
  }

  return {
    ...s,
    /** 仅「第 N 天 · 天气」，用于弹窗；其余细节在事件日志 */
    lastMorningSummary: `第 ${newDay} 天 · ${weatherLabel(s.weather)}`,
  };
}
