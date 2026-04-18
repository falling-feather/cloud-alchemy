import React from 'react';
import { useGame } from '../state/gameStore';
import { weatherLabel } from '@/game/world/weather';

export function WorldBar() {
  const { state } = useGame();

  return (
    <div className="world-bar">
      <span className="world-bar__item">
        <strong>第 {state.day} 天</strong>
      </span>
      <span className="world-bar__sep" aria-hidden="true">|</span>
      <span className="world-bar__item" title="今日天气">
        {weatherLabel(state.weather)}
      </span>
      <span className="world-bar__sep" aria-hidden="true">|</span>
      <span className="world-bar__item" title="商人档位越高，货架越可能出现稀有物">
        商人档位 {state.merchantTier}
      </span>
    </div>
  );
}
