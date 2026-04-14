import React from 'react';
import { ITEMS } from '../data/items';

interface ItemBubbleProps {
  itemType: string;
  amount: number;
  dragging?: boolean;
  animating?: boolean;
}

export function ItemBubble({ itemType, amount, dragging, animating }: ItemBubbleProps) {
  const item = ITEMS[itemType];
  if (!item) return null;

  return (
    <div
      className={`item-bubble ${dragging ? 'item-bubble--dragging' : ''} ${animating ? 'item-bubble--pop' : ''}`}
      style={{ backgroundColor: item.bubbleColor, borderColor: item.borderColor }}
      title={`${item.name} — ${item.description}`}
    >
      <span className="item-bubble__emoji">{item.emoji}</span>
      <span className="item-bubble__name">{item.name}</span>
      {amount > 1 && (
        <span className="item-bubble__amount">{amount}</span>
      )}
    </div>
  );
}
