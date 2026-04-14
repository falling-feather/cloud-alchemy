import React, { useState } from 'react';
import { useGame } from '../store/gameStore';
import { ITEMS, ITEM_LIST } from '../data/items';
import { RECIPES } from '../data/recipes';

type Tab = 'items' | 'recipes';

const RARITY_LABEL: Record<string, string> = {
  basic: '基础',
  common: '普通',
  uncommon: '罕见',
  rare: '稀有',
  legendary: '传说',
};

export function CodexPanel() {
  const { state } = useGame();
  const [tab, setTab] = useState<Tab>('items');
  const discoveredSet = new Set(state.discovered);
  const discoveredRecipeSet = new Set(state.discoveredRecipes);

  const totalItems = ITEM_LIST.length;
  const discoveredCount = state.discovered.length;
  const totalRecipes = Object.keys(RECIPES).length;
  const discoveredRecipes = state.discoveredRecipes.length;

  return (
    <div className="codex-panel">
      <div className="codex-header">
        <span className="codex-title">📖 图鉴</span>
        <span className="codex-progress">
          {discoveredCount}/{totalItems} 物品 · {discoveredRecipes}/{totalRecipes} 配方
        </span>
      </div>

      <div className="codex-tabs">
        <button
          className={`codex-tab ${tab === 'items' ? 'codex-tab--active' : ''}`}
          onClick={() => setTab('items')}
        >物品</button>
        <button
          className={`codex-tab ${tab === 'recipes' ? 'codex-tab--active' : ''}`}
          onClick={() => setTab('recipes')}
        >配方</button>
      </div>

      {tab === 'items' && (
        <div className="codex-items">
          {ITEM_LIST.map(item => {
            const found = discoveredSet.has(item.id);
            return (
              <div
                key={item.id}
                className={`codex-item ${found ? 'codex-item--found' : 'codex-item--hidden'}`}
                style={found ? { backgroundColor: item.bubbleColor, borderColor: item.borderColor } : {}}
                title={found ? item.description : '尚未发现'}
              >
                <span className="codex-item-emoji">{found ? item.emoji : '❓'}</span>
                <span className="codex-item-name">{found ? item.name : '???'}</span>
                {found && (
                  <span className="codex-item-rarity">{RARITY_LABEL[item.rarity]}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'recipes' && (
        <div className="codex-recipes">
          {Object.entries(RECIPES).map(([key, result]) => {
            const [a, b] = key.split('+');
            const found = discoveredRecipeSet.has(key);
            const itemA = ITEMS[a];
            const itemB = ITEMS[b];
            const itemR = ITEMS[result];
            return (
              <div
                key={key}
                className={`codex-recipe ${found ? 'codex-recipe--found' : 'codex-recipe--hidden'}`}
              >
                {found ? (
                  <>
                    <span className="recipe-ingredient">{itemA?.emoji} {itemA?.name}</span>
                    <span className="recipe-plus">+</span>
                    <span className="recipe-ingredient">{itemB?.emoji} {itemB?.name}</span>
                    <span className="recipe-arrow">→</span>
                    <span className="recipe-result">{itemR?.emoji} {itemR?.name}</span>
                  </>
                ) : (
                  <span className="recipe-unknown">❓ + ❓ → ???</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
