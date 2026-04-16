# 《云端炼金》开发者文档

> 项目代号：Cloud_Alchemy  
> 技术栈：React 19 + TypeScript + Vite + 纯 CSS（无 Tailwind 在游戏层）  
> 定位：网页端休闲拖拽合成、资源管理与随机交易游戏

---

## 目录

1. [项目架构概览](#1-项目架构概览)
2. [目录结构与文件分配](#2-目录结构与文件分配)
3. [核心数据结构](#3-核心数据结构)
4. [状态管理模块](#4-状态管理模块)
5. [数据层模块](#5-数据层模块)
6. [组件层模块](#6-组件层模块)
7. [样式层模块](#7-样式层模块)
8. [核心算法与逻辑](#8-核心算法与逻辑)
9. [开发环境搭建](#9-开发环境搭建)
10. [扩展指南](#10-扩展指南)

---

## 1. 项目架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx (根组件)                       │
│   ┌─────────────────────────────────────────────────────┐   │
│   │             GameProvider (React Context)             │   │
│   │  ┌──────────────────────────────────────────────┐   │   │
│   │  │                 GameLayout                    │   │   │
│   │  │  ┌──────────────┐   ┌───────────────────┐    │   │   │
│   │  │  │  InventoryGrid│   │  MerchantPanel /  │    │   │   │
│   │  │  │  (左侧背包)   │   │  CodexPanel (右栏) │    │   │   │
│   │  │  └──────────────┘   └───────────────────┘    │   │   │
│   │  └──────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 数据流向

```
用户交互（拖拽 / 点击）
        │
        ▼
  组件层 dispatch(Action)
        │
        ▼
  gameStore.tsx / reducer(state, action)
        │
        ▼
  新 GameState 通过 Context 广播
        │
        ▼
  所有订阅组件重新渲染
```

游戏逻辑完全集中在 `src/store/gameStore.tsx` 的 `reducer` 函数中，组件层只负责展示与触发动作，保持单向数据流。

---

## 2. 目录结构与文件分配

```
cloud-alchemy/
├── index.html                  # HTML 入口，设置标题与根节点
├── package.json                # 依赖声明与脚本
├── tsconfig.json               # TypeScript 编译配置
├── vite.config.ts              # Vite 构建配置
├── tailwind.config.js          # Tailwind 配置（UI 组件库用）
├── theme.json                  # Spark 主题令牌
│
└── src/
    ├── main.tsx                # React 应用入口，挂载 ErrorBoundary
    ├── main.css                # Tailwind 基础导入（UI 组件库层）
    ├── index.css               # ⭐ 游戏专属样式（所有游戏 CSS）
    ├── App.tsx                 # 根组件，组合 GameProvider + GameLayout
    ├── ErrorFallback.tsx       # 全局错误降级 UI
    ├── vite-end.d.ts           # Vite 环境类型声明
    │
    ├── types/
    │   └── game.ts             # ⭐ 所有游戏类型定义（TypeScript 接口）
    │
    ├── data/
    │   ├── items.ts            # ⭐ 物品字典 ITEMS + 物品列表 ITEM_LIST
    │   └── recipes.ts          # ⭐ 配方 DAG（RECIPES）+ 辅助函数
    │
    ├── store/
    │   └── gameStore.tsx       # ⭐ 全局状态管理（Context + useReducer）
    │
    ├── hooks/
    │   └── use-mobile.ts       # 响应式断点 Hook（媒体查询）
    │
    ├── components/
    │   ├── InventoryGrid.tsx   # ⭐ 背包网格容器
    │   ├── InventorySlot.tsx   # ⭐ 单个背包格子（拖拽逻辑 + 粒子触发）
    │   ├── ItemBubble.tsx      # ⭐ 物品气泡展示组件
    │   ├── SynthesisParticles.tsx  # ⭐ 合成粒子动画组件
    │   ├── MerchantPanel.tsx   # ⭐ 流浪商人面板（交易 + 下一天）
    │   ├── CodexPanel.tsx      # ⭐ 图鉴面板（物品/配方发现进度）
    │   └── ui/                 # shadcn/ui 基础 UI 组件（Alert、Button 等）
    │
    ├── lib/
    │   └── utils.ts            # cn() 工具函数（Tailwind class 合并）
    │
    └── styles/
        └── theme.css           # Tailwind + Radix Colors 令牌定义
```

> ⭐ 标记为游戏核心文件，修改时需格外注意

---

## 3. 核心数据结构

所有类型定义位于 `src/types/game.ts`。

### 3.1 物品稀有度枚举

```typescript
type Rarity = 'basic' | 'common' | 'uncommon' | 'rare' | 'legendary';
```

| 稀有度      | 中文   | 气泡背景色  | 边框色    |
|-------------|--------|------------|-----------|
| `basic`     | 基础   | `#FEF3C7`  | `#FCD34D` |
| `common`    | 普通   | `#D1FAE5`  | `#6EE7B7` |
| `uncommon`  | 罕见   | `#DBEAFE`  | `#93C5FD` |
| `rare`      | 稀有   | `#EDE9FE`  | `#C4B5FD` |
| `legendary` | 传说   | `#FCE7F3`  | `#F9A8D4` |

### 3.2 物品定义（Item）

```typescript
interface Item {
  id: string;           // 物品唯一 ID（与 ITEMS 字典键一致）
  name: string;         // 中文名称
  emoji: string;        // 展示 Emoji
  description: string;  // 悬停提示描述
  rarity: Rarity;       // 稀有度
  bubbleColor: string;  // 气泡背景 CSS 颜色
  borderColor: string;  // 气泡边框 CSS 颜色
}
```

### 3.3 背包格子（InventorySlot）

```typescript
interface InventorySlot {
  slotId: number;         // 格子索引（0 ~ SLOT_COUNT-1）
  itemType: string | null; // 物品 ID，空格子为 null
  amount: number;         // 数量（0 表示空）
}
```

背包采用**固定长度一维数组**（默认 30 格），映射到 6 列 CSS Grid。

### 3.4 交易报价（TradeOffer）

```typescript
interface TradeOffer {
  id: string;
  give: { itemType: string; amount: number };    // 玩家支付
  receive: { itemType: string; amount: number }; // 玩家获得
}
```

### 3.5 合成事件（SynthesisEvent）

```typescript
interface SynthesisEvent {
  slotId: number;   // 合成结果出现的格子
  itemType: string; // 合成出的物品 ID
  isNew: boolean;   // 是否首次发现（触发图鉴更新）
}
```

### 3.6 全局游戏状态（GameState）

```typescript
interface GameState {
  inventory: InventorySlot[];       // 背包数组（30 格）
  discovered: string[];             // 已发现物品 ID 列表
  discoveredRecipes: string[];      // 已发现配方键列表（如 "earth+water"）
  day: number;                      // 当前天数（从 1 开始）
  merchantOffers: TradeOffer[];     // 当天商人报价（最多 3 条）
  lastSynthesis: SynthesisEvent | null; // 最近一次合成结果（用于触发动画）
}
```

### 3.7 配方 DAG（Recipe DAG）

配方定义于 `src/data/recipes.ts`，使用哈希表表示有向无环图：

```typescript
const RECIPES: Record<string, string> = {
  'earth+water': 'clay',
  'clay+fire':   'brick',
  'brick+wood':  'house',
  // ...共 24 条配方
};
```

**键规范**：两个原料 ID 按字母顺序排序后用 `+` 连接（由 `getRecipeKey(a, b)` 保证），消除顺序依赖。

---

## 4. 状态管理模块

**文件**：`src/store/gameStore.tsx`

### 4.1 初始化

```
createInitialInventory()
  → 创建 30 个空格子
  → 在前 5 格填入初始物品（各 3 个）：water, earth, fire, air, wood

initialState
  → inventory: 上述背包
  → discovered: ['water','earth','fire','air','wood']
  → day: 1
  → merchantOffers: generateMerchantOffers(...)
```

### 4.2 Action 类型

| Action 类型       | 触发时机         | 主要逻辑                         |
|-------------------|------------------|----------------------------------|
| `DRAG_DROP`       | 拖拽释放         | 移动 / 堆叠 / 合成判定           |
| `NEXT_DAY`        | 点击"下一天"按钮 | 天数 +1，刷新商人报价            |
| `ACCEPT_TRADE`    | 点击"交换"按钮   | 消耗支付物品，添加收取物品       |
| `CLEAR_SYNTHESIS` | 粒子动画结束后   | 清除 `lastSynthesis`（防重放）   |

### 4.3 DRAG_DROP 判定流程

```
fromSlot → toSlot
    │
    ├─ fromSlot.itemType 为空？→ 返回原状态（无效拖拽）
    │
    ├─ toSlot.itemType 为空？→ 移动（剪切粘贴）
    │
    ├─ 两者物品类型相同？→ 堆叠（amount 累加，清空 fromSlot）
    │
    └─ 查询 RECIPES[getRecipeKey(a, b)]
         ├─ 存在配方 →
         │    ├─ 各消耗 1 个
         │    ├─ 寻找放置目标格子（优先空格，其次已有同类型格）
         │    ├─ 更新 discovered / discoveredRecipes
         │    └─ 写入 lastSynthesis（触发动画）
         │
         └─ 不存在配方 → 互换两格物品（swap）
```

### 4.4 商人报价生成算法

`generateMerchantOffers(inventory, discovered)` 保证至少 3 条报价，且避免死局：

1. **第一条**：必定为基础物品，确保玩家可用任意基础材料换取。
2. **第 2-3 条**：从加权池中抽取 —— 未发现物品权重为已发现的 3 倍，引导玩家探索。
3. **支付项**：优先选择玩家**拥有足量**的物品；若库存不足，退化为基础物品兜底。

### 4.5 Context Hooks

```typescript
useGame()      // 返回 { state, dispatch }，必须在 GameProvider 内使用
useDispatch()  // 返回高阶语义化函数：dragDrop / nextDay / acceptTrade / clearSynthesis
```

---

## 5. 数据层模块

### 5.1 `src/data/items.ts`

- `ITEMS: Record<string, Item>` — 物品字典，键为物品 ID
- `ITEM_LIST: Item[]` — 所有物品的有序列表（用于图鉴渲染）

**当前物品总览（29 种）**：

| 稀有度    | 物品                                               |
|-----------|----------------------------------------------------|
| 基础 (5)  | 水、泥土、火焰、空气、木材                         |
| 普通 (7)  | 黏土、沙子、蒸汽、烟雾、灰烬、种子、云朵           |
| 罕见 (8)  | 砖块、玻璃、植物、雾、闪电、陶器、墨水、风         |
| 稀有 (5)  | 房屋、泡泡、木炭、水晶、风暴                       |
| 传说 (4)  | 城堡、宝石、彩虹、神秘结晶                         |

### 5.2 `src/data/recipes.ts`

- `RECIPES: Record<string, string>` — 配方字典（24 条）
- `getRecipeKey(a, b): string` — 将两个 ID 排序后拼接，保证交换律
- `RECIPE_INFO` — 配方详情映射（食材反查，供图鉴使用）

**配方 DAG 路径示例（通向城堡）**：

```
泥土 + 水 → 黏土
黏土 + 火 → 砖块
砖块 + 木 → 房屋
云朵 + 房屋 → 城堡
```

---

## 6. 组件层模块

### 6.1 `InventoryGrid.tsx`

- 从 `useGame()` 取出 `state.inventory`
- 渲染 30 个 `<InventorySlotCell>` 组件
- 纯展示容器，无自身状态

### 6.2 `InventorySlot.tsx` — 核心交互组件

**本地状态**：
- `isDragOver: boolean` — 控制高亮样式
- `showParticles: boolean` — 控制粒子动画显示

**拖拽事件处理**：

| 事件            | 处理逻辑                                  |
|-----------------|-------------------------------------------|
| `onDragStart`   | 写入 `dataTransfer`（携带 slotId）        |
| `onDragOver`    | `preventDefault()`（允许放置）+ 高亮     |
| `onDragLeave`   | 取消高亮                                  |
| `onDrop`        | 读取 fromSlotId，dispatch `DRAG_DROP`     |
| `onDragEnd`     | 取消高亮（拖拽取消时兜底）               |

**合成动画触发**：
```
useEffect 监听 state.lastSynthesis
  → slotId 与当前格子匹配时，设置 showParticles = true
  → SynthesisParticles onDone 回调 → showParticles = false + clearSynthesis()
```

### 6.3 `ItemBubble.tsx`

- 接收 `itemType`、`amount`、`animating` 属性
- 根据 `ITEMS[itemType]` 取色
- `animating=true` 时追加 CSS class `item-bubble--pop`（触发 `popIn` 动画）
- 数量 > 1 时渲染右上角角标

### 6.4 `SynthesisParticles.tsx`

- 创建 10 个粒子，每个粒子有随机飞散角度与距离
- CSS 变量 `--angle` / `--dist` 驱动 `particleFly` 关键帧
- 700ms 后调用 `onDone` 回调，父组件销毁此组件

### 6.5 `MerchantPanel.tsx`

- 展示当天 3 条 `TradeOffer`
- 未发现的收取物品显示为 `❓ ???`（迷雾效果）
- 检查玩家是否拥有足量支付物品（`canAfford`），不足则禁用按钮
- "下一天" 按钮触发 `NEXT_DAY` action

### 6.6 `CodexPanel.tsx`

- 两个子标签页：**物品** / **配方**
- 物品标签：4 列网格，已发现显示颜色与稀有度，未发现显示 `❓`
- 配方标签：线性列表，已发现显示完整食材→结果，未发现显示 `❓ + ❓ → ???`
- 顶部显示 `已发现数/总数` 进度

---

## 7. 样式层模块

### 7.1 文件职责划分

| 文件                     | 职责                                          |
|--------------------------|-----------------------------------------------|
| `src/index.css`          | ⭐ 游戏全部自定义 CSS（BEM 命名）              |
| `src/styles/theme.css`   | Tailwind + Radix Colors 令牌（UI 组件库层）   |
| `src/main.css`           | Tailwind 基础指令（`@import "tailwindcss"`）  |

游戏 UI 与 UI 组件库（shadcn/ui）完全独立，避免样式污染。

### 7.2 CSS 关键帧动画

| 动画名称        | 触发条件                         | 效果                      | 时长    |
|-----------------|----------------------------------|---------------------------|---------|
| `popIn`         | `.item-bubble--pop`              | 缩放弹跳（0.4→1.25→0.9→1）| 0.5s   |
| `particleFly`   | `.particle`                      | 粒子沿角度飞散并消失       | 0.65s  |
| `floatBubble`   | `.inventory-slot .item-bubble`   | 悬浮轻摆（translateY 循环）| 3s     |

`floatBubble` 通过 CSS 变量 `--slot-id` 错开每个格子的动画延迟（`0.15s × slotId`），形成自然的波浪效果。

### 7.3 色彩规范（马卡龙色系）

| 用途            | 颜色            |
|-----------------|-----------------|
| 页面背景        | `#FDF6E3`（暖米黄）|
| 基础物品气泡    | `#FEF3C7`       |
| 普通物品气泡    | `#D1FAE5`       |
| 罕见物品气泡    | `#DBEAFE`       |
| 稀有物品气泡    | `#EDE9FE`       |
| 传说物品气泡    | `#FCE7F3`       |
| 标题渐变        | `#f59e0b → #ec4899 → #8b5cf6` |
| 合成按钮        | `#34d399 → #059669` |
| 下一天按钮      | `#fbbf24 → #f59e0b` |

---

## 8. 核心算法与逻辑

### 8.1 配方键规范化

```typescript
// src/data/recipes.ts
export function getRecipeKey(a: string, b: string): string {
  return [a, b].sort().join('+');
}
// getRecipeKey('fire', 'earth') === getRecipeKey('earth', 'fire') === 'earth+fire'
```

**设计意图**：配方无顺序要求，A+B 与 B+A 等价，排序确保唯一键。

### 8.2 合成目标格子选择逻辑

```
合成成功后，结果物品放置优先级：
  1. 若 toSlot（被拖到的格子）在消耗后为空 → 放 toSlot
  2. 若 fromSlot（拖拽来源格子）在消耗后为空 → 放 fromSlot
  3. 两者都不为空 → 找第一个空格子
  4. 若背包中已有同类结果物品 → 直接堆叠（覆盖上述逻辑）
```

### 8.3 商人权重池生成

```typescript
const undiscovered = allItemIds.filter(id => !discoveredSet.has(id));
const discPool = allItemIds.filter(id => discoveredSet.has(id));
// 未发现物品出现概率是已发现的 3 倍
const receivePool = [...undiscovered, ...undiscovered, ...undiscovered, ...discPool];
```

**保证无死局**：第一条报价强制为基础物品，玩家在任何进度下都能用初始资源完成交易。

---

## 9. 开发环境搭建

```bash
# 安装依赖
npm install

# 启动开发服务器（默认端口 5000）
npm run dev

# 类型检查 + 生产构建
npm run build

# 代码格式检查
npm run lint

# 预览生产构建
npm run preview
```

### 9.1 环境要求

- Node.js ≥ 18
- npm ≥ 9

### 9.2 关键配置文件

| 文件                | 说明                                         |
|---------------------|----------------------------------------------|
| `vite.config.ts`    | Vite 构建配置，含 React SWC 插件             |
| `tsconfig.json`     | TypeScript 配置，目标 ES2020                 |
| `tailwind.config.js`| Tailwind 配置（仅 UI 组件库层使用）          |
| `runtime.config.json` | Spark 运行时配置                           |

---

## 10. 扩展指南

### 10.1 新增物品

在 `src/data/items.ts` 的 `ITEMS` 字典中添加条目：

```typescript
new_item: {
  id: 'new_item',
  name: '新物品',
  emoji: '🆕',
  description: '物品描述',
  rarity: 'uncommon',
  bubbleColor: '#DBEAFE',
  borderColor: '#93C5FD',
},
```

### 10.2 新增配方

在 `src/data/recipes.ts` 的 `RECIPES` 中添加：

```typescript
'ingredient_a+ingredient_b': 'result_item',
// 注意：键必须按字母顺序排序（getRecipeKey 会自动处理运行时查找，
// 但静态定义需手动确保顺序）
```

验证方法：`getRecipeKey('ingredient_a', 'ingredient_b')` 的结果即为正确的键。

### 10.3 修改背包容量

在 `src/store/gameStore.tsx` 顶部修改：

```typescript
const SLOT_COUNT = 30; // 改为所需格数
```

同时在 `src/index.css` 调整网格列数：

```css
.inventory-grid {
  grid-template-columns: repeat(6, 1fr); /* 修改列数 */
}
```

### 10.4 添加新游戏动作

1. 在 `src/types/game.ts` 的 `Action` 联合类型中添加新类型
2. 在 `gameStore.tsx` 的 `reducer` 中添加对应 `case`
3. 在 `useDispatch()` 中暴露封装好的回调函数

---

*文档版本：v1.0 | 最后更新：2026-04*
