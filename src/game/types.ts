export type Rarity = 'basic' | 'common' | 'uncommon' | 'rare' | 'legendary';

export type WeatherId = 'sunny' | 'rain' | 'windy' | 'foggy';

export interface Item {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: Rarity;
  bubbleColor: string;
  borderColor: string;
}

export interface InventorySlot {
  slotId: number;
  itemType: string | null;
  amount: number;
}

export interface TradeOffer {
  id: string;
  give: { itemType: string; amount: number };
  receive: { itemType: string; amount: number };
}

export interface SynthesisEvent {
  slotId: number;
  itemType: string;
  isNew: boolean;
}

export interface FarmlandPlot {
  /** null = 空田；种植中为作物 id；成熟后为同一 id 直到收获 */
  crop: string | null;
  /** 可收获日（含）：当前 day >= harvestOnDay 可收获 */
  harvestOnDay: number | null;
}

export interface FarmlandState {
  unlocked: boolean;
  plots: FarmlandPlot[];
}

export interface DayEventLogEntry {
  day: number;
  message: string;
}

/** 可序列化存档的游戏状态 */
export interface GameState {
  inventory: InventorySlot[];
  discovered: string[];
  discoveredRecipes: string[];
  day: number;
  merchantOffers: TradeOffer[];
  lastSynthesis: SynthesisEvent | null;
  /** 当前天气（过天后更新为「新的一天」的天气） */
  weather: WeatherId;
  /** 商人档位 1–5，影响收货池 */
  merchantTier: number;
  /** 线性同余随机种子，保证过天序列可复现 */
  runSeed: number;
  /** 已触发的单次事件 id（防重复） */
  completedOneShotEvents: string[];
  /** 解锁的事件标签（用于加权池） */
  unlockedEventTags: string[];
  /** 教程/引导标记 */
  tutorial: Record<string, boolean>;
  /** 田地 */
  farmland: FarmlandState;
  /** 最近事件日志（UI 展示） */
  eventLog: DayEventLogEntry[];
  /** 本日开局摘要（过天后由管线写入，UI 可读） */
  lastMorningSummary: string | null;
}
