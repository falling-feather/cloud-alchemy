import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import type { GameState } from '@/game/types';
import { gameReducer, type GameAction } from '@/game/rules/reducer';
import { buildInitialGameState } from '@/game/persistence/hydrate';
import { persistGameState } from '@/game/persistence/storage';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, buildInitialGameState);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistGameState(state), 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}

export function useDispatch() {
  const { dispatch } = useGame();
  const dragDrop = useCallback(
    (fromSlot: number, toSlot: number) => dispatch({ type: 'DRAG_DROP', fromSlot, toSlot }),
    [dispatch],
  );
  const nextDay = useCallback(() => dispatch({ type: 'NEXT_DAY' }), [dispatch]);
  const acceptTrade = useCallback(
    (offerId: string) => dispatch({ type: 'ACCEPT_TRADE', offerId }),
    [dispatch],
  );
  const clearSynthesis = useCallback(() => dispatch({ type: 'CLEAR_SYNTHESIS' }), [dispatch]);
  const resetGame = useCallback(() => dispatch({ type: 'RESET_GAME' }), [dispatch]);
  const unlockFarmland = useCallback(() => dispatch({ type: 'UNLOCK_FARMLAND' }), [dispatch]);
  const plantPlot = useCallback(
    (plotIndex: number) => dispatch({ type: 'PLANT_PLOT', plotIndex }),
    [dispatch],
  );
  const harvestPlot = useCallback(
    (plotIndex: number) => dispatch({ type: 'HARVEST_PLOT', plotIndex }),
    [dispatch],
  );
  const dismissMorningSummary = useCallback(
    () => dispatch({ type: 'DISMISS_MORNING_SUMMARY' }),
    [dispatch],
  );
  return {
    dragDrop,
    nextDay,
    acceptTrade,
    clearSynthesis,
    resetGame,
    unlockFarmland,
    plantPlot,
    harvestPlot,
    dismissMorningSummary,
  };
}
