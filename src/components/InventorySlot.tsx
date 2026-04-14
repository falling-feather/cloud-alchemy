import React, { useRef, useState, useCallback } from 'react';
import { InventorySlot as ISlot } from '../types/game';
import { ItemBubble } from './ItemBubble';
import { SynthesisParticles } from './SynthesisParticles';
import { useGame, useDispatch } from '../store/gameStore';

interface InventorySlotProps {
  slot: ISlot;
}

export function InventorySlotCell({ slot }: InventorySlotProps) {
  const { state } = useGame();
  const { dragDrop, clearSynthesis } = useDispatch();
  const [isDragOver, setIsDragOver] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const dragSrcRef = useRef<number | null>(null);

  const isSynthesisTarget = state.lastSynthesis?.slotId === slot.slotId;

  React.useEffect(() => {
    if (state.lastSynthesis?.slotId === slot.slotId && state.lastSynthesis !== null) {
      setShowParticles(true);
    }
  }, [state.lastSynthesis]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (!slot.itemType) return;
    dragSrcRef.current = slot.slotId;
    e.dataTransfer.setData('text/plain', String(slot.slotId));
    e.dataTransfer.effectAllowed = 'move';
  }, [slot]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const fromSlot = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(fromSlot) && fromSlot !== slot.slotId) {
      dragDrop(fromSlot, slot.slotId);
    }
  }, [slot.slotId, dragDrop]);

  const handleDragEnd = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleParticlesDone = useCallback(() => {
    setShowParticles(false);
    clearSynthesis();
  }, [clearSynthesis]);

  return (
    <div
      className={`inventory-slot ${isDragOver ? 'inventory-slot--dragover' : ''} ${isSynthesisTarget ? 'inventory-slot--synthesis' : ''}`}
      style={{ '--slot-id': slot.slotId } as React.CSSProperties}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {slot.itemType && (
        <div
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className="slot-draggable"
        >
          <ItemBubble
            itemType={slot.itemType}
            amount={slot.amount}
            animating={isSynthesisTarget}
          />
        </div>
      )}
      {showParticles && slot.itemType && (
        <SynthesisParticles
          itemType={slot.itemType}
          onDone={handleParticlesDone}
        />
      )}
    </div>
  );
}
