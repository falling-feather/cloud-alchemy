import type { WeatherId } from '../types';

/** 确定性：由 runSeed 推导明日天气 */
export function rollNextWeather(runSeed: number): { weather: WeatherId; nextSeed: number } {
  const nextSeed = lcgNext(runSeed);
  const r = nextSeed % 100;
  if (r < 32) return { weather: 'rain', nextSeed };
  if (r < 55) return { weather: 'sunny', nextSeed };
  if (r < 72) return { weather: 'windy', nextSeed };
  return { weather: 'foggy', nextSeed };
}

export function weatherLabel(w: WeatherId): string {
  switch (w) {
    case 'rain': return '雨天';
    case 'sunny': return '晴天';
    case 'windy': return '大风';
    case 'foggy': return '大雾';
    default: return w;
  }
}

function lcgNext(seed: number): number {
  return (Math.imul(seed, 1664525) + 1013904223) >>> 0;
}
