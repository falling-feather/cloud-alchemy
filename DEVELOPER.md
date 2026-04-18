# 《云端炼金》开发者文档

> 项目代号：Cloud_Alchemy  
> 技术栈：React 19 + TypeScript + Vite；游戏界面样式以 `src/index.css` 为主，`src/main.css` 引入 Tailwind（供 `components/ui` 与主题令牌使用）  
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
│                   src/app/App.tsx (根组件)                    │
│   ┌─────────────────────────────────────────────────────┐   │
│   │   features/alchemy/state — GameProvider (Context)    │   │
│   │  ┌──────────────────────────────────────────────┐   │   │
│   │  │              GameLayout（同文件）              │   │   │
│   │  │  ┌──────────────┐   ┌───────────────────┐    │   │   │
│   │  │  │ features/    │   │ MerchantPanel /   │    │   │   │
│   │  │  │ alchemy/ui   │   │ CodexPanel        │    │   │   │
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
  UI 层 dispatch(GameAction)
        │
        ▼
  src/game/rules/reducer.ts — gameReducer(state, action)
        │
        ▼
  新 GameState 经 GameProvider 广播；可选写入 localStorage（防抖）
        │
        ▼
  所有订阅组件重新渲染
```

纯游戏规则集中在 `src/game/rules/reducer.ts`；`features/alchemy/state/gameStore.tsx` 仅负责 React 绑定、存档与 `useDispatch` 封装。

---

## 2. 目录结构与文件分配

```
cloud-alchemy/
├── index.html
├── package.json                # engines.node >=20.19；脚本含 npm test
├── vitest.config.ts            # 纯逻辑单测（gameReducer）
├── runtime.config.json         # GitHub Spark 运行时（勿删）
├── spark.meta.json             # Spark 模板元数据（勿删）
├── vite.config.ts              # 含 spark-vite-plugin（Spark 发布需要）
│
└── src/
    ├── main.tsx                # 入口；引入 @github/spark/spark
    ├── app/App.tsx             # ⭐ 根布局 + GameProvider
    ├── game/                   # ⭐ 与 UI 解耦的游戏域
    │   ├── types.ts
    │   ├── content/            # items / recipes / zod schemas / validate
    │   ├── rules/              # reducer、商人、初始背包、里程碑目标
    │   └── persistence/        # localStorage 序列化与 hydrate
    ├── features/alchemy/
    │   ├── state/gameStore.tsx # Context + useReducer + 自动存档
    │   └── ui/                 # 背包、商人、图鉴、粒子、目标面板
    ├── components/ui/          # shadcn/ui（ErrorFallback 等）
    ├── lib/utils.ts
    ├── index.css               # 游戏布局与动效
    ├── main.css                # Tailwind 入口
    └── styles/theme.css
