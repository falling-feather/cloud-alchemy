# ☁️ 云端炼金 · Cloud Alchemy

> 沙盒合成与配方探索游戏 — 拖拽、发现、收集，治愈系放松体验

![游戏状态](https://img.shields.io/badge/状态-可运行-brightgreen) ![技术栈](https://img.shields.io/badge/React_19_+_TypeScript_+_Vite-blue)

---

## 🎮 游戏简介

《云端炼金》是一款网页端休闲合成游戏。你将从最基础的**水、泥土、火焰、空气、木材**出发，通过拖拽合成发现越来越多的物品，逐步解锁从黏土、砖块到城堡、彩虹、神秘结晶等 **33 种物品**和 **28 条配方**（含熔岩、药草、黑曜石、卷轴等扩展分支）。

游戏没有失败、没有死亡惩罚，只有轻松愉快的探索乐趣。

---

## ✨ 核心特色

| 特色 | 说明 |
|------|------|
| 🧪 **拖拽合成** | 将物品拖到另一个物品上即可尝试合成，无需复杂操作 |
| 📖 **图鉴收集** | 首次合成新物品时触发发现动画，图鉴自动解锁 |
| 🧙 **流浪商人** | 每天刷新多条交易报价（可配置），用已有资源换取新材料 |
| 🔮 **神秘迷雾** | 未发现的物品以 `❓` 显示，激发探索欲 |
| 🫧 **气泡动画** | 物品以彩色圆形气泡呈现，合成成功时伴随弹跳与粒子特效 |
| 🎨 **治愈风格** | 马卡龙色系 + 暖米黄背景，轻松解压 |

---

## 🕹️ 游戏玩法

### 基础操作

1. **拖拽合成**：将背包中的一个物品拖拽到另一个物品上
   - 若存在配方 → 消耗各 1 个，生成新物品（播放弹跳 + 粒子动画）
   - 若不存在配方 → 两个物品互换位置
   - 若目标格子为空 → 移动物品到该格子
   - 若两者物品相同 → 合并堆叠数量

2. **查看图鉴**：点击右侧"📖 图鉴"标签，查看已发现的物品和配方

3. **交易商人**：点击右侧"🧙 商人"标签，浏览今日报价并点击"交换"按钮完成交易

4. **下一天**：点击"☀️ 下一天"按钮刷新商人报价，开启新的一天

### 合成路径示例

```
水 💧 + 泥土 🌍 → 黏土 🫙
黏土 🫙 + 火焰 🔥 → 砖块 🧱
砖块 🧱 + 木材 🪵 → 房屋 🏠
房屋 🏠 + 云朵 ☁️ → 城堡 🏰
```

> 💡 提示：尝试所有基础元素的两两组合，逐步解锁更稀有的物品！

---

## 🚀 快速开始

### 在线体验

直接在支持的平台（如 GitHub Spark）上打开即可运行。

### 本地运行

```bash
# 1. 克隆仓库
git clone https://github.com/falling-feather/cloud-alchemy.git
cd cloud-alchemy

# 2. 安装依赖（需要 Node.js >= 20.19，与 package.json engines 一致）
npm install

# 3. 启动开发服务器
npm run dev
# 访问 http://localhost:5000

# 4. 构建生产版本
npm run build

# 5. 运行核心逻辑单测（可选）
npm run test
```

**说明**：未执行 `npm install` 时，系统 PATH 中可能没有 `tsc` / `vite`，会出现「命令不是内部或外部命令」或构建失败；请先安装依赖。

### GitHub Spark

仓库根目录的 `runtime.config.json`、`spark.meta.json` 与入口中的 `@github/spark` 用于 **Spark 托管**；在 Spark 平台内预览与本地 `npm run dev` 行为可能略有差异，详见 [DEVELOPER.md](./docs/DEVELOPER.md)。

游戏进度默认写入浏览器 **localStorage**（键名见 `src/game/persistence/storage.ts`）；标题栏提供 **新游戏** 以清空进度并恢复初始背包。

---

## 🗺️ 物品稀有度

游戏中共有 **5 个稀有度等级**，颜色越深越难获得：

| 等级 | 气泡颜色 | 代表物品 |
|------|---------|---------|
| 🟡 基础 | 暖黄 | 水、泥土、火焰、空气、木材 |
| 🟢 普通 | 薄荷绿 | 黏土、蒸汽、云朵… |
| 🔵 罕见 | 天蓝 | 砖块、玻璃、闪电… |
| 🟣 稀有 | 薰衣草紫 | 房屋、水晶、风暴… |
| 🩷 传说 | 樱花粉 | 城堡、宝石、彩虹、神秘结晶 |

---

## 📁 项目结构（简览）

```
src/
├── app/App.tsx                    # 根布局 + GameProvider
├── game/                          # 与 UI 解耦：类型、内容表、纯 reducer、存档
│   ├── content/                   # items / recipes + Zod 校验
│   ├── rules/                     # gameReducer、商人、初始状态、里程碑
│   └── persistence/               # localStorage hydrate
├── features/alchemy/
│   ├── state/gameStore.tsx        # React Context + 自动存档
│   └── ui/                        # 背包、商人、图鉴、粒子、目标面板
└── components/ui/                 # shadcn/ui（错误边界等）
```

> 详细的架构说明、模块文档和扩展指南，请参阅 **[DEVELOPER.md](./docs/DEVELOPER.md)**。

---

## 🛠️ 技术栈

- **框架**：React 19 + TypeScript
- **构建**：Vite 7
- **拖拽**：HTML5 原生 Drag and Drop API
- **布局**：纯 CSS Grid
- **动画**：CSS `@keyframes`
- **状态管理**：React Context + `useReducer`
- **UI 组件**：shadcn/ui（仅错误提示层使用）

---

## 📄 许可证

本项目基于 [MIT License](./LICENSE) 开源。
