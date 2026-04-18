/** 商人报价生成参数（调难度时改这里即可） */
export const MERCHANT_CONFIG = {
  /** 每日最多几条报价 */
  maxOffers: 3,
  /** 未发现物品在 receive 池中的重复权重（越大越容易刷到未收集） */
  undiscoveredPoolWeight: 3,
  /** 生成报价时的最大尝试次数，防止死循环 */
  maxGenerationAttempts: 10,
} as const;

export type MerchantConfig = typeof MERCHANT_CONFIG;
