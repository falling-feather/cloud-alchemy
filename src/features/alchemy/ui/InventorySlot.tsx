import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { InventorySlot as ISlot } from '@/game/types';
import { ItemBubble } from './ItemBubble';
import { SynthesisParticles } from './SynthesisParticles';
import { useGame, useDispatch } from '../state/gameStore';

interface InventorySlotProps {
  slot: ISlot;
}

export function InventorySlotCell({ slot }: InventorySlotProps) {
  const { state } = useGame();
  const { dragDrop, clearSynthesis } = useDispatch();
  const [isDragOver, setIsDragOver] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const isSynthesisTarget = state.lastSynthesis?.slotId === slot.slotId;

  const synthesisFxKey = useMemo(() => {
    const ev = state.lastSynthesis;
    if (!ev || ev.slotId !== slot.slotId) return '';
    return `${ev.slotId}-${ev.itemType}-${ev.isNew}`;
  }, [state.lastSynthesis, slot.slotId]);

  useEffect(() => {
    if (!synthesisFxKey) return;
    setShowParticles(true);
  }, [synthesisFxKey]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (!slot.itemType) return;
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
