import React from 'react';
import { useGame } from '../state/gameStore';
import { InventorySlotCell } from './InventorySlot';

export function InventoryGrid() {
  const { state } = useGame();

  return (
    <div className="inventory-grid">
      {state.inventory.map(slot => (
        <InventorySlotCell key={slot.slotId} slot={slot} />
      ))}
    </div>
  );
}
