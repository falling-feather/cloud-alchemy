import React, { useEffect, useRef, useState } from 'react';
import { GameProvider, useDispatch } from '@/features/alchemy/state/gameStore';
import { useLeftRailAutoCollapse } from '@/app/useLeftRailAutoCollapse';
import { InventoryGrid } from '@/features/alchemy/ui/InventoryGrid';
import { MerchantPanel } from '@/features/alchemy/ui/MerchantPanel';
import { CodexPanel } from '@/features/alchemy/ui/CodexPanel';
import { GoalsPanel } from '@/features/alchemy/ui/GoalsPanel';
import { WorldBar } from '@/features/alchemy/ui/WorldBar';
import { MorningBanner } from '@/features/alchemy/ui/MorningBanner';
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
        <p className="game-tip">将物品拖到另一物品上合成；泥土+种子得树苗，过夜成木材。开垦田地可种药草。</p>
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
            <div className="inventory-grid-wrap">
              <div className="inventory-square">
                <InventoryGrid />
              </div>
            </div>
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

      <MorningBanner />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameLayout />
    </GameProvider>
  );
}

export default App;
