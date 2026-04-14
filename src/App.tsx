import React, { useState } from 'react';
import { GameProvider } from './store/gameStore';
import { InventoryGrid } from './components/InventoryGrid';
import { MerchantPanel } from './components/MerchantPanel';
import { CodexPanel } from './components/CodexPanel';

type RightTab = 'merchant' | 'codex';

function GameLayout() {
  const [rightTab, setRightTab] = useState<RightTab>('merchant');

  return (
    <div className="game-root">
      <header className="game-header">
        <div className="game-header__brand">
          <span className="game-title">☁️ 云端炼金</span>
          <span className="game-subtitle">拖拽合成 · 探索配方</span>
        </div>
        <p className="game-tip">将物品拖拽到另一个物品上，发现神奇配方！</p>
      </header>

      <main className="game-main">
        <section className="game-left">
          <h2 className="section-title">🎒 背包</h2>
          <InventoryGrid />
        </section>

        <aside className="game-right">
          <div className="right-tabs">
            <button
              className={`right-tab ${rightTab === 'merchant' ? 'right-tab--active' : ''}`}
              onClick={() => setRightTab('merchant')}
            >🧙 商人</button>
            <button
              className={`right-tab ${rightTab === 'codex' ? 'right-tab--active' : ''}`}
              onClick={() => setRightTab('codex')}
            >📖 图鉴</button>
          </div>
          <div className="right-content">
            {rightTab === 'merchant' ? <MerchantPanel /> : <CodexPanel />}
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
    </GameProvider>
  );
}

export default App;
