import React from 'react';
import { useGame } from '../state/gameStore';
import { milestoneProgress } from '@/game/rules/goals';

export function GoalsPanel() {
  const { state } = useGame();
  const rows = milestoneProgress(state);
  const doneCount = rows.filter(r => r.done).length;

  return (
    <div className="goals-panel">
      <div className="goals-header">
        <span className="goals-title">🎯 探索目标</span>
        <span className="goals-progress">{doneCount}/{rows.length}</span>
      </div>
      <ul className="goals-list">
        {rows.map(({ goal, done }) => (
          <li key={goal.id} className={`goals-item ${done ? 'goals-item--done' : ''}`}>
            <span className="goals-check" aria-hidden="true">{done ? '✓' : '○'}</span>
            <span className="goals-label">{goal.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
