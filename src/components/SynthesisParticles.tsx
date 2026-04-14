import React, { useEffect, useState } from 'react';
import { ITEMS } from '../data/items';

interface Particle {
  id: number;
  angle: number;
  distance: number;
  color: string;
}

interface SynthesisParticlesProps {
  itemType: string;
  onDone: () => void;
}

export function SynthesisParticles({ itemType, onDone }: SynthesisParticlesProps) {
  const [particles] = useState<Particle[]>(() => {
    const item = ITEMS[itemType];
    const color = item?.borderColor ?? '#F9A8D4';
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      angle: (360 / 10) * i,
      distance: 40 + Math.random() * 20,
      color,
    }));
  });

  useEffect(() => {
    const timer = setTimeout(onDone, 700);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="synthesis-particles" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            '--angle': `${p.angle}deg`,
            '--dist': `${p.distance}px`,
            backgroundColor: p.color,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
