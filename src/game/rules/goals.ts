import type { GameState } from '../types';

export interface MilestoneGoal {
  id: string;
  label: string;
  test: (s: GameState) => boolean;
}

/** 里程碑目标（由当前 GameState 推导完成与否） */
export const MILESTONE_GOALS: MilestoneGoal[] = [
  { id: 'cloud', label: '合成或获得「云朵」', test: s => s.discovered.includes('cloud') },
  { id: 'castle', label: '解锁「城堡」', test: s => s.discovered.includes('castle') },
  {
    id: 'legend',
    label: '获得任一传说物品（城堡 / 宝石 / 彩虹 / 神秘结晶）',
    test: s => ['castle', 'gem', 'rainbow', 'mystic_crystal'].some(id => s.discovered.includes(id)),
  },
  { id: 'mystic', label: '合成「神秘结晶」', test: s => s.discovered.includes('mystic_crystal') },
  {
    id: 'branch',
    label: '探索扩展分支：熔岩、药草、黑曜石或卷轴（任一）',
    test: s => ['magma', 'herb', 'obsidian', 'scroll'].some(id => s.discovered.includes(id)),
  },
];

export function milestoneProgress(state: GameState): { goal: MilestoneGoal; done: boolean }[] {
  return MILESTONE_GOALS.map(goal => ({ goal, done: goal.test(state) }));
}
