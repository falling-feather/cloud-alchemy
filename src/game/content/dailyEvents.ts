import type { WeatherId } from '../types';

export interface DailyEventDef {
  id: string;
  weight: number;
  minDay?: number;
  weather?: WeatherId;
  /** 需要已拥有全部标签 */
  requiresTags?: string[];
  oneShot?: boolean;
  message: string;
  /** 效果：给物品 */
  grant?: { itemId: string; amount: number };
  /** 解锁标签 */
  unlockTags?: string[];
}

export const DAILY_EVENTS: DailyEventDef[] = [
  {
    id: 'breeze_seeds',
    weight: 12,
    minDay: 2,
    message: '大风吹来了野种子：种子 +1',
    grant: { itemId: 'seed', amount: 1 },
  },
  {
    id: 'rain_puddle',
    weight: 10,
    weather: 'rain',
    minDay: 2,
    message: '雨洼里多舀到一点：水 +1',
    grant: { itemId: 'water', amount: 1 },
  },
  {
    id: 'traveling_note',
    weight: 6,
    minDay: 8,
    message: '旅人留下一张商路便签（解锁：商路）。',
    unlockTags: ['trade_route'],
    oneShot: true,
  },
  {
    id: 'lucky_clay',
    weight: 8,
    minDay: 4,
    message: '路边黏土块：黏土 +1',
    grant: { itemId: 'clay', amount: 1 },
  },
  {
    id: 'master_hint',
    weight: 2,
    minDay: 25,
    requiresTags: ['trade_route'],
    message: '老商人透露珍品渠道（解锁：大师）。',
    unlockTags: ['master_merchant'],
    oneShot: true,
  },
];
