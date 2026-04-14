export type Rarity = 'basic' | 'common' | 'uncommon' | 'rare' | 'legendary';

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

export interface GameState {
  inventory: InventorySlot[];
  discovered: string[];
  discoveredRecipes: string[];
  day: number;
  merchantOffers: TradeOffer[];
  lastSynthesis: SynthesisEvent | null;
}
