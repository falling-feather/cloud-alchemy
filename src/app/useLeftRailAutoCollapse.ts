import { type RefObject, useLayoutEffect, useState } from 'react';

/** 中央区域可放的「正方形边长」过小时收起左侧栏，略大时再展开（滞回，减少抖动） */
const COLLAPSE_BELOW = 220;
const EXPAND_ABOVE = 290;
const HEADING_RESERVE_PX = 96;

export function useLeftRailAutoCollapse(
  centerRef: RefObject<HTMLElement | null>,
): boolean {
  const [collapsed, setCollapsed] = useState(false);

  useLayoutEffect(() => {
    const el = centerRef.current;
    if (!el) return;

    const run = () => {
      const r = el.getBoundingClientRect();
      const availH = Math.max(0, r.height - HEADING_RESERVE_PX);
      const side = Math.min(r.width, availH);
      setCollapsed(prev => {
        if (!prev && side < COLLAPSE_BELOW) return true;
        if (prev && side > EXPAND_ABOVE) return false;
        return prev;
      });
    };

    const ro = new ResizeObserver(run);
    ro.observe(el);
    run();
    return () => ro.disconnect();
  }, []);

  return collapsed;
}
