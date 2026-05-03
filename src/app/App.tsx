import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { GameProvider, useDispatch, useGame } from '@/features/alchemy/state/gameStore';
import { useLeftRailAutoCollapse } from '@/app/useLeftRailAutoCollapse';
import { ITEMS } from '@/game/content/items';
import { STARTER_ITEM_IDS } from '@/game/rules/inventory';
import { InventoryGrid } from '@/features/alchemy/ui/InventoryGrid';
import { MerchantPanel } from '@/features/alchemy/ui/MerchantPanel';
import { CodexPanel } from '@/features/alchemy/ui/CodexPanel';
import { GoalsPanel } from '@/features/alchemy/ui/GoalsPanel';
import { WorldBar } from '@/features/alchemy/ui/WorldBar';
import { EventLogPanel } from '@/features/alchemy/ui/EventLogPanel';
import { FarmlandPanel } from '@/features/alchemy/ui/FarmlandPanel';

type RightTab = 'merchant' | 'codex';

function GameHeaderActions() {
  const { resetGame } = useDispatch();

  const handleNewGame = () => {
    if (window.confirm('确定重新开始？当前背包与图鉴进度将恢复为初始状态。')) {
      resetGame();
    }
  };

  return (
    <div className="game-header__actions">
      <button type="button" className="new-game-btn" onClick={handleNewGame}>
        新游戏
      </button>
    </div>
  );
}

function HeaderTip() {
  const { state } = useGame();
  const tip = useMemo(() => {
    const discoveredCount = state.discovered.length;
    const affordableTrades = state.merchantOffers.filter(o =>
      state.inventory
        .filter(s => s.itemType === o.give.itemType)
        .reduce((n, s) => n + s.amount, 0) >= o.give.amount,
    ).length;
    if (discoveredCount <= 5) {
      return '💡 试着把 💧 拖到 🌍 上 — 看看会变出什么。';
    }
    if (!state.farmland.unlocked && state.inventory.some(s => s.itemType === 'earth')) {
      return '🌾 攒满 3 块泥土，就能在右侧开垦田地，种出药草。';
    }
    if (affordableTrades > 0) {
      return `🧙 商人今天有 ${affordableTrades} 桩你能负担的交易，去看看吧。`;
    }
    if (discoveredCount < 12) {
      return '📖 把已发现的物品两两组合，会解锁更多配方。';
    }
    return '☀️ 点「下一天」让作物长大，并刷新商人报价。';
  }, [state.discovered, state.merchantOffers, state.inventory, state.farmland.unlocked]);

  return <p className="game-tip">{tip}</p>;
}

function SynthesisToastBridge() {
  const { state } = useGame();
  const lastSeenRef = useRef<string | null>(null);
  useEffect(() => {
    const ev = state.lastSynthesis;
    if (!ev) return;
    const key = `${ev.slotId}:${ev.itemType}:${ev.isNew ? 'n' : 'o'}`;
    if (lastSeenRef.current === key) return;
    lastSeenRef.current = key;
    const item = ITEMS[ev.itemType];
    if (!item) return;
    if (ev.isNew) {
      toast.success(`新发现：${item.emoji} ${item.name}`, {
        description: item.description,
        duration: 3200,
      });
    } else {
      toast(`合成成功：${item.emoji} ${item.name}`, {
        duration: 1600,
      });
    }
  }, [state.lastSynthesis]);
  return null;
}

function MorningToastBridge() {
  const { state } = useGame();
  const { dismissMorningSummary } = useDispatch();
  const lastDayRef = useRef<number | null>(null);
  useEffect(() => {
    if (!state.lastMorningSummary) return;
    if (lastDayRef.current === state.day) return;
    lastDayRef.current = state.day;

    const todayEvents = state.eventLog
      .filter(e => e.day === state.day && !e.message.startsWith('天气：'))
      .map(e => `· ${e.message}`);
    const harvestable = state.farmland.unlocked
      ? state.farmland.plots.filter(
          p => p.crop && p.harvestOnDay !== null && state.day >= p.harvestOnDay,
        ).length
      : 0;
    const lines: string[] = [...todayEvents];
    if (harvestable > 0) lines.push(`🌾 田地有 ${harvestable} 块药草可收获`);

    toast(`🌅 ${state.lastMorningSummary}`, {
      description: lines.length > 0 ? lines.join('\n') : '今天是安静的一天。',
      duration: 3200,
    });
    dismissMorningSummary();
  }, [state.lastMorningSummary, state.day]);
  return null;
}

