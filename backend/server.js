import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  initDatabase,
  getAllCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  getAllCards,
  getCardsByCharacter,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  getAllRelics,
  getRelicById,
  createRelic,
  updateRelic,
  deleteRelic,
  importCardsFromJson,
  importRelicsFromJson,
  getAllBuffs,
  getBuffById,
  createBuff,
  updateBuff,
  deleteBuff,
  importBuffsFromJson,
  getAllEnemies,
  getEnemyById,
  createEnemy,
  updateEnemy,
  deleteEnemy,
  importEnemiesFromJson,
  getAllPotions,
  getPotionById,
  createPotion,
  updatePotion,
  deletePotion,
  importPotionsFromJson,
  getAllConcepts,
  getConceptById,
  createConcept,
  updateConcept,
  deleteConcept,
  importConceptsFromJson
} from './database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 加载游戏数据
let cardsData = null;
let relicsData = null;
let buffsData = null;
let enemiesData = null;
let gameKnowledge = null;
let buildMethodology = null;

// 攻略文件存储
let guideFiles = new Map();

// 对话历史存储
const conversationHistory = new Map();

async function loadGameData() {
  try {
    const dataDir = path.join(__dirname, '../data');
    
    // 严格从数据库加载，失败时抛出错误
    cardsData = await getAllCards();
    // 检查所有角色中的卡牌总数是否为0
    const cardsCount = Object.values(cardsData).reduce((sum, items) => sum + items.length, 0);
    const hasCards = cardsCount > 0;
    
    if (!hasCards) {
      console.log('数据库中卡牌为空，从JSON导入...');
      const cardsJson = JSON.parse(await fs.readFile(path.join(dataDir, 'cards.json'), 'utf-8'));
      await importCardsFromJson(cardsJson);
      cardsData = await getAllCards();
      console.log('卡牌数据导入完成');
    }

    relicsData = await getAllRelics();
    // 检查所有分类中的遗物总数是否为0
    const relicsCount = Object.values(relicsData).reduce((sum, items) => sum + items.length, 0);
    const hasRelics = relicsCount > 0;
    
    if (!hasRelics) {
      console.log('数据库中遗物为空，从JSON导入...');
      const relicsJson = JSON.parse(await fs.readFile(path.join(dataDir, 'relics.json'), 'utf-8'));
      await importRelicsFromJson(relicsJson);
      relicsData = await getAllRelics();
      console.log('遗物数据导入完成');
    }

    // 加载buffs数据
    buffsData = await getAllBuffs();
    // 检查所有分类中的buff总数是否为0
    const buffsCount = Object.values(buffsData).reduce((sum, items) => sum + items.length, 0);
    const hasBuffs = buffsCount > 0;
    
    if (!hasBuffs) {
      try {
        console.log('数据库中buff为空，从JSON导入...');
        const buffsJson = JSON.parse(await fs.readFile(path.join(dataDir, 'buffs.json'), 'utf-8'));
        await importBuffsFromJson(buffsJson);
        buffsData = await getAllBuffs();
        console.log('buff数据导入完成');
      } catch (fileErr) {
        console.log('buffs.json 不存在，跳过导入');
        buffsData = {};
      }
    }

    // 加载enemies数据
    enemiesData = await getAllEnemies();
    // 检查所有分类中的敌人总数是否为0
    const enemiesCount = Object.values(enemiesData).reduce((sum, items) => sum + items.length, 0);
    const hasEnemies = enemiesCount > 0;
    
    if (!hasEnemies) {
      try {
        console.log('数据库中敌人为空，从JSON导入...');
        const enemiesJson = JSON.parse(await fs.readFile(path.join(dataDir, 'enemies.json'), 'utf-8'));
        await importEnemiesFromJson(enemiesJson);
        enemiesData = await getAllEnemies();
        console.log('敌人数据导入完成');
      } catch (fileErr) {
        console.log('enemies.json 不存在，跳过导入');
        enemiesData = {};
      }
    }
    
    // 加载potions数据
    let potionsData = await getAllPotions();
    const hasPotions = potionsData.length > 0;
    
    if (!hasPotions) {
      try {
        const potionsJson = JSON.parse(await fs.readFile(path.join(dataDir, 'potions.json'), 'utf-8'));
        await importPotionsFromJson(potionsJson);
        console.log('药水数据从JSON导入成功');
      } catch (fileErr) {
        console.log('potions.json 不存在，跳过导入');
      }
    }
    
    // 加载concepts数据
    let conceptsData = await getAllConcepts();
    const conceptsCount = Object.values(conceptsData).reduce((sum, items) => sum + items.length, 0);
    const hasConcepts = conceptsCount > 0;
    
    if (!hasConcepts) {
      try {
        console.log('数据库中概念为空，从JSON导入...');
        const conceptsJson = JSON.parse(await fs.readFile(path.join(dataDir, 'concepts.json'), 'utf-8'));
        await importConceptsFromJson(conceptsJson);
        console.log('概念数据从JSON导入成功');
      } catch (fileErr) {
        console.log('concepts.json 不存在，跳过导入');
      }
    }

    gameKnowledge = await fs.readFile(path.join(dataDir, 'game-knowledge.md'), 'utf-8');
    
    // 加载构筑方法论（从攻略文件夹读取英文版）
    try {
      buildMethodology = await fs.readFile(path.join(dataDir, '新建文件夹/howtobuild_en.txt'), 'utf-8');
      console.log('构筑方法论加载成功 (howtobuild_en.txt)');
    } catch (e) {
      console.error('无法加载构筑方法论:', e);
      buildMethodology = '';
    }
    
    await loadGuideFiles(dataDir);
    
    console.log('游戏数据加载成功（全部来自数据库）');
  } catch (error) {
    console.error('加载游戏数据失败:', error);
    throw error; // 抛出错误，不降级
  }
}

