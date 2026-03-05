# 项目架构说明

## 目录结构

```
slay-the-spire-assistant/
├── backend/                 # 后端服务
│   ├── server.js           # Express 服务器
│   ├── database.js         # SQLite 数据库操作
│   ├── admin.html          # 数据管理界面
│   ├── package.json
│   └── public/             # 前端构建输出
│       ├── index.html      # 导航页
│       ├── deck/           # 卡组构筑页面
│       └── battle/         # 实时对战页面
│
├── frontend/               # 卡组构筑 - 源代码
│   ├── src/
│   │   └── App.jsx         # 卡组构建主组件
│   ├── package.json
│   └── vite.config.js
│
├── battle/                 # 实时对战 - 源代码
│   ├── src/
│   │   ├── App.tsx         # 对战模拟主组件
│   │   ├── components/     # UI 组件
│   │   └── hooks/          # 自定义 Hooks
│   ├── package.json
│   └── vite.config.ts
│
├── data/                   # 游戏数据（JSON 源文件）
│   ├── cards.json
│   ├── relics.json
│   ├── enemies.json
│   ├── buffs.json
│   └── game-knowledge.md
│
└── scripts/                # 工具脚本
    └── validate-data.js
```

## 核心功能模块

### 1. 后端服务 (backend/)

- **Express 服务器**: 提供 RESTful API
- **SQLite 数据库**: 存储卡牌、遗物、敌人等数据
- **静态文件托管**: 托管前端页面
- **LLM 集成**: 处理 AI 分析请求

#### API 端点

**公开 API**:
- `GET /api/cards` - 获取所有卡牌
- `GET /api/relics` - 获取所有遗物
- `GET /api/enemies` - 获取所有敌人
- `GET /api/buffs` - 获取所有 Buff
- `POST /api/analyze` - AI 分析构筑
- `POST /api/analyze-stream` - 流式 AI 分析

**管理 API**:
- `GET/POST/PUT/DELETE /api/admin/*` - 数据管理 CRUD

### 2. 卡组构筑 (frontend/)

- React 单页应用
- 可视化卡牌和遗物选择
- API 配置界面
- AI 聊天对话

### 3. 实时对战 (battle/)

- React + TypeScript
- Tailwind CSS + shadcn/ui 组件
- 完整的战斗状态管理
- AI 决策建议

### 4. 数据管理 (backend/admin.html)

- 原生 HTML/CSS/JS
- 管理所有游戏数据
- 支持 JSON 导入

## 数据流

### 卡组分析流程

```
用户选择构筑
    ↓
前端收集数据 (卡牌ID + 遗物ID)
    ↓
发送到后端 /api/analyze-stream
    ↓
后端查询数据库获取完整数据
    ↓
构建分析上下文
    ↓
调用 LLM API (流式响应)
    ↓
前端展示分析结果
```

### 对战模拟流程

```
用户配置战斗状态
    ↓
前端本地状态管理
    ↓
发送到后端 /api/analyze (可选)
    ↓
后端构建战斗上下文
    ↓
调用 LLM API 获取决策建议
    ↓
前端展示 AI 建议
```

## 数据库设计

使用 SQLite，主要表：
- `characters` - 角色
- `cards` - 卡牌
- `relics` - 遗物
- `buffs` - Buff/Debuff
- `enemies` - 敌人
- `potions` - 药水

数据在启动时从 JSON 文件导入（如果数据库为空）。

## LLM 集成

支持多种 LLM 服务：
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Moonshot (Kimi)
- Google (Gemini)
- 本地模型 (Ollama)

## 安全考虑

1. API 密钥在前端配置，不存储在服务器
2. 使用环境变量管理敏感配置
3. CORS 配置限制访问来源
4. 输入验证和清理

## 部署

### 开发环境

```bash
# 后端
cd backend && npm start

# 卡组构筑
cd frontend && npm run dev

# 实时对战
cd battle && npm run dev -- --port 5174
```

### 生产环境

```bash
# 构建前端
cd frontend && npm run build
cd battle && npm run build

# 启动后端（托管所有页面）
cd backend && npm start
```

访问 http://localhost:3000 查看导航页。

## 扩展性

### 添加新角色

1. 在数据库中添加角色
2. 添加该角色的卡牌数据
3. 在前端配置角色颜色

### 添加新功能

- 卡组构筑和实时对战是独立的，可以单独修改
- 后端 API 设计为通用格式，易于扩展
- 数据管理界面自动生成表单
