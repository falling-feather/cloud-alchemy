import React from 'react';
import { useGame, useDispatch } from '../store/gameStore';
import { ITEMS } from '../data/items';
import { ItemBubble } from './ItemBubble';

export function MerchantPanel() {
  const { state } = useGame();
  const { acceptTrade, nextDay } = useDispatch();

  const getPlayerTotal = (itemType: string) =>
    state.inventory
      .filter(s => s.itemType === itemType)
      .reduce((sum, s) => sum + s.amount, 0);

  const canAfford = (itemType: string, amount: number) =>
    getPlayerTotal(itemType) >= amount;

  return (
    <div className="merchant-panel">
      <div className="merchant-header">
        <span className="merchant-title">🧙 流浪商人</span>
        <span className="merchant-day">第 {state.day} 天</span>
      </div>
      <p className="merchant-subtitle">今日特供（合适就换吧~）</p>

      {state.merchantOffers.length === 0 ? (
        <p className="merchant-empty">今日已无库存，明天再来~</p>
      ) : (
        <div className="merchant-offers">
          {state.merchantOffers.map(offer => {
            const affordable = canAfford(offer.give.itemType, offer.give.amount);
            const giveItem = ITEMS[offer.give.itemType];
            const receiveItem = ITEMS[offer.receive.itemType];
            if (!giveItem || !receiveItem) return null;
            const isNew = !state.discovered.includes(offer.receive.itemType);

            return (
              <div
                key={offer.id}
                className={`trade-offer ${affordable ? '' : 'trade-offer--unaffordable'}`}
              >
                <div className="trade-give">
                  <span className="trade-label">给出</span>
                  <div className="trade-item-row">
                    <div className="trade-bubble-wrapper">
                      <ItemBubble itemType={offer.give.itemType} amount={offer.give.amount} />
                    </div>
                    <span className="trade-amount">×{offer.give.amount}</span>
                  </div>
                  <span className="trade-have">
                    (拥有: {getPlayerTotal(offer.give.itemType)})
                  </span>
                </div>
                <span className="trade-arrow">⇄</span>
                <div className="trade-receive">
                  <span className="trade-label">获得</span>
                  <div className="trade-item-row">
                    {isNew ? (
                      <div
                        className="item-bubble item-bubble--mystery"
                        title="神秘物品"
                      >
                        <span className="item-bubble__emoji">❓</span>
                        <span className="item-bubble__name">???</span>
                      </div>
                    ) : (
                      <div className="trade-bubble-wrapper">
                        <ItemBubble itemType={offer.receive.itemType} amount={offer.receive.amount} />
                      </div>
                    )}
                    <span className="trade-amount">×{offer.receive.amount}</span>
                  </div>
                  {isNew && <span className="trade-new-badge">新发现!</span>}
                </div>
                <button
                  className={`trade-btn ${affordable ? 'trade-btn--active' : 'trade-btn--disabled'}`}
                  onClick={() => affordable && acceptTrade(offer.id)}
                  disabled={!affordable}
                >
                  {affordable ? '交换' : '不够'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <button className="next-day-btn" onClick={nextDay}>
        ☀️ 下一天
      </button>
    </div>
  );
}
