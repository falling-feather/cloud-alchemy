import type { Item } from '../types';

export const ITEMS: Record<string, Item> = {
  // basic
  water: {
    id: 'water', name: '水', emoji: '💧', description: '清澈的水，万物之源',
    rarity: 'basic', bubbleColor: '#FEF3C7', borderColor: '#FCD34D',
  },
  earth: {
    id: 'earth', name: '泥土', emoji: '🌍', description: '肥沃的大地，孕育生命',
    rarity: 'basic', bubbleColor: '#FEF3C7', borderColor: '#FCD34D',
  },
  fire: {
    id: 'fire', name: '火焰', emoji: '🔥', description: '炽热的火焰，燃烧一切',
    rarity: 'basic', bubbleColor: '#FEF3C7', borderColor: '#FCD34D',
  },
  air: {
    id: 'air', name: '空气', emoji: '🌬️', description: '轻柔的空气，无处不在',
    rarity: 'basic', bubbleColor: '#FEF3C7', borderColor: '#FCD34D',
  },
  wood: {
    id: 'wood', name: '木材', emoji: '🪵', description: '坚实的木材，建造基础',
    rarity: 'basic', bubbleColor: '#FEF3C7', borderColor: '#FCD34D',
  },

  // common
  clay: {
    id: 'clay', name: '黏土', emoji: '🫙', description: '柔软的黏土，可以塑形',
    rarity: 'common', bubbleColor: '#D1FAE5', borderColor: '#6EE7B7',
  },
  sand: {
    id: 'sand', name: '沙子', emoji: '✨', description: '细腻的沙粒，随风而逝',
    rarity: 'common', bubbleColor: '#D1FAE5', borderColor: '#6EE7B7',
  },
  steam: {
    id: 'steam', name: '蒸汽', emoji: '♨️', description: '热腾腾的蒸汽，能量满满',
    rarity: 'common', bubbleColor: '#D1FAE5', borderColor: '#6EE7B7',
  },
  smoke: {
    id: 'smoke', name: '烟雾', emoji: '💨', description: '缥缈的烟雾，神秘莫测',
    rarity: 'common', bubbleColor: '#D1FAE5', borderColor: '#6EE7B7',
  },
  ash: {
    id: 'ash', name: '灰烬', emoji: '🌑', description: '燃烧后留下的灰烬',
    rarity: 'common', bubbleColor: '#D1FAE5', borderColor: '#6EE7B7',
  },
  seed: {
    id: 'seed', name: '种子', emoji: '🌱', description: '蕴含生机的小小种子',
    rarity: 'common', bubbleColor: '#D1FAE5', borderColor: '#6EE7B7',
  },
  sapling: {
    id: 'sapling', name: '树苗', emoji: '🌳', description: '埋在土里的小树苗，过夜后长成木材',
    rarity: 'common', bubbleColor: '#D1FAE5', borderColor: '#6EE7B7',
  },
  cloud: {
    id: 'cloud', name: '云朵', emoji: '☁️', description: '飘在天上的软绵绵云朵',
    rarity: 'common', bubbleColor: '#D1FAE5', borderColor: '#6EE7B7',
  },
  magma: {
    id: 'magma', name: '熔岩', emoji: '🌋', description: '大地与火焰交融的炽热熔岩',
    rarity: 'common', bubbleColor: '#D1FAE5', borderColor: '#6EE7B7',
  },
  herb: {
    id: 'herb', name: '药草', emoji: '🌾', description: '植物与空气孕育的清香药草',
    rarity: 'common', bubbleColor: '#D1FAE5', borderColor: '#6EE7B7',
  },

  // uncommon
  brick: {
    id: 'brick', name: '砖块', emoji: '🧱', description: '烧制而成的坚硬砖块',
    rarity: 'uncommon', bubbleColor: '#DBEAFE', borderColor: '#93C5FD',
  },
  glass: {
    id: 'glass', name: '玻璃', emoji: '🪟', description: '透明光滑的玻璃',
    rarity: 'uncommon', bubbleColor: '#DBEAFE', borderColor: '#93C5FD',
  },
  plant: {
    id: 'plant', name: '植物', emoji: '🌿', description: '郁郁葱葱的绿色植物',
    rarity: 'uncommon', bubbleColor: '#DBEAFE', borderColor: '#93C5FD',
  },
  fog: {
    id: 'fog', name: '雾', emoji: '🌫️', description: '朦胧迷离的雾气',
    rarity: 'uncommon', bubbleColor: '#DBEAFE', borderColor: '#93C5FD',
  },
  lightning: {
    id: 'lightning', name: '闪电', emoji: '⚡', description: '迅猛的闪电，力量惊人',
    rarity: 'uncommon', bubbleColor: '#DBEAFE', borderColor: '#93C5FD',
  },
  pottery: {
    id: 'pottery', name: '陶器', emoji: '🏺', description: '手工烧制的精美陶器',
    rarity: 'uncommon', bubbleColor: '#DBEAFE', borderColor: '#93C5FD',
  },
  ink: {
    id: 'ink', name: '墨水', emoji: '🖋️', description: '深邃的墨水，记录万物',
    rarity: 'uncommon', bubbleColor: '#DBEAFE', borderColor: '#93C5FD',
  },
  wind: {
    id: 'wind', name: '风', emoji: '🌀', description: '呼啸的狂风，无拘无束',
    rarity: 'uncommon', bubbleColor: '#DBEAFE', borderColor: '#93C5FD',
  },
  obsidian: {
    id: 'obsidian', name: '黑曜石', emoji: '🪨', description: '熔岩遇水淬炼出的锋利黑曜石',
    rarity: 'uncommon', bubbleColor: '#DBEAFE', borderColor: '#93C5FD',
  },

  // rare
  house: {
    id: 'house', name: '房屋', emoji: '🏠', description: '温暖的家园，遮风避雨',
    rarity: 'rare', bubbleColor: '#EDE9FE', borderColor: '#C4B5FD',
  },
  bubble: {
    id: 'bubble', name: '泡泡', emoji: '🫧', description: '晶莹剔透的气泡',
    rarity: 'rare', bubbleColor: '#EDE9FE', borderColor: '#C4B5FD',
  },
  charcoal: {
    id: 'charcoal', name: '木炭', emoji: '⬛', description: '高温炭化的纯净木炭',
    rarity: 'rare', bubbleColor: '#EDE9FE', borderColor: '#C4B5FD',
  },
  crystal: {
    id: 'crystal', name: '水晶', emoji: '💎', description: '纯净透明的天然水晶',
    rarity: 'rare', bubbleColor: '#EDE9FE', borderColor: '#C4B5FD',
  },
  storm: {
    id: 'storm', name: '风暴', emoji: '🌩️', description: '狂暴的风暴，雷电交加',
    rarity: 'rare', bubbleColor: '#EDE9FE', borderColor: '#C4B5FD',
  },
  scroll: {
    id: 'scroll', name: '卷轴', emoji: '📜', description: '墨水与木材记载的古老卷轴',
    rarity: 'rare', bubbleColor: '#EDE9FE', borderColor: '#C4B5FD',
  },

  // legendary
  castle: {
    id: 'castle', name: '城堡', emoji: '🏰', description: '宏伟壮观的古老城堡',
    rarity: 'legendary', bubbleColor: '#FCE7F3', borderColor: '#F9A8D4',
  },
  gem: {
    id: 'gem', name: '宝石', emoji: '💠', description: '璀璨夺目的珍贵宝石',
    rarity: 'legendary', bubbleColor: '#FCE7F3', borderColor: '#F9A8D4',
  },
  rainbow: {
    id: 'rainbow', name: '彩虹', emoji: '🌈', description: '雨后天空的七彩彩虹',
    rarity: 'legendary', bubbleColor: '#FCE7F3', borderColor: '#F9A8D4',
  },
  mystic_crystal: {
    id: 'mystic_crystal', name: '神秘结晶', emoji: '🔮', description: '蕴含神秘力量的结晶体',
    rarity: 'legendary', bubbleColor: '#FCE7F3', borderColor: '#F9A8D4',
  },
};

export const ITEM_LIST: Item[] = Object.values(ITEMS);
