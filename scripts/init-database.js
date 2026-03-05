#!/usr/bin/env node

/**
 * 数据库初始化脚本
 * 用法: node scripts/init-database.js
 */

import { initDatabase, importCardsFromJson, importRelicsFromJson } from '../backend/database.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function init() {
  console.log('🎴 杀戮尖塔数据库初始化工具\n');
  
  try {
    // 初始化数据库表结构
    console.log('📦 正在初始化数据库表结构...');
    await initDatabase();
    console.log('✅ 数据库表结构初始化完成\n');
    
    // 从JSON导入数据
    const dataDir = path.join(__dirname, '../data');
    
    console.log('📥 正在从 cards.json 导入卡牌数据...');
    const cardsJson = JSON.parse(await fs.readFile(path.join(dataDir, 'cards.json'), 'utf-8'));
    const cardsResult = await importCardsFromJson(cardsJson);
    console.log(`✅ 卡牌导入完成: ${cardsResult.count} 张卡牌\n`);
    
    console.log('📥 正在从 relics.json 导入遗物数据...');
    const relicsJson = JSON.parse(await fs.readFile(path.join(dataDir, 'relics.json'), 'utf-8'));
    const relicsResult = await importRelicsFromJson(relicsJson);
    console.log(`✅ 遗物导入完成: ${relicsResult.count} 个遗物\n`);
    
    console.log('🎉 数据库初始化完成！');
    console.log('\n接下来可以：');
    console.log('  1. 启动后端服务器: cd backend && npm start');
    console.log('  2. 访问管理后台: http://localhost:3000/admin');
    console.log('  3. 启动前端应用: cd frontend && npm run dev');
    
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    process.exit(1);
  }
}

init();