async function loadGuideFiles(dataDir) {
  const guideDir = path.join(dataDir, '新建文件夹');
  guideFiles = new Map();
  
  try {
    const files = await fs.readdir(guideDir);
    
    for (const file of files) {
      const filePath = path.join(guideDir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isFile()) {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          guideFiles.set(file, content);
          console.log(`攻略文件加载成功: ${file}`);
        } catch (e) {
          console.error(`读取攻略文件失败: ${file}`, e);
        }
      }
    }
    
    console.log(`共加载 ${guideFiles.size} 个攻略文件`);
  } catch (e) {
    console.error('读取攻略文件夹失败:', e);
  }
}

// ========== 公开 API 路由 ==========

// 获取所有卡牌数据（兼容旧格式）
app.get('/api/cards', async (req, res) => {
  try {
    const cards = await getAllCards();
    // 转换为前端期望的格式
    const formatted = {};
    for (const [charId, charCards] of Object.entries(cards)) {
      formatted[charId] = charCards.map(c => ({
        id: c.id,
        name: c.name,
        nameEn: c.name_en,
        cost: c.cost === -1 ? 'X' : c.cost,
        type: c.type,
        typeEn: c.type_en,
        rarity: c.rarity,
        rarityEn: c.rarity_en,
        description: c.description,
        meta: c.meta || {}
      }));
    }
    res.json(formatted);
  } catch (error) {
    console.error('获取卡牌失败:', error);
    res.status(500).json({ error: '数据库读取失败: ' + error.message });
  }
});

// 获取特定角色的卡牌
app.get('/api/cards/:character', async (req, res) => {
  try {
    const { character } = req.params;
    const cards = await getCardsByCharacter(character);
    const formatted = cards.map(c => ({
      id: c.id,
      name: c.name,
      nameEn: c.name_en,
      cost: c.cost === -1 ? 'X' : c.cost,
      type: c.type,
      typeEn: c.type_en,
      rarity: c.rarity,
      rarityEn: c.rarity_en,
      description: c.description,
      meta: c.meta || {}
    }));
    res.json(formatted);
  } catch (error) {
    console.error('获取角色卡牌失败:', error);
    res.status(500).json({ error: '数据库读取失败: ' + error.message });
  }
});

// 获取所有遗物数据（兼容旧格式）
app.get('/api/relics', async (req, res) => {
  try {
    const relics = await getAllRelics();
    // 转换为前端期望的格式
    const formatted = {};
    for (const [category, items] of Object.entries(relics)) {
      formatted[category] = items.map(r => ({
        id: r.id,
        name: r.name,
        nameEn: r.name_en,
        rarity: r.rarity,
        description: r.description,
        flavor: r.flavor || '',
        character: r.character_id,
        meta: r.meta || {}
      }));
    }
    res.json(formatted);
  } catch (error) {
    console.error('获取遗物失败:', error);
    res.status(500).json({ error: '数据库读取失败: ' + error.message });
  }
});

