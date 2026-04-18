import React from 'react';
import { createPortal } from 'react-dom';
import { useGame, useDispatch } from '../state/gameStore';

export function MorningBanner() {
  const { state } = useGame();
  const { dismissMorningSummary } = useDispatch();
  const text = state.lastMorningSummary;
  if (!text) return null;

  return createPortal(
    <div className="day-announce-layer" role="presentation">
      <div className="day-announce-backdrop" aria-hidden="true" />
      <div
        className="day-announce"
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-announce-title"
      >
        <p className="day-announce__text" id="day-announce-title">
          {text}
        </p>
        <button
          type="button"
          className="day-announce__btn"
          onClick={dismissMorningSummary}
          aria-label="知道了，关闭今日播报"
        >
          知道了
        </button>
      </div>
    </div>,
    document.body,
  );
}
