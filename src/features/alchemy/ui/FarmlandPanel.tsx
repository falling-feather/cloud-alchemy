import React from 'react';
import { useGame, useDispatch } from '../state/gameStore';
import { FARMLAND_UNLOCK_EARTH_COST, CROP_GROW_DAYS } from '@/game/systems/farmland';

export function FarmlandPanel() {
  const { state } = useGame();
  const { unlockFarmland, plantPlot, harvestPlot } = useDispatch();
  const { farmland } = state;

  const earthCount = state.inventory
    .filter(s => s.itemType === 'earth')
    .reduce((n, s) => n + s.amount, 0);
  const seedCount = state.inventory
    .filter(s => s.itemType === 'seed')
    .reduce((n, s) => n + s.amount, 0);

  return (
    <div className="farmland-panel">
      <div className="farmland-panel__header">
        <span className="farmland-panel__title">🌾 田地</span>
        {!farmland.unlocked && (
          <button
            type="button"
            className="farmland-panel__unlock"
            disabled={earthCount < FARMLAND_UNLOCK_EARTH_COST}
            onClick={unlockFarmland}
            title={`需要泥土 ×${FARMLAND_UNLOCK_EARTH_COST}`}
          >
            开垦（泥土×{FARMLAND_UNLOCK_EARTH_COST}）
          </button>
        )}
      </div>

      {!farmland.unlocked ? (
        <p className="farmland-panel__hint">开垦后可种植种子，{CROP_GROW_DAYS} 天后收获药草。</p>
      ) : (
        <div className="farmland-plots">
          {farmland.plots.map((plot, idx) => (
            <div key={idx} className="farmland-plot">
              <div className="farmland-plot__label">田块 {idx + 1}</div>
              {plot.crop === null ? (
                <button
                  type="button"
                  className="farmland-plot__btn"
                  disabled={seedCount < 1}
                  onClick={() => plantPlot(idx)}
                >
                  种植（种子×1）
                </button>
              ) : (
                <div className="farmland-plot__grow">
                  <span>生长中…</span>
                  {state.day >= (plot.harvestOnDay ?? 999) ? (
                    <button
                      type="button"
                      className="farmland-plot__btn farmland-plot__btn--harvest"
                      onClick={() => harvestPlot(idx)}
                    >
                      收获药草
                    </button>
                  ) : (
                    <span className="farmland-plot__eta">
                      第 {plot.harvestOnDay} 天可收
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="farmland-panel__meta">
        拥有泥土 {earthCount} · 种子 {seedCount}
      </p>
    </div>
  );
}
