import type { GameState } from '../types';
import { createFreshGameState } from '../rules/initialState';
import { tryLoadPersistedState } from './storage';

export function buildInitialGameState(): GameState {
  const saved = tryLoadPersistedState();
  if (saved) {
    return { ...saved, lastSynthesis: null };
  }
  return createFreshGameState();
}
