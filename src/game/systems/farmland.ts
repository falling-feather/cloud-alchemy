import type { FarmlandState, GameState } from '../types';
import { grantItems, takeItems } from './inventoryOps';

export const FARMLAND_PLOT_COUNT = 3;
export const FARMLAND_UNLOCK_EARTH_COST = 3;
export const CROP_GROW_DAYS = 2;

export function createInitialFarmland(): FarmlandState {
  return {
    unlocked: false,
    plots: Array.from({ length: FARMLAND_PLOT_COUNT }, () => ({
      crop: null,
      harvestOnDay: null,
    })),
  };
}

export function tryUnlockFarmland(state: GameState): GameState | null {
  if (state.farmland.unlocked) return null;
  const took = takeItems(state.inventory, 'earth', FARMLAND_UNLOCK_EARTH_COST);
  if (!took) return null;
  return {
    ...state,
    inventory: took.inventory,
    farmland: { ...state.farmland, unlocked: true },
    tutorial: { ...state.tutorial, seen_farmland: true },
    eventLog: [
      { day: state.day, message: `消耗泥土 ×${FARMLAND_UNLOCK_EARTH_COST}，开垦了田地！` },
      ...state.eventLog,
    ].slice(0, 40),
  };
}

export function tryPlantPlot(state: GameState, plotIndex: number): GameState | null {
  if (!state.farmland.unlocked) return null;
  const plot = state.farmland.plots[plotIndex];
  if (!plot || plot.crop !== null) return null;
  const took = takeItems(state.inventory, 'seed', 1);
  if (!took) return null;
  const plots = state.farmland.plots.map((p, i) =>
    i === plotIndex
      ? { crop: 'field_crop', harvestOnDay: state.day + CROP_GROW_DAYS }
      : p,
  );
  return {
    ...state,
    inventory: took.inventory,
    farmland: { ...state.farmland, plots },
    tutorial: { ...state.tutorial, planted_once: true },
  };
}

export function tryHarvestPlot(state: GameState, plotIndex: number): GameState | null {
  if (!state.farmland.unlocked) return null;
  const plot = state.farmland.plots[plotIndex];
  if (!plot?.crop || plot.harvestOnDay === null) return null;
  if (state.day < plot.harvestOnDay) return null;

  const plots = state.farmland.plots.map((p, i) =>
    i === plotIndex ? { crop: null, harvestOnDay: null } : p,
  );
  const { inventory, granted } = grantItems(state.inventory, 'herb', 2);
  const disc = new Set(state.discovered);
  disc.add('herb');

  return {
    ...state,
    inventory,
    discovered: [...disc],
    farmland: { ...state.farmland, plots },
    eventLog: [
      { day: state.day, message: `田地收获了药草 ×${granted}` },
      ...state.eventLog,
    ].slice(0, 40),
  };
}
