# 杀戮尖塔助手

一个基于 LLM 的杀戮尖塔辅助工具，包含**实时对战模拟**、**卡组构筑分析**和**数据管理**三个功能。

## 快速开始

### 一键启动

**Windows 用户直接双击：**

```
start.bat
```

然后浏览器会自动打开 http://localhost:3000，点击你想用的功能即可。

### 三个功能入口

启动后访问 http://localhost:3000，可以看到：

| 功能 | 入口 |
|------|------|
| ⚔️ **实时对战** | 模拟战斗场景，配置角色、敌人、手牌，获取 AI 决策建议 |
| 🎯 **卡组构筑** | 构建和分析卡组，与 AI 对话获取构筑建议 |
| 🗃️ **数据管理** | 管理卡牌、遗物、敌人等游戏数据 |

## 配置 LLM API

首次使用需要配置 AI API：

1. 打开卡组构筑或实时对战页面
2. 点击右上角的 ⚙️ 按钮
3. 选择预设（Kimi、Claude、OpenAI 等）或自定义
4. 填写 API 密钥

支持的 API：
- **Kimi**: https://api.moonshot.cn/v1
- **Claude**: https://api.anthropic.com/v1
- **OpenAI**: https://api.openai.com/v1
- **本地模型**: http://localhost:11434/v1 (Ollama)

## 项目结构

```
slay-the-spire-assistant/
├── backend/          # 后端服务 (Express + SQLite)
│   ├── server.js
│   ├── admin.html    # 数据管理界面
│   └── public/       # 前端页面
│       ├── index.html    # 导航页
│       ├── deck/         # 卡组构筑
│       └── battle/       # 实时对战
├── data/             # 游戏数据
└── scripts/          # 工具脚本
```

## 详细文档

- [项目结构说明](./PROJECT_STRUCTURE.md)
- [使用指南](./USAGE.md)

## 许可

本项目仅供学习和个人使用。游戏内容版权归 Mega Crit Games 所有。