// 获取角色列表（新接口）
app.get('/api/characters', async (req, res) => {
  try {
    const characters = await getAllCharacters();
    const formatted = characters.map(c => ({
      id: c.id,
      name: c.name,
      nameEn: c.name_en,
      color: c.color,
      bgColor: c.bg_color,
      sortOrder: c.sort_order
    }));
    res.json(formatted);
  } catch (error) {
    console.error('获取角色列表失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取所有Buff数据
app.get('/api/buffs', async (req, res) => {
  try {
    const buffs = await getAllBuffs();
    // 转换为前端期望的格式（按类型分组，保持兼容）
    const formatted = { buff: [], debuff: [] };
    for (const b of buffs) {
      const item = {
        id: b.id,
        name: b.name,
        nameEn: b.name_en,
        target: b.target,
        type: b.type,
        description: b.description,
        details: b.details || '',
        stackable: b.stackable === 1,
        meta: b.meta || {}
      };
      if (b.type === 'debuff') {
        formatted.debuff.push(item);
      } else {
        formatted.buff.push(item);
      }
    }
    res.json(formatted);
  } catch (error) {
    console.error('获取Buff失败:', error);
    res.status(500).json({ error: '数据库读取失败: ' + error.message });
  }
});

// 获取所有敌人数据
app.get('/api/enemies', async (req, res) => {
  try {
    const enemies = await getAllEnemies();
    // 转换为前端期望的格式
    const formatted = {};
    for (const [category, items] of Object.entries(enemies)) {
      formatted[category] = items.map(e => ({
        id: e.id,
        name: e.name,
        nameEn: e.name_en,
        category: e.category,
        description: e.description,
        details: e.details,
        meta: e.meta || {}
      }));
    }
    res.json(formatted);
  } catch (error) {
    console.error('获取敌人失败:', error);
    res.status(500).json({ error: '数据库读取失败: ' + error.message });
  }
});

// 获取所有概念/术语数据
app.get('/api/concepts', async (req, res) => {
  try {
    const concepts = await getAllConcepts();
    // 转换为前端期望的格式
    const formatted = {};
    for (const [category, items] of Object.entries(concepts)) {
      formatted[category] = items.map(c => ({
        id: c.id,
        name: c.name,
        nameEn: c.name_en,
        description: c.description,
        category: c.category,
        meta: c.meta || {}
      }));
    }
    res.json(formatted);
  } catch (error) {
    console.error('获取概念失败:', error);
    res.status(500).json({ error: '数据库读取失败: ' + error.message });
  }
});

// 获取游戏知识库
app.get('/api/knowledge', (req, res) => {
  res.json({ knowledge: gameKnowledge });
});

// 获取构筑方法论
app.get('/api/methodology', (req, res) => {
  res.json({ methodology: buildMethodology });
});

// 获取可用的知识库选项
app.get('/api/knowledge-options', async (req, res) => {
  try {
    const characters = await getAllCharacters();
    const options = {
      characters: characters.map(c => ({
        id: c.id,
        name: c.name,
        nameEn: c.name_en,
        color: c.color,
        bgColor: c.bg_color
      })),
      hasRelics: true,
      hasMethodology: !!buildMethodology,
      hasGameKnowledge: !!gameKnowledge,
      guideFiles: Array.from(guideFiles.keys())
    };
    res.json(options);
  } catch (error) {
    console.error('获取知识库选项失败:', error);
    res.status(500).json({ error: '数据库读取失败: ' + error.message });
  }
});

// ========== 管理后台 API 路由 ==========

// 角色管理
app.get('/api/admin/characters', async (req, res) => {
  try {
    const characters = await getAllCharacters();
    res.json(characters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/characters', async (req, res) => {
  try {
    const character = await createCharacter(req.body);
    res.json(character);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/characters/:id', async (req, res) => {
  try {
    const character = await updateCharacter(req.params.id, req.body);
    res.json(character);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/characters/:id', async (req, res) => {
  try {
    await deleteCharacter(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 卡牌管理
app.get('/api/admin/cards', async (req, res) => {
  try {
    const cards = await getAllCards();
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/cards', async (req, res) => {
  try {
    const card = await createCard(req.body);
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/cards/:id', async (req, res) => {
  try {
    const card = await updateCard(req.params.id, req.body);
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/cards/:characterId/:id', async (req, res) => {
  try {
    await deleteCard(req.params.id, req.params.characterId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 遗物管理
app.get('/api/admin/relics', async (req, res) => {
  try {
    const relics = await getAllRelics();
    res.json(relics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/relics', async (req, res) => {
  try {
    const relic = await createRelic(req.body);
    res.json(relic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/relics/:id', async (req, res) => {
  try {
    const relic = await updateRelic(req.params.id, req.body);
    res.json(relic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/relics/:id', async (req, res) => {
  try {
    await deleteRelic(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buffs管理
app.get('/api/admin/buffs', async (req, res) => {
  try {
    const buffs = await getAllBuffs();
    res.json(buffs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/buffs', async (req, res) => {
  try {
    const buff = await createBuff(req.body);
    res.json(buff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/buffs/:id', async (req, res) => {
  try {
    const buff = await updateBuff(req.params.id, req.body);
    res.json(buff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/buffs/:id', async (req, res) => {
  try {
    await deleteBuff(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enemies管理
app.get('/api/admin/enemies', async (req, res) => {
  try {
    const enemies = await getAllEnemies();
    res.json(enemies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/enemies', async (req, res) => {
  try {
    const enemy = await createEnemy(req.body);
    res.json(enemy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/enemies/:id', async (req, res) => {
  try {
    const enemy = await updateEnemy(req.params.id, req.body);
    res.json(enemy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/enemies/:id', async (req, res) => {
  try {
    await deleteEnemy(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 药水管理
app.get('/api/admin/potions', async (req, res) => {
  try {
    const potions = await getAllPotions();
    res.json(potions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/potions', async (req, res) => {
  try {
    const potion = await createPotion(req.body);
    res.json(potion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/potions/:id', async (req, res) => {
  try {
    const potion = await updatePotion(req.params.id, req.body);
    res.json(potion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/potions/:id', async (req, res) => {
  try {
    await deletePotion(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 概念/术语管理
app.get('/api/admin/concepts', async (req, res) => {
  try {
    const concepts = await getAllConcepts();
    res.json(concepts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/concepts', async (req, res) => {
  try {
    const concept = await createConcept(req.body);
    res.json(concept);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/concepts/:id', async (req, res) => {
  try {
    const concept = await updateConcept(req.params.id, req.body);
    res.json(concept);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/concepts/:id', async (req, res) => {
  try {
    await deleteConcept(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 从JSON导入数据（增量导入，不会清空现有数据）
app.post('/api/admin/import', async (req, res) => {
  try {
    const { clearExisting = false } = req.body;
    const dataDir = path.join(__dirname, '../data');
    
    // 导入cards（如果存在）
    let cardsResult = { success: true, count: 0, updated: 0 };
    try {
      const cardsJson = JSON.parse(await fs.readFile(path.join(dataDir, 'cards.json'), 'utf-8'));
      cardsResult = await importCardsFromJson(cardsJson, clearExisting);
      cardsData = await getAllCards();
    } catch (e) {
      console.log('cards.json 不存在或导入失败，跳过');
    }
    
    // 导入relics（如果存在）
    let relicsResult = { success: true, count: 0, updated: 0 };
    try {
      const relicsJson = JSON.parse(await fs.readFile(path.join(dataDir, 'relics.json'), 'utf-8'));
      relicsResult = await importRelicsFromJson(relicsJson, clearExisting);
      relicsData = await getAllRelics();
    } catch (e) {
      console.log('relics.json 不存在或导入失败，跳过');
    }
    
    // 导入buffs（如果存在）
    let buffsResult = { success: true, count: 0, updated: 0 };
    try {
      const buffsJson = JSON.parse(await fs.readFile(path.join(dataDir, 'buffs.json'), 'utf-8'));
      buffsResult = await importBuffsFromJson(buffsJson, clearExisting);
      buffsData = await getAllBuffs();
    } catch (e) {
      console.log('buffs.json 不存在或导入失败，跳过');
    }
    
    // 导入enemies（如果存在）
    let enemiesResult = { success: true, count: 0, updated: 0 };
    try {
      const enemiesJson = JSON.parse(await fs.readFile(path.join(dataDir, 'enemies.json'), 'utf-8'));
      enemiesResult = await importEnemiesFromJson(enemiesJson, clearExisting);
      enemiesData = await getAllEnemies();
    } catch (e) {
      console.log('enemies.json 不存在或导入失败，跳过');
    }
    
    // 导入potions（如果存在）
    let potionsResult = { success: true, count: 0, updated: 0 };
    try {
      const potionsJson = JSON.parse(await fs.readFile(path.join(dataDir, 'potions.json'), 'utf-8'));
      potionsResult = await importPotionsFromJson(potionsJson, clearExisting);
    } catch (e) {
      console.log('potions.json 不存在或导入失败，跳过');
    }
    
    // 导入concepts（如果存在）
    let conceptsResult = { success: true, count: 0, updated: 0 };
    try {
      const conceptsJson = JSON.parse(await fs.readFile(path.join(dataDir, 'concepts.json'), 'utf-8'));
      conceptsResult = await importConceptsFromJson(conceptsJson, clearExisting);
    } catch (e) {
      console.log('concepts.json 不存在或导入失败，跳过');
    }
    
    res.json({ 
      cards: cardsResult, 
      relics: relicsResult, 
      buffs: buffsResult, 
      enemies: enemiesResult,
      potions: potionsResult,
      concepts: conceptsResult,
      clearExisting
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 管理页面
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// ========== 分析相关路由 ==========

app.post('/api/analyze', async (req, res) => {
  try {
    const { deck, relics, character, apiConfig, knowledgeOptions, conversationId, userMessage, isFollowUp, customSystemPrompt } = req.body;
    
    const convId = conversationId || generateConversationId();
    let history = conversationHistory.get(convId) || [];
    
    const context = await buildAnalysisContext(deck, relics, character, knowledgeOptions, isFollowUp, analysisType, customSystemPrompt);
    console.log('Context after await, knowledgeBases:', context.knowledgeBases?.length || 0);
    
    const analysis = await callLLM(context, apiConfig, history, userMessage, isFollowUp);
    
    if (userMessage) {
      history.push({ role: 'user', content: userMessage });
    }
    history.push({ role: 'assistant', content: analysis });
    
    if (history.length > 40) {
      history = history.slice(-40);
    }
    
    conversationHistory.set(convId, history);
    
    res.json({ analysis, conversationId: convId });
  } catch (error) {
    console.error('分析失败:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze-stream', async (req, res) => {
  try {
    const { deck, relics, character, apiConfig, knowledgeOptions, conversationId, userMessage, isFollowUp, analysisType, customSystemPrompt } = req.body;
    
    console.log('\n=== /api/analyze-stream called ===');
    console.log('Received knowledgeOptions:', JSON.stringify(knowledgeOptions, null, 2));
    console.log('selectedGuides:', knowledgeOptions?.selectedGuides);
    console.log('characterCards:', knowledgeOptions?.characterCards);
    console.log('allRelics:', knowledgeOptions?.allRelics);
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    
    const convId = conversationId || generateConversationId();
    let history = conversationHistory.get(convId) || [];
    
    const context = await buildAnalysisContext(deck, relics, character, knowledgeOptions, isFollowUp, analysisType, customSystemPrompt);
    console.log('Context after await (stream), knowledgeBases:', context.knowledgeBases?.length || 0);
    
    res.write(`data: ${JSON.stringify({ type: 'init', conversationId: convId })}\n\n`);
    
    const fullContent = await callLLMStream(context, apiConfig, history, userMessage, isFollowUp, 
      (chunk) => {
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      },
      (thinking) => {
        res.write(`data: ${JSON.stringify({ type: 'thinking', content: thinking })}\n\n`);
      }
    );
    
    if (userMessage) {
      history.push({ role: 'user', content: userMessage });
    }
    history.push({ role: 'assistant', content: fullContent });
    
    if (history.length > 40) {
      history = history.slice(-40);
    }
    
    conversationHistory.set(convId, history);
    
    res.write(`data: ${JSON.stringify({ type: 'done', conversationId: convId })}\n\n`);
    res.end();
    
  } catch (error) {
    console.error('流式分析失败:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
});

app.get('/api/conversation/:id', (req, res) => {
  const history = conversationHistory.get(req.params.id) || [];
  res.json({ history });
});

app.delete('/api/conversation/:id', (req, res) => {
  conversationHistory.delete(req.params.id);
  res.json({ success: true });
});

function generateConversationId() {
  return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

async function buildAnalysisContext(deck, relics, character, knowledgeOptions = {}, isFollowUp = false, analysisType = 'deck', customSystemPrompt = null) {
  console.log('buildAnalysisContext called with knowledgeOptions:', JSON.stringify(knowledgeOptions, null, 2));
  console.log('guideFiles size:', guideFiles.size);
  console.log('guideFiles keys:', Array.from(guideFiles.keys()));
  console.log('analysisType:', analysisType);
  console.log('customSystemPrompt:', customSystemPrompt ? 'provided' : 'not provided');
  
  const context = {
    character,
    isFollowUp,
    analysisType,
    deckSize: deck.length,
    customSystemPrompt
  };
  
  // 只要 sendDeckInfo 不为 false，就发送卡组信息（即使是 follow-up 也发送）
  console.log('sendDeckInfo check:', knowledgeOptions.sendDeckInfo, 'isFollowUp:', isFollowUp);
  if (knowledgeOptions.sendDeckInfo !== false) {
    console.log('Building deck details, deck length:', deck.length, 'relics length:', relics.length);
    const deckDetails = [];
    for (const cardId of deck) {
      const card = await getCardById(cardId);
      if (card) {
        deckDetails.push(`${card.name}(${card.name_en}) [${card.cost === -1 ? 'X' : card.cost}费 ${card.type}]: ${card.description}`);
      } else {
        deckDetails.push(cardId);
      }
    }
    
    const relicDetails = [];
    for (const relicId of relics) {
      const relic = await getRelicById(relicId);
      if (relic) {
        relicDetails.push(`${relic.name}(${relic.name_en}): ${relic.description}`);
      } else {
        relicDetails.push(relicId);
      }
    }
    
    context.deck = deckDetails;
    context.relics = relicDetails;
    console.log('Deck details built:', deckDetails.length, 'cards,', relicDetails.length, 'relics');
  } else {
    console.log('Skipping deck details (sendDeckInfo is false)');
  }
  
  context.knowledgeBases = [];
  
  if (knowledgeOptions.selectedGuides && knowledgeOptions.selectedGuides.length > 0) {
    console.log('Processing selectedGuides:', knowledgeOptions.selectedGuides);
    for (const fileName of knowledgeOptions.selectedGuides) {
      // howtobuild_en.txt 作为 methodology 单独处理，跳过普通文件处理
      if (fileName === 'howtobuild_en.txt') continue;
      
      console.log('Checking file:', fileName, 'exists:', guideFiles.has(fileName));
      if (guideFiles.has(fileName)) {
        const content = guideFiles.get(fileName);
        console.log('Adding guide file:', fileName, 'content length:', content.length);
        context.knowledgeBases.push({
          name: fileName,
          content: content,
          isGuideFile: true
        });
      }
    }
  }
  
  // 如果用户勾选了 howtobuild_en.txt，将 methodology 加入知识库
  if (knowledgeOptions.selectedGuides && knowledgeOptions.selectedGuides.includes('howtobuild_en.txt') && buildMethodology) {
    console.log('Adding methodology from howtobuild_en.txt');
    context.knowledgeBases.push({
      name: '构筑方法论',
      content: buildMethodology,
      isMethodology: true
    });
  }
  
  if (knowledgeOptions.gameKnowledge === true && gameKnowledge) {
    context.knowledgeBases.push({
      name: '游戏基础知识',
      content: gameKnowledge
    });
  }
  
  if (knowledgeOptions.characterCards && knowledgeOptions.characterCards.length > 0) {
    console.log('Processing characterCards:', knowledgeOptions.characterCards);
    const characterCards = [];
    const allCards = await getAllCards();
    
    for (const charId of knowledgeOptions.characterCards) {
      if (allCards[charId]) {
        characterCards.push({
          character: charId,
          cards: allCards[charId].map(c => `${c.name_en} [${c.cost === -1 ? 'X' : c.cost}费 ${c.type_en}]: ${c.description}`).join('\n')
        });
      }
    }
    
    if (characterCards.length > 0) {
      context.knowledgeBases.push({
        name: '角色全卡牌库',
        content: characterCards.map(cc => `=== ${cc.character} ===\n${cc.cards}`).join('\n\n')
      });
      console.log('Added character cards for:', characterCards.map(c => c.character).join(', '));
    }
  }
  
  if (knowledgeOptions.allRelics === true) {
    console.log('Adding all relics database');
    const allRelics = await getAllRelics();
    const relicList = [];
    for (const [category, items] of Object.entries(allRelics)) {
      for (const r of items) {
        relicList.push(`[${category}] ${r.name_en}: ${r.description}`);
      }
    }
    context.knowledgeBases.push({
      name: '全遗物数据库',
      content: relicList.join('\n')
    });
  }
  
  console.log('Final knowledgeBases count:', context.knowledgeBases.length);
  console.log('Final knowledgeBases names:', context.knowledgeBases.map(kb => kb.name).join(', '));
  
  return context;
}

async function callLLM(context, apiConfig, history = [], userMessage = null, isFollowUp = false) {
  let { apiUrl, apiKey, model, preset } = apiConfig;

  const isGoogle = preset === 'google' || apiUrl.includes('generativelanguage.googleapis.com');
  const isClaude = preset === 'claude' || apiUrl.includes('anthropic.com');

  if (isGoogle) {
    if (!apiUrl.includes('/models/')) {
      apiUrl = `${apiUrl.replace(/\/$/, '')}/models/${model}:streamGenerateContent?key=${apiKey}`;
    }
  } else if (isClaude) {
    if (!apiUrl.endsWith('/messages')) {
      apiUrl = apiUrl.replace(/\/$/, '') + '/messages';
    }
  } else {
    if (!apiUrl.endsWith('/chat/completions')) {
      apiUrl = apiUrl.replace(/\/$/, '') + '/chat/completions';
    }
  }

  console.log('Calling LLM API:', apiUrl);
  console.log('Using model:', model);
  console.log('Is follow-up:', isFollowUp);

  const systemPrompt = buildSystemPrompt(context);
  
  const messages = [
    {
      role: 'system',
      content: systemPrompt
    }
  ];
  
  const recentHistory = history.slice(-20);
  messages.push(...recentHistory);
  
  if (isFollowUp && userMessage) {
    messages.push({
      role: 'user',
      content: userMessage
    });
  } else {
    messages.push({
      role: 'user',
      content: buildInitialPrompt(context)
    });
  }

  let temperature = 0.7;
  if (model && model.includes('kimi')) {
    temperature = 1;
  }

  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    let requestBody;

    if (isGoogle) {
      const contents = [];
      if (systemPrompt) {
        contents.push({
          role: 'user',
          parts: [{ text: `System: ${systemPrompt}` }]
        });
      }
      recentHistory.forEach(msg => {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      });
      if (isFollowUp && userMessage) {
        contents.push({
          role: 'user',
          parts: [{ text: userMessage }]
        });
      } else {
        contents.push({
          role: 'user',
          parts: [{ text: buildInitialPrompt(context) }]
        });
      }
      requestBody = { contents };
    } else if (isClaude) {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';

      const claudeMessages = [...recentHistory];
      if (isFollowUp && userMessage) {
        claudeMessages.push({ role: 'user', content: userMessage });
      } else {
        claudeMessages.push({ role: 'user', content: buildInitialPrompt(context) });
      }

      requestBody = {
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages: claudeMessages
      };
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
      requestBody = {
        model: model || 'moonshot-v1-8k',
        messages: messages,
        temperature: temperature
      };
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API Error Response:', errorText);
      throw new Error(`LLM API调用失败: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('LLM API Response received');

    let content;
    if (isGoogle) {
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        content = data.candidates[0].content.parts[0].text;
      }
    } else if (isClaude) {
      if (data.content && data.content[0]) {
        content = data.content[0].text;
      }
    } else {
      if (data.choices && data.choices[0] && data.choices[0].message) {
        content = data.choices[0].message.content;
      }
    }

    if (!content) {
      console.error('Invalid API response structure:', data);
      throw new Error('API返回数据格式错误');
    }

    return content;
  } catch (error) {
    console.error('LLM API call error:', error);
    throw error;
  }
}

async function callLLMStream(context, apiConfig, history = [], userMessage = null, isFollowUp = false, onChunk, onThinking) {
  console.log('\n=== callLLMStream ===');
  console.log('context.knowledgeBases in callLLMStream:', context.knowledgeBases?.length || 0);
  
  let { apiUrl, apiKey, model, preset } = apiConfig;

  const isGoogle = preset === 'google' || apiUrl.includes('generativelanguage.googleapis.com');
  const isClaude = preset === 'claude' || apiUrl.includes('anthropic.com');

  if (isGoogle) {
    if (!apiUrl.includes('/models/')) {
      apiUrl = `${apiUrl.replace(/\/$/, '')}/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
    }
  } else if (isClaude) {
    if (!apiUrl.endsWith('/messages')) {
      apiUrl = apiUrl.replace(/\/$/, '') + '/messages';
    }
  } else {
    if (!apiUrl.endsWith('/chat/completions')) {
      apiUrl = apiUrl.replace(/\/$/, '') + '/chat/completions';
    }
  }

  console.log('Calling LLM API (stream):', apiUrl);
  console.log('Using model:', model);

  const systemPrompt = buildSystemPrompt(context);
  console.log('System prompt length:', systemPrompt.length);
  console.log('System prompt preview:', systemPrompt.substring(0, 500) + '...');
  
  const messages = [
    {
      role: 'system',
      content: systemPrompt
    }
  ];
  
  const recentHistory = history.slice(-20);
  messages.push(...recentHistory);
  
  if (isFollowUp && userMessage) {
    messages.push({
      role: 'user',
      content: userMessage
    });
  } else {
    messages.push({
      role: 'user',
      content: buildInitialPrompt(context)
    });
  }

  let temperature = 0.7;
  if (model && model.includes('kimi')) {
    temperature = 1;
  }

  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    let requestBody;

    if (isGoogle) {
      const contents = [];
      if (systemPrompt) {
        contents.push({
          role: 'user',
          parts: [{ text: `System: ${systemPrompt}` }]
        });
      }
      recentHistory.forEach(msg => {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      });
      if (isFollowUp && userMessage) {
        contents.push({
          role: 'user',
          parts: [{ text: userMessage }]
        });
      } else {
        contents.push({
          role: 'user',
          parts: [{ text: buildInitialPrompt(context) }]
        });
      }
      requestBody = { contents };
    } else if (isClaude) {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';

      const claudeMessages = [...recentHistory];
      if (isFollowUp && userMessage) {
        claudeMessages.push({ role: 'user', content: userMessage });
      } else {
        claudeMessages.push({ role: 'user', content: buildInitialPrompt(context) });
      }

      requestBody = {
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages: claudeMessages,
        stream: true
      };
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
      requestBody = {
        model: model || 'moonshot-v1-8k',
        messages: messages,
        temperature: temperature,
        stream: true
      };
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API Error Response:', errorText);
      throw new Error(`LLM API调用失败: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);

            let deltaContent = null;

            if (isGoogle) {
              if (parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content) {
                deltaContent = parsed.candidates[0].content.parts[0].text;
              }
            } else if (isClaude) {
              if (parsed.type === 'content_block_delta' && parsed.delta && parsed.delta.text) {
                deltaContent = parsed.delta.text;
              }
            } else {
              if (parsed.choices && parsed.choices[0]) {
                const delta = parsed.choices[0].delta;
                if (delta && delta.content) {
                  deltaContent = delta.content;
                }
              }
            }

            if (deltaContent) {
              buffer += deltaContent;
              fullContent += deltaContent;
                
              let outputContent = '';
              let thinkingContent = '';
              let inThinking = false;
              let i = 0;
              
              while (i < buffer.length) {
                if (!inThinking) {
                  const thinkStart = buffer.indexOf('<thinking>', i);
                  if (thinkStart === -1) {
                    outputContent += buffer.slice(i);
                    break;
                  } else {
                    outputContent += buffer.slice(i, thinkStart);
                    i = thinkStart + 10;
                    inThinking = true;
                  }
                } else {
                  const thinkEnd = buffer.indexOf('</thinking>', i);
                  if (thinkEnd === -1) {
                    thinkingContent += buffer.slice(i);
                    break;
                  } else {
                    thinkingContent += buffer.slice(i, thinkEnd);
                    i = thinkEnd + 11;
                    inThinking = false;
                  }
                }
              }
              
              buffer = inThinking ? (thinkingContent ? '<thinking>' + thinkingContent : '<thinking>') : '';
              
              if (outputContent) {
                onChunk(outputContent);
              }
              
              if (thinkingContent || inThinking) {
                const fullThinking = inThinking ? thinkingContent : thinkingContent;
                onThinking(fullThinking);
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    return fullContent;
  } catch (error) {
    console.error('LLM API stream error:', error);
    throw error;
  }
}

function buildSystemPrompt(context) {
  console.log('buildSystemPrompt called with knowledgeBases count:', context.knowledgeBases?.length || 0);
  console.log('context.knowledgeBases exists:', !!context.knowledgeBases);
  console.log('context.knowledgeBases.length:', context.knowledgeBases?.length);
  
  // 判断是否为战斗分析
  const isBattleAnalysis = context.analysisType === 'battle';
  
  if (isBattleAnalysis) {
    // 使用用户自定义的系统提示词（如果提供），否则使用默认战斗专家提示词
    let prompt = context.customSystemPrompt || `你是杀戮尖塔（Slay the Spire）的顶级战斗策略专家，擅长分析具体战斗局势并给出最优出牌建议。`;
    
    if (context.knowledgeBases && context.knowledgeBases.length > 0) {
      prompt += `\n\n=== 知识库参考 ===\n\n`;
      for (const kb of context.knowledgeBases) {
        if (kb.isGuideFile) {
          prompt += `【${kb.name}】\n${kb.content}\n----------\n`;
        } else {
          prompt += `\n--- ${kb.name} ---\n${kb.content}\n`;
        }
      }
    }
    
    prompt += `\n\n=== 战斗分析准则 ===
请严格遵循以下方法论进行战斗分析：

1. **局势评估**：分析当前生命值、能量、格挡、Buff/Debuff状态
2. **敌人意图分析**：解读敌人意图，预测伤害类型和数值
3. **出牌优先级**：基于能量效率和战斗目标确定出牌顺序
4. **防御策略**：评估是否需要保留防御牌，计算所需格挡值
5. **伤害计算**：计算本回合可造成的伤害，评估能否击杀敌人
6. **资源管理**：考虑抽牌、弃牌、消耗对后续回合的影响
7. **风险评估**：权衡激进打法和保守打法的风险收益
8. **遗物和药水**：充分利用当前遗物效果和可用药水

分析风格要求：直接、实用、可执行的具体操作建议。`;
    
    return prompt;
  }
  
  // 卡组构筑分析（默认）
  // 使用用户自定义的系统提示词（如果提供），否则使用默认提示词
  let prompt = context.customSystemPrompt || `你是杀戮尖塔（Slay the Spire）构筑助手。`;
  
  if (context.knowledgeBases && context.knowledgeBases.length > 0) {
    console.log('Adding knowledge bases to system prompt');
    // 如果有自定义提示词，在其后附加知识库标识；否则使用默认的专家提示词
    if (!context.customSystemPrompt) {
      prompt = `你是杀戮尖塔（Slay the Spire）的顶级构筑分析专家，拥有深厚的游戏理解和数据分析能力。`;
    }
    prompt += `\n\n=== 知识库参考 ===\n\n`;
    
    for (const kb of context.knowledgeBases) {
      if (kb.isGuideFile) {
        prompt += `【${kb.name}】\n${kb.content}\n----------\n`;
      } else {
        prompt += `\n--- ${kb.name} ---\n${kb.content}\n`;
      }
    }
    
    prompt += `\n\n=== 分析准则 ===
请严格遵循以下方法论进行分析：

1. **卡组精简评估**：检查卡组规模是否在舒适区（15-25张），识别需要移除的基础牌或过渡牌
2. **核心机制识别**：判断构筑围绕1-2个核心机制构建，评估协同密度
3. **能量曲线分析**：评估金字塔结构（0-1费60-70%，2费25-35%，3+费<10%）
4. **Scaling能力**：判断后期成长性（线性vs指数增长）
5. **启动与循环**：评估首回合可用性、抽牌一致性、是否具备无限循环潜力
6. **攻防平衡**：检查伤害效率（DPE）与伤害减免（MPT）的平衡
7. **遗物协同**：分析遗物与卡组的契合度
8. **针对性对策**：评估对特定敌人（如Gremlin Nob、Time Eater）的应对能力

分析风格要求：专业、数据驱动、 actionable建议。`;
  }

  return prompt;
}

function buildInitialPrompt(context) {
  console.log('buildInitialPrompt called, deck:', context.deck?.length || 0, 'cards', 'analysisType:', context.analysisType);
  
  // 判断是否为战斗分析
  const isBattleAnalysis = context.analysisType === 'battle';
  
  if (isBattleAnalysis) {
    // 战斗分析 - 直接使用 context.userMessage 作为提示词
    let prompt = '';
    
    // 如果有知识库，先添加知识库内容到用户消息中
    if (context.knowledgeBases && context.knowledgeBases.length > 0) {
      prompt += `=== 以下是我的知识库参考，请基于这些知识进行分析 ===\n\n`;
      for (const kb of context.knowledgeBases) {
        prompt += `【${kb.name}】\n${kb.content}\n\n`;
      }
      prompt += `=== 知识库结束 ===\n\n`;
    }
    
    // 添加用户的问题（包含完整的战斗状态）
    if (context.userMessage) {
      prompt += context.userMessage;
    } else {
      prompt += `请分析当前战斗局势并给出出牌建议。`;
    }
    
    prompt += `\n\n请基于以上战斗信息，提供：
1. **局势分析**：当前回合的敌我状态评估
2. **出牌建议**：具体的出牌顺序和理由
3. **策略考虑**：可能的备选方案和风险评估
4. **后续规划**：对下一回合的影响和准备

请给出直接可执行的战斗建议。`;
    
    return prompt;
  }
  
  // 卡组构筑分析（默认）
  if (!context.deck || context.deck.length === 0) {
    console.log('No deck found in context, returning generic prompt');
    return `请回答关于杀戮尖塔的问题。`;
  }
  
  let prompt = '';
  
  // 如果有知识库，先添加知识库内容到用户消息中
  if (context.knowledgeBases && context.knowledgeBases.length > 0) {
    prompt += `=== 以下是我的知识库参考，请基于这些知识进行分析 ===\n\n`;
    for (const kb of context.knowledgeBases) {
      prompt += `【${kb.name}】\n${kb.content}\n\n`;
    }
    prompt += `=== 知识库结束 ===\n\n`;
  }
  
  prompt += `请分析以下${context.character}构筑：\n\n`;
  
  prompt += `卡组大小：${context.deckSize}张\n\n`;
  
  prompt += `卡牌列表：\n${context.deck.join('\n')}\n\n`;
  
  if (context.relics && context.relics.length > 0) {
    prompt += `遗物列表：\n${context.relics.join('\n')}\n\n`;
  }
  
  prompt += `请从以下维度进行专业分析：

## 1. 构筑定位与核心策略
- 识别主要流派（力量流/护甲流/消耗流/毒伤流/匕首流等）
- 核心Combo与启动条件
- 游戏阶段定位（前期过渡/中期成型/后期Scaling）

## 2. 卡牌质量评估
- 关键卡牌识别（核心引擎/倍增机制/终结手段）
- 冗余与低效卡牌
- 缺失的关键组件

## 3. 能量与费用结构
- 能量曲线分布评价
- 高费卡牌支撑机制
- 0费循环潜力

## 4. 攻防体系分析
- 伤害输出效率（DPE评估）
- 防御稳定性（格挡来源/持续性）
- 生命管理与风险承担

## 5. 遗物协同评估
- 遗物与构筑的契合度
- 关键遗物缺失建议
- 遗物驱动的策略调整

## 6. 改进建议（优先级排序）
- 立即移除的卡牌
- 优先获取的卡牌
- 路线与事件选择建议

## 7. 对局策略指南
- 通用出牌优先级
- 关键回合决策
- 特定敌人应对（精英/Boss）

请给出详细、专业、可操作的分析。`;

  return prompt;
}

// ========== 静态文件托管 - 前端页面（必须在 API 路由之后） ==========

// 卡组构建页面 -> /deck
app.use('/deck', express.static(path.join(__dirname, 'public', 'deck')));

// 战斗界面 -> /battle  
app.use('/battle', express.static(path.join(__dirname, 'public', 'battle')));

// 首页 - 导航页面（必须在最后，因为是根路径）
app.use('/', express.static(path.join(__dirname, 'public')));

// 启动服务器
async function startServer() {
  // 初始化数据库
  await initDatabase();
  
  // 加载游戏数据
  await loadGameData();

  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`管理后台: http://localhost:${PORT}/admin`);
  });
}

startServer();