```

> ⭐ 标记为游戏核心文件，修改时需格外注意

---

## 3. 核心数据结构

所有类型定义位于 `src/game/types.ts`（可由 `src/game/index.ts` 统一 re-export）。

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

配方定义于 `src/game/content/recipes.ts`，使用哈希表表示有向无环图：

```typescript
const RECIPES: Record<string, string> = {
  'earth+water': 'clay',
  'clay+fire':   'brick',
  'brick+wood':  'house',
  // ...共 28 条配方（以 src/game/content/recipes.ts 为准）
};
```

**键规范**：两个原料 ID 按字母顺序排序后用 `+` 连接（由 `getRecipeKey(a, b)` 保证），消除顺序依赖。

---

## 4. 状态管理模块

**纯逻辑文件**：`src/game/rules/reducer.ts`（`gameReducer` + `GameAction`）  
**React 绑定**：`src/features/alchemy/state/gameStore.tsx`（`GameProvider`、`useGame`、`useDispatch`、localStorage 防抖写入）

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
| `RESET_GAME`      | 点击「新游戏」并确认 | 恢复初始背包与图鉴（并覆盖存档） |

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

`generateMerchantOffers(inventory, discovered, config?)` 默认最多 `MERCHANT_CONFIG.maxOffers` 条报价，且避免死局：

1. **第一条**：在仍有可选基础物时，优先给出基础物品交换，降低卡死概率。
2. **后续条**：从加权池中抽取 —— 未发现物品重复次数由 `MERCHANT_CONFIG.undiscoveredPoolWeight` 控制。
3. **支付项**：优先选择玩家**拥有足量**的物品；若库存不足，退化为基础物品兜底。

参数见 `src/game/rules/merchantConfig.ts`。

### 4.5 Context Hooks

```typescript
useGame()      // 返回 { state, dispatch }，必须在 GameProvider 内使用
useDispatch()  // dragDrop / nextDay / acceptTrade / clearSynthesis / resetGame
```

---

## 5. 数据层模块

### 5.1 `src/game/content/items.ts`

- `ITEMS: Record<string, Item>` — 物品字典，键为物品 ID
- `ITEM_LIST: Item[]` — 所有物品的有序列表（用于图鉴渲染）

**当前物品总览（33 种，含扩展分支）**：

| 稀有度    | 物品 |
|-----------|------|
| 基础 (5)  | 水、泥土、火焰、空气、木材 |
| 普通 (9)  | 黏土、沙子、蒸汽、烟雾、灰烬、种子、云朵、熔岩、药草 |
| 罕见 (9)  | 砖块、玻璃、植物、雾、闪电、陶器、墨水、风、黑曜石 |
| 稀有 (6)  | 房屋、泡泡、木炭、水晶、风暴、卷轴 |
| 传说 (4)  | 城堡、宝石、彩虹、神秘结晶 |

### 5.2 `src/game/content/recipes.ts`

- `RECIPES: Record<string, string>` — 配方字典（28 条）
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

路径均在 `src/features/alchemy/ui/`（状态来自 `../state/gameStore`）。

### 6.1 `InventoryGrid.tsx`

- 从 `useGame()` 取出 `state.inventory`
- 渲染 30 个 `<InventorySlotCell>` 组件
- 纯展示容器，无自身状态

### 6.2 `InventorySlot.tsx` — 核心交互组件

**本地状态**：
- `isDragOver: boolean` — 控制高亮样式
- `showParticles: boolean` — 控制粒子动画显示

**拖拽事件处理**：与旧版相同（`dataTransfer` 携带 `slotId`，`onDrop` → `dragDrop`）。

**合成动画触发**（避免连续合成时 effect 抖动）：
```
synthesisFxKey = lastSynthesis 且 slotId 匹配时 `${slotId}-${itemType}-${isNew}`
useEffect 仅依赖 synthesisFxKey → 匹配则 showParticles = true
onDone → clearSynthesis()
```

### 6.3 `ItemBubble.tsx` / `SynthesisParticles.tsx`

- 从 `@/game/content/items` 读取配色与元数据
- 粒子 700ms 后 `onDone`

### 6.4 `MerchantPanel.tsx`

- 展示当天 `merchantOffers`（默认条数由 `MERCHANT_CONFIG.maxOffers` 决定）
- 未发现收取物显示迷雾；`NEXT_DAY` 刷新报价

### 6.5 `CodexPanel.tsx` / `GoalsPanel.tsx`

- 图鉴：物品 / 配方双标签，进度统计
- 目标：读取 `src/game/rules/goals.ts` 中里程碑，根据 `discovered` 等推导完成态

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
// src/game/content/recipes.ts
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

加权池逻辑见 `src/game/rules/merchant.ts`：`undiscovered` 按 `MERCHANT_CONFIG.undiscoveredPoolWeight` 重复后加入池，再并入已发现物品。

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

# 游戏核心逻辑单测（Vitest）
npm run test
```

### 9.1 环境要求

- **Node.js ≥ 20.19**（与 Vite 7 及当前依赖锁一致；`package.json` 含 `engines` 字段）
- npm ≥ 9

克隆后**务必**先执行 `npm install`，否则本地没有 `node_modules` 时会出现 `tsc` / `vite` 找不到、构建失败。

### 9.2 关键配置文件

| 文件                | 说明                                         |
|---------------------|----------------------------------------------|
| `vite.config.ts`    | Vite 构建配置；含 `@github/spark/spark-vite-plugin`（Spark 发布勿删） |
| `tsconfig.json`     | TypeScript 配置，路径别名 `@/*` → `src/*`   |
| `tailwind.config.js`| Tailwind 配置（`main.css` / UI 层）          |
| `runtime.config.json` | GitHub Spark 应用运行时（与平台 app id 对应，勿删） |
| `spark.meta.json`   | Spark 模板版本元数据（勿删）                 |

---

## 10. 扩展指南

### 10.1 新增物品

在 `src/game/content/items.ts` 的 `ITEMS` 字典中添加条目：

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

在 `src/game/content/recipes.ts` 的 `RECIPES` 中添加：

```typescript
'ingredient_a+ingredient_b': 'result_item',
// 注意：键必须按字母顺序排序（getRecipeKey 会自动处理运行时查找，
// 但静态定义需手动确保顺序）
```

验证方法：`getRecipeKey('ingredient_a', 'ingredient_b')` 的结果即为正确的键。

### 10.3 修改背包容量

在 `src/game/rules/inventory.ts` 中修改：

```typescript
export const SLOT_COUNT = 30; // 改为所需格数
```

若调整格数，请同步更新 `src/game/content/schemas.ts` 中 `persistedGameStateSchema` 对 `inventory` 数组长度的校验。

同时在 `src/index.css` 调整网格列数：

```css
.inventory-grid {
  grid-template-columns: repeat(6, 1fr); /* 修改列数 */
}
```

### 10.4 添加新游戏动作

1. 在 `src/game/rules/reducer.ts` 的 `GameAction` 联合类型中添加新类型
2. 在同一文件的 `gameReducer` 中添加对应 `case`
3. 在 `src/features/alchemy/state/gameStore.tsx` 的 `useDispatch()` 中暴露封装好的回调函数

---

启动时 `assertValidGameContent()` 会校验物品与配方引用一致性（见 `src/game/content/validate.ts`）。

*文档版本：v1.1 | 最后更新：2026-04*
