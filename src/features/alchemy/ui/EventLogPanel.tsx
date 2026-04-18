import React from 'react';
import { useGame } from '../state/gameStore';

export function EventLogPanel() {
  const { state } = useGame();
  const entries = state.eventLog.slice(0, 12);

  if (entries.length === 0) {
    return (
      <div className="event-log">
        <div className="event-log__header">📜 事件日志</div>
        <p className="event-log__empty">过一天后，每日天气与随机事件会记在这里。</p>
      </div>
    );
  }

  return (
    <div className="event-log">
      <div className="event-log__header">📜 事件日志</div>
      <ul className="event-log__list">
        {entries.map((e, i) => (
          <li key={`${e.day}-${i}-${e.message.slice(0, 8)}`} className="event-log__item">
            <span className="event-log__day">第{e.day}天</span>
            <span className="event-log__msg">{e.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
