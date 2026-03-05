/**
 * 杀戮尖塔 Mod 桥接服务器
 * 接收来自游戏 Communication Mod 的数据
 * 
 * 使用方式：
 * 1. 在 Steam 订阅 Communication Mod
 * 2. 配置 Mod 发送数据到 http://localhost:3456/api/game-state
 * 3. 启动这个服务器: node server.js
 * 4. 启动游戏，数据会自动同步
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3456; // Mod 默认端口

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 最新的游戏状态
let latestGameState = null;

// 接收游戏状态
app.post('/api/game-state', async (req, res) => {
  try {
    const gameState = req.body;
    latestGameState = gameState;
    
    console.log('接收到游戏状态:', new Date().toLocaleTimeString());
    console.log('- 角色:', gameState.character?.class);
    console.log('- 手牌数:', gameState.deckState?.hand?.length);
    console.log('- 敌人:', gameState.enemies?.map(e => e.name).join(', '));
    
    // 保存到文件
    const savePath = path.join(__dirname, '../battle/save/auto-import.json');
    await fs.mkdir(path.dirname(savePath), { recursive: true });
    await fs.writeFile(savePath, JSON.stringify(gameState, null, 2));
    
    console.log('✓ 游戏状态已保存到 battle/save/auto-import.json');
    console.log('  刷新页面即可看到最新数据\n');
    
    res.json({ success: true, message: '数据已接收' });
  } catch (error) {
    console.error('处理游戏状态失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取最新状态
app.get('/api/game-state', (req, res) => {
  res.json(latestGameState || { message: '暂无游戏数据' });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', hasData: !!latestGameState });
});

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('  杀戮尖塔 - Mod 桥接服务器');
  console.log('='.repeat(60));
  console.log(`\n服务器运行在: http://localhost:${PORT}`);
  console.log('\n使用步骤:');
  console.log('1. 安装 Communication Mod (Steam 创意工坊)');
  console.log('2. 在游戏中按配置发送数据到此服务器');
  console.log('3. 数据会自动保存，刷新页面即可看到\n');
});
