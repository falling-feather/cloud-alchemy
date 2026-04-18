import type { InventorySlot, TradeOffer } from '../types';
import { ITEMS } from '../content/items';
import { MERCHANT_CONFIG } from './merchantConfig';

export function generateMerchantOffers(
  inventory: InventorySlot[],
  discovered: string[],
  config: MerchantConfigShape = MERCHANT_CONFIG,
  merchantTier = 1,
): TradeOffer[] {
  const discoveredSet = new Set(discovered);
  const allItemIds = Object.keys(ITEMS);
  const basicIds = allItemIds.filter(id => ITEMS[id].rarity === 'basic');

  const playerItems = inventory
    .filter(s => s.itemType && s.amount > 0)
    .map(s => ({ itemType: s.itemType as string, amount: s.amount }));
  const playerHas = new Set(playerItems.map(p => p.itemType));

  const rarityPrice: Record<string, number> = {
    basic: 2, common: 3, uncommon: 4, rare: 5, legendary: 7,
  };

  const undiscovered = allItemIds.filter(id => !discoveredSet.has(id));
  const discPool = allItemIds.filter(id => discoveredSet.has(id));
  const weightedUndiscovered = Array.from({ length: config.undiscoveredPoolWeight }, () => undiscovered).flat();
  let receivePool = [...weightedUndiscovered, ...discPool];

  if (merchantTier >= 3) {
    const midRare = allItemIds.filter(id => {
      const rr = ITEMS[id]?.rarity;
      return rr === 'uncommon' || rr === 'rare';
    });
    receivePool = [...receivePool, ...midRare, ...midRare];
  }
  if (merchantTier >= 5) {
    const leg = allItemIds.filter(id => ITEMS[id]?.rarity === 'legendary');
    receivePool = [...receivePool, ...leg, ...leg, ...leg];
  }

  const offers: TradeOffer[] = [];
  const usedReceive = new Set<string>();

  const basicReceive = basicIds.filter(id => !usedReceive.has(id));
  if (basicReceive.length > 0 && offers.length < config.maxOffers) {
    const receiveItem = basicReceive[Math.floor(Math.random() * basicReceive.length)];
    usedReceive.add(receiveItem);
    const giveOptions = playerItems.filter(p => p.itemType !== receiveItem && p.amount >= 2);
    const giveItem = giveOptions.length > 0
      ? giveOptions[Math.floor(Math.random() * giveOptions.length)].itemType
      : basicIds[Math.floor(Math.random() * basicIds.length)];
    offers.push({
      id: `offer-${Date.now()}-0`,
      give: { itemType: giveItem, amount: 2 },
      receive: { itemType: receiveItem, amount: 2 },
    });
  }

  for (let i = 1; offers.length < config.maxOffers; i++) {
    if (i > config.maxGenerationAttempts) break;
    const available = receivePool.filter(id => !usedReceive.has(id));
    if (available.length === 0) break;

    const receiveItem = available[Math.floor(Math.random() * available.length)];
    usedReceive.add(receiveItem);
    const rarity = ITEMS[receiveItem]?.rarity ?? 'basic';
    const giveAmount = rarityPrice[rarity] ?? 3;

    const giveOptions = playerItems.filter(
      p => p.itemType !== receiveItem && p.amount >= giveAmount,
    );
    let giveItem: string;
    if (giveOptions.length > 0) {
      giveItem = giveOptions[Math.floor(Math.random() * giveOptions.length)].itemType;
    } else if (playerHas.size > 0) {
      const arr = [...playerHas].filter(id => id !== receiveItem);
      giveItem = arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : basicIds[0];
    } else {
      giveItem = basicIds[Math.floor(Math.random() * basicIds.length)];
    }

    offers.push({
      id: `offer-${Date.now()}-${i}`,
      give: { itemType: giveItem, amount: giveAmount },
      receive: { itemType: receiveItem, amount: 1 },
    });
  }

  return offers;
}

type MerchantConfigShape = {
  maxOffers: number;
  undiscoveredPoolWeight: number;
  maxGenerationAttempts: number;
};
