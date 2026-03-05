# 项目结构说明

## 概述

本项目包含**三个独立的可交互页面**：

| 页面 | 路径 | 源代码 | 功能描述 |
|------|------|--------|----------|
| 实时对战界面 | `/battle` | `battle/` | 模拟杀戮尖塔实时对战，配置角色、敌人、手牌等 |
| 卡组构筑界面 | `/deck` | `frontend/` | 构建和分析卡组，AI 辅助构筑建议 |
| 数据管理界面 | `/admin` | `backend/admin.html` | 管理卡牌、遗物、敌人等游戏数据 |

## 目录结构

```
slay-the-spire-assistant/
├── backend/                    # 后端服务
│   ├── server.js              # Express 服务器
│   ├── database.js            # SQLite 数据库操作
│   ├── admin.html             # 数据管理界面
│   ├── package.json
│   └── public/                # 前端构建输出
│       ├── battle/            # 对战界面 (构建后)
│       └── deck/              # 卡组界面 (构建后)
│
├── frontend/                   # 卡组构筑 - 源代码
│   ├── src/
│   │   └── App.jsx            # 卡组构建主组件
│   ├── package.json
│   └── vite.config.js
│
├── battle/                     # 实时对战 - 源代码
│   ├── src/
│   │   ├── App.tsx            # 对战模拟主组件
│   │   ├── components/        # UI 组件
│   │   └── hooks/             # 自定义 Hooks
│   ├── package.json
│   └── vite.config.ts
│
├── data/                       # 游戏数据
│   ├── cards.json             # 卡牌数据
│   ├── relics.json            # 遗物数据
│   ├── enemies.json           # 敌人数据
│   ├── buffs.json             # Buff 数据
│   └── game-knowledge.md      # 游戏知识库
│
└── scripts/                    # 工具脚本
    └── validate-data.js
```

## 开发模式启动

### 1. 启动后端（必需）

```bash
cd backend
npm install
npm start
```
后端运行在: http://localhost:3000

### 2. 启动卡组构筑界面（开发模式）

```bash
cd frontend
npm install
npm run dev
```
开发服务器: http://localhost:5173

### 3. 启动实时对战界面（开发模式）

```bash
cd battle
npm install
npm run dev
```
开发服务器: http://localhost:5174

## 生产模式启动

只需启动后端，所有页面都已构建：

```bash
cd backend
npm start
```

访问地址：
- 卡组构筑: http://localhost:3000/deck
- 实时对战: http://localhost:3000/battle
- 数据管理: http://localhost:3000/admin

## 构建前端

### 构建卡组构筑

```bash
cd frontend
npm run build
```
输出到 `backend/public/deck/`

### 构建实时对战

```bash
cd battle
npm run build
```
输出到 `backend/public/battle/`

## 快速启动（Windows）

使用提供的批处理脚本：

```bash
# 一键启动所有服务
start-all.bat

# 只启动后端
start-backend.bat

# 只启动前端（卡组构筑）
start-frontend.bat
```

## 页面功能说明

### 1. 实时对战界面 (/battle)

- 配置玩家角色（生命值、金币、遗物、药水）
- 添加和编辑敌人
- 管理手牌、抽牌堆、弃牌堆、消耗堆
- 查看 AI 战斗决策建议
- 保存/加载战斗状态

### 2. 卡组构筑界面 (/deck)

- 选择角色和卡牌构建卡组
- 选择遗物
- 与 AI 对话获取构筑建议
- 查看卡组统计分析
- 支持多种 LLM API（OpenAI、Claude、Kimi 等）

### 3. 数据管理界面 (/admin)

- 管理角色数据
- 管理卡牌数据
- 管理遗物数据
- 管理 Buff/Debuff 数据
- 管理敌人数据
- 从 JSON 导入数据

## 技术栈

| 模块 | 技术 |
|------|------|
| 后端 | Node.js + Express + SQLite |
| 卡组构筑 | React + Vite |
| 实时对战 | React + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| 数据管理 | 原生 HTML/CSS/JS |

## 注意事项

1. **必须先启动后端**，因为两个前端都依赖后端的 API
2. **battle 目录下有 node_modules**，这是正常的，它包含 shadcn/ui 等依赖
3. 开发时需要同时运行多个终端窗口
