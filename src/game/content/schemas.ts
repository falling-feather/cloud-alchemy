import { z } from 'zod';

export const raritySchema = z.enum(['basic', 'common', 'uncommon', 'rare', 'legendary']);

export const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string(),
  description: z.string(),
  rarity: raritySchema,
  bubbleColor: z.string(),
  borderColor: z.string(),
});

export const inventorySlotSchema = z.object({
  slotId: z.number().int().nonnegative(),
  itemType: z.string().nullable(),
  amount: z.number().int().nonnegative(),
});

export const tradeOfferSchema = z.object({
  id: z.string(),
  give: z.object({ itemType: z.string(), amount: z.number().int().positive() }),
  receive: z.object({ itemType: z.string(), amount: z.number().int().positive() }),
});

export const synthesisEventSchema = z.object({
  slotId: z.number().int().nonnegative(),
  itemType: z.string(),
  isNew: z.boolean(),
});

export const persistedGameStateSchema = z.object({
  version: z.literal(1),
  inventory: z.union([
    z.array(inventorySlotSchema).length(30),
    z.array(inventorySlotSchema).length(36),
  ]),
  discovered: z.array(z.string()),
  discoveredRecipes: z.array(z.string()),
  day: z.number().int().positive(),
  merchantOffers: z.array(tradeOfferSchema),
});

export type PersistedGameStateV1 = z.infer<typeof persistedGameStateSchema>;

const farmlandSchema = z.object({
  unlocked: z.boolean(),
  plots: z.array(
    z.object({
      crop: z.string().nullable(),
      harvestOnDay: z.number().nullable(),
    }),
  ).length(3),
});

export const persistedGameStateSchemaV2 = z.object({
  version: z.literal(2),
  inventory: z.union([
    z.array(inventorySlotSchema).length(30),
    z.array(inventorySlotSchema).length(36),
  ]),
  discovered: z.array(z.string()),
  discoveredRecipes: z.array(z.string()),
  day: z.number().int().positive(),
  merchantOffers: z.array(tradeOfferSchema),
  weather: z.enum(['sunny', 'rain', 'windy', 'foggy']),
  merchantTier: z.number().int().min(1).max(5),
  runSeed: z.number().int().nonnegative(),
  completedOneShotEvents: z.array(z.string()),
  unlockedEventTags: z.array(z.string()),
  tutorial: z.record(z.string(), z.boolean()),
  farmland: farmlandSchema,
  eventLog: z.array(z.object({
    day: z.number().int().positive(),
    message: z.string(),
  })),
  lastMorningSummary: z.string().nullable(),
});

export type PersistedGameStateV2 = z.infer<typeof persistedGameStateSchemaV2>;