function InventoryStage() {
  const { state } = useGame();
  const isEmptyTutorial =
    state.discovered.length <= STARTER_ITEM_IDS.length &&
    !state.lastSynthesis;
  return (
    <div className={`inventory-grid-wrap${isEmptyTutorial ? ' inventory-grid-wrap--tutorial' : ''}`}>
      <div className="inventory-square">
        <InventoryGrid />
        {isEmptyTutorial && (
          <div className="inventory-tutorial-hint" aria-hidden="true">
            <span className="inventory-tutorial-hint__line">把任意两个物品拖到一起</span>
            <span className="inventory-tutorial-hint__sub">先试试 💧 + 🌍</span>
          </div>
        )}
      </div>
    </div>
  );
}

function LeftRailPanels() {
  return (
    <>
      <GoalsPanel />
      <EventLogPanel />
    </>
  );
}

function GameLayout() {
  const [rightTab, setRightTab] = useState<RightTab>('merchant');
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const centerRef = useRef<HTMLElement>(null);
  const leftCollapsed = useLeftRailAutoCollapse(centerRef);

  useEffect(() => {
    if (!leftCollapsed) setLeftDrawerOpen(false);
  }, [leftCollapsed]);

  useEffect(() => {
    if (!leftDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLeftDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [leftDrawerOpen]);

  return (
    <div className="game-root">
      <header className="game-header">
        <div className="game-header__brand">
          <span className="game-title">☁️ 云端炼金</span>
          <span className="game-subtitle">拖拽合成 · 探索配方</span>
        </div>
        <WorldBar />
        <HeaderTip />
        <GameHeaderActions />
      </header>

      <main className="game-main">
        {!leftCollapsed && (
          <section className="game-left-rail" aria-label="目标与事件">
            <LeftRailPanels />
          </section>
        )}

        {leftCollapsed && (
          <>
            <button
              type="button"
              className={`left-rail-fab${leftDrawerOpen ? ' left-rail-fab--hidden' : ''}`}
              onClick={() => setLeftDrawerOpen(true)}
              aria-label="打开目标与事件"
            >
              🎯
            </button>
            {leftDrawerOpen && (
              <div className="left-rail-drawer-root">
                <button
                  type="button"
                  className="left-rail-drawer-backdrop"
                  aria-label="关闭侧栏"
                  onClick={() => setLeftDrawerOpen(false)}
                />
                <aside
                  className="game-left-rail game-left-rail--drawer"
                  aria-label="目标与事件"
                >
                  <div className="game-left-rail__drawer-head">
                    <span className="game-left-rail__drawer-title">目标与事件</span>
                    <button
                      type="button"
                      className="game-left-rail__drawer-close"
                      onClick={() => setLeftDrawerOpen(false)}
                      aria-label="关闭"
                    >
                      ✕
                    </button>
                  </div>
                  <LeftRailPanels />
                </aside>
              </div>
            )}
          </>
        )}

        <section ref={centerRef} className="game-center" aria-label="云端背包">
          <div className="cloud-stage">
            <div className="cloud-stage__heading">
              <h2 className="cloud-stage__title">☁️ 云端背包</h2>
              <p className="cloud-stage__subtitle">6×6 格子 · 拖拽两格合成</p>
            </div>
            <InventoryStage />
          </div>
        </section>

        <aside className="game-right-rail" aria-label="田地与交易">
          <FarmlandPanel />
          <div className="right-panel-stack">
            <div className="right-tabs">
              <button
                type="button"
                className={`right-tab ${rightTab === 'merchant' ? 'right-tab--active' : ''}`}
                onClick={() => setRightTab('merchant')}
              >🧙 商人</button>
              <button
                type="button"
                className={`right-tab ${rightTab === 'codex' ? 'right-tab--active' : ''}`}
                onClick={() => setRightTab('codex')}
              >📖 图鉴</button>
            </div>
            <div className="right-content">
              {rightTab === 'merchant' ? <MerchantPanel /> : <CodexPanel />}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameLayout />
      <SynthesisToastBridge />
      <MorningToastBridge />
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{ className: 'alchemy-toast' }}
      />
    </GameProvider>
  );
}

export default App;
