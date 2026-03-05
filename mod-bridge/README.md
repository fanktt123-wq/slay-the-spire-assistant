# Mod 桥接服务器

通过 Communication Mod 自动从游戏导入数据。

## 快速开始

### 1. 安装 Mod

在 Steam 创意工坊订阅以下 Mod：
- **Communication Mod** - 允许游戏发送数据到外部程序
- **ModTheSpire** - Mod 加载器

### 2. 启动桥接服务器

```bash
cd mod-bridge
npm install
node server.js
```

服务器将在 `http://localhost:3456` 启动。

### 3. 配置游戏

Communication Mod 的配置文件通常在：
```
Steam\steamapps\common\SlayTheSpire\mods\CommunicationMod\config.json
```

添加以下配置：
```json
{
  "endpoint": "http://localhost:3456/api/game-state",
  "autoSend": true,
  "sendOnTurnStart": true
}
```

### 4. 开始游戏

启动游戏后，数据会自动发送到助手：
- 每回合开始时自动同步
- 数据保存到 `battle/save/auto-import.json`

## 备选方案：手动导入

如果没有 Mod 支持，你可以：

1. **截图 + OCR**：游戏内按 F12 截图，使用 OCR 工具识别卡牌
2. **导出存档**：使用 "Save State" Mod 导出 JSON，然后导入

## 数据格式

接收的游戏状态格式：
```json
{
  "character": {
    "class": "ironclad",
    "currentHp": 80,
    "maxHp": 80,
    "block": 0,
    "energy": 3
  },
  "deckState": {
    "hand": [...],
    "drawPile": [...],
    "discardPile": [...]
  },
  "enemies": [...],
  "relics": [...]
}
```
