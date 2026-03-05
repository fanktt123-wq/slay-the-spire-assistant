import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../data/game.db');

// 打开数据库连接
export async function openDb() {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
}

// 初始化数据库表结构
export async function initDatabase() {
  const db = await openDb();
  
  try {
    // 创建角色/分类表
    await db.exec(`
      CREATE TABLE IF NOT EXISTS characters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_en TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT '#7f8c8d',
        bg_color TEXT NOT NULL DEFAULT '#4a4a4a',
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建卡牌表（使用自增ID作为主键，card_id和character_id组合作为唯一约束）
    await db.exec(`
      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id TEXT NOT NULL,
        name TEXT NOT NULL,
        name_en TEXT NOT NULL,
        character_id TEXT NOT NULL,
        cost INTEGER DEFAULT 0,
        type TEXT NOT NULL,
        type_en TEXT NOT NULL,
        rarity TEXT NOT NULL,
        rarity_en TEXT NOT NULL,
        description TEXT NOT NULL,
        meta_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
        UNIQUE(card_id, character_id)
      )
    `);

    // 创建遗物表
    await db.exec(`
      CREATE TABLE IF NOT EXISTS relics (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_en TEXT NOT NULL,
        rarity TEXT NOT NULL,
        description TEXT NOT NULL,
        flavor TEXT,
        character_id TEXT,
        is_boss BOOLEAN DEFAULT 0,
        is_event BOOLEAN DEFAULT 0,
        is_shop BOOLEAN DEFAULT 0,
        meta_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE SET NULL
      )
    `);

    // 创建meta信息表（用于存储额外的可配置属性）
    await db.exec(`
      CREATE TABLE IF NOT EXISTS meta_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT,
        description TEXT,
        UNIQUE(category, key)
      )
    `);

    // 创建buffs表（增益/减益效果）
    await db.exec(`
      CREATE TABLE IF NOT EXISTS buffs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_en TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        details TEXT,
        stackable BOOLEAN DEFAULT 0,
        meta_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建enemies表（敌人数据）
    await db.exec(`
      CREATE TABLE IF NOT EXISTS enemies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_en TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        details TEXT NOT NULL,
        meta_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建potions表（药水数据）
    await db.exec(`
      CREATE TABLE IF NOT EXISTS potions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_en TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 插入默认角色数据（如果表为空）
    const count = await db.get('SELECT COUNT(*) as count FROM characters');
    if (count.count === 0) {
      await insertDefaultCharacters(db);
    }

    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// 插入默认角色
async function insertDefaultCharacters(db) {
  const defaultCharacters = [
    { id: 'ironclad', name: '铁甲战士', name_en: 'Ironclad', color: '#c0392b', bg_color: '#8b2635', sort_order: 1 },
    { id: 'silent', name: '静默猎手', name_en: 'Silent', color: '#27ae60', bg_color: '#1e5c3a', sort_order: 2 },
    { id: 'defect', name: '故障机器人', name_en: 'Defect', color: '#2980b9', bg_color: '#1a3a52', sort_order: 3 },
    { id: 'watcher', name: '观者', name_en: 'Watcher', color: '#8e44ad', bg_color: '#5d2e75', sort_order: 4 },
    { id: 'colorless', name: '无色', name_en: 'Colorless', color: '#7f8c8d', bg_color: '#4a4a4a', sort_order: 5 },
    { id: 'curse', name: '诅咒', name_en: 'Curse', color: '#2c3e50', bg_color: '#1a1a2e', sort_order: 6 }
  ];

  const stmt = await db.prepare(`
    INSERT INTO characters (id, name, name_en, color, bg_color, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const char of defaultCharacters) {
    await stmt.run(char.id, char.name, char.name_en, char.color, char.bg_color, char.sort_order);
  }

  await stmt.finalize();
  console.log('默认角色数据已插入');
}

// ==================== 角色/分类 CRUD ====================

export async function getAllCharacters() {
  const db = await openDb();
  try {
    return await db.all('SELECT * FROM characters ORDER BY sort_order');
  } finally {
    await db.close();
  }
}

export async function getCharacterById(id) {
  const db = await openDb();
  try {
    return await db.get('SELECT * FROM characters WHERE id = ?', id);
  } finally {
    await db.close();
  }
}

export async function createCharacter(character) {
  const db = await openDb();
  try {
    const { id, name, name_en, color, bg_color, sort_order } = character;
    await db.run(`
      INSERT INTO characters (id, name, name_en, color, bg_color, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, name, name_en, color, bg_color, sort_order || 0]);
    return await db.get('SELECT * FROM characters WHERE id = ?', id);
  } finally {
    await db.close();
  }
}

export async function updateCharacter(id, character) {
  const db = await openDb();
  try {
    const { name, name_en, color, bg_color, sort_order } = character;
    await db.run(`
      UPDATE characters 
      SET name = ?, name_en = ?, color = ?, bg_color = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, name_en, color, bg_color, sort_order, id]);
    return await db.get('SELECT * FROM characters WHERE id = ?', id);
  } finally {
    await db.close();
  }
}

export async function deleteCharacter(id) {
  const db = await openDb();
  try {
    await db.run('DELETE FROM characters WHERE id = ?', id);
    return { success: true };
  } finally {
    await db.close();
  }
}

// ==================== 卡牌 CRUD ====================

export async function getAllCards() {
  const db = await openDb();
  try {
    const cards = await db.all('SELECT *, card_id as id FROM cards ORDER BY character_id, name_en');
    // 按角色分组
    const grouped = {};
    for (const card of cards) {
      if (!grouped[card.character_id]) {
        grouped[card.character_id] = [];
      }
      // 解析meta_info
      if (card.meta_info) {
        try {
          card.meta = JSON.parse(card.meta_info);
        } catch (e) {
          card.meta = {};
        }
      }
      grouped[card.character_id].push(card);
    }
    return grouped;
  } finally {
    await db.close();
  }
}

export async function getCardsByCharacter(characterId) {
  const db = await openDb();
  try {
    const cards = await db.all('SELECT *, card_id as id FROM cards WHERE character_id = ? ORDER BY name_en', characterId);
    for (const card of cards) {
      if (card.meta_info) {
        try {
          card.meta = JSON.parse(card.meta_info);
        } catch (e) {
          card.meta = {};
        }
      }
    }
    return cards;
  } finally {
    await db.close();
  }
}

export async function getCardById(id, characterId = null) {
  const db = await openDb();
  try {
    let card;
    if (characterId) {
      card = await db.get('SELECT *, card_id as id FROM cards WHERE card_id = ? AND character_id = ?', [id, characterId]);
    } else {
      // 如果没有提供characterId，返回第一个匹配的
      card = await db.get('SELECT *, card_id as id FROM cards WHERE card_id = ?', id);
    }
    if (card && card.meta_info) {
      try {
        card.meta = JSON.parse(card.meta_info);
      } catch (e) {
        card.meta = {};
      }
    }
    return card;
  } finally {
    await db.close();
  }
}

export async function createCard(card) {
  const db = await openDb();
  try {
    const {
      id, name, name_en, character_id, cost, type, type_en,
      rarity, rarity_en, description, meta_info
    } = card;
    
    await db.run(`
      INSERT INTO cards (card_id, name, name_en, character_id, cost, type, type_en, rarity, rarity_en, description, meta_info)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name, name_en, character_id, cost, type, type_en, rarity, rarity_en, description, meta_info ? JSON.stringify(meta_info) : null]);
    
    return await getCardById(id, character_id);
  } finally {
    await db.close();
  }
}

export async function updateCard(id, card) {
  const db = await openDb();
  try {
    const {
      name, name_en, character_id, cost, type, type_en,
      rarity, rarity_en, description, meta_info
    } = card;
    
    await db.run(`
      UPDATE cards 
      SET name = ?, name_en = ?, character_id = ?, cost = ?, type = ?, type_en = ?, 
          rarity = ?, rarity_en = ?, description = ?, meta_info = ?, updated_at = CURRENT_TIMESTAMP
      WHERE card_id = ? AND character_id = ?
    `, [name, name_en, character_id, cost, type, type_en, rarity, rarity_en, description, meta_info ? JSON.stringify(meta_info) : null, id, character_id]);
    
    return await getCardById(id, character_id);
  } finally {
    await db.close();
  }
}

export async function deleteCard(id, characterId) {
  const db = await openDb();
  try {
    if (characterId) {
      await db.run('DELETE FROM cards WHERE card_id = ? AND character_id = ?', [id, characterId]);
    } else {
      await db.run('DELETE FROM cards WHERE card_id = ?', id);
    }
    return { success: true };
  } finally {
    await db.close();
  }
}

// ==================== 遗物 CRUD ====================

export async function getAllRelics() {
  const db = await openDb();
  try {
    const relics = await db.all('SELECT * FROM relics ORDER BY rarity, name_en');
    // 按稀有度分组
    const grouped = { starter: [], common: [], uncommon: [], rare: [], boss: [], event: [], shop: [], special: [] };
    for (const relic of relics) {
      let category = relic.rarity.toLowerCase();
      if (relic.is_boss) category = 'boss';
      else if (relic.is_event) category = 'event';
      else if (relic.is_shop) category = 'shop';
      
      if (!grouped[category]) grouped[category] = [];
      
      if (relic.meta_info) {
        try {
          relic.meta = JSON.parse(relic.meta_info);
        } catch (e) {
          relic.meta = {};
        }
      }
      grouped[category].push(relic);
    }
    return grouped;
  } finally {
    await db.close();
  }
}

export async function getRelicById(id) {
  const db = await openDb();
  try {
    const relic = await db.get('SELECT * FROM relics WHERE id = ?', id);
    if (relic && relic.meta_info) {
      try {
        relic.meta = JSON.parse(relic.meta_info);
      } catch (e) {
        relic.meta = {};
      }
    }
    return relic;
  } finally {
    await db.close();
  }
}

export async function createRelic(relic) {
  const db = await openDb();
  try {
    const {
      id, name, name_en, rarity, description, flavor,
      character_id, is_boss, is_event, is_shop, meta_info
    } = relic;
    
    await db.run(`
      INSERT INTO relics (id, name, name_en, rarity, description, flavor, character_id, is_boss, is_event, is_shop, meta_info)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name, name_en, rarity, description, flavor || '', character_id || null, is_boss || 0, is_event || 0, is_shop || 0, meta_info ? JSON.stringify(meta_info) : null]);
    
    return await getRelicById(id);
  } finally {
    await db.close();
  }
}

export async function updateRelic(id, relic) {
  const db = await openDb();
  try {
    const {
      name, name_en, rarity, description, flavor,
      character_id, is_boss, is_event, is_shop, meta_info
    } = relic;
    
    await db.run(`
      UPDATE relics 
      SET name = ?, name_en = ?, rarity = ?, description = ?, flavor = ?, 
          character_id = ?, is_boss = ?, is_event = ?, is_shop = ?, meta_info = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, name_en, rarity, description, flavor || '', character_id || null, is_boss || 0, is_event || 0, is_shop || 0, meta_info ? JSON.stringify(meta_info) : null, id]);
    
    return await getRelicById(id);
  } finally {
    await db.close();
  }
}

export async function deleteRelic(id) {
  const db = await openDb();
  try {
    await db.run('DELETE FROM relics WHERE id = ?', id);
    return { success: true };
  } finally {
    await db.close();
  }
}

// ==================== 数据导入 ====================

export async function importCardsFromJson(cardsData) {
  const db = await openDb();
  try {
    // 清空现有卡牌
    await db.run('DELETE FROM cards');
    
    let count = 0;
    for (const [characterId, cards] of Object.entries(cardsData)) {
      for (const card of cards) {
        await db.run(`
          INSERT INTO cards (card_id, name, name_en, character_id, cost, type, type_en, rarity, rarity_en, description)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          card.id,
          card.name,
          card.nameEn,
          characterId,
          typeof card.cost === 'string' ? -1 : card.cost,
          card.type,
          card.typeEn,
          card.rarity,
          card.rarityEn,
          card.description
        ]);
        count++;
      }
    }

    console.log('卡牌数据导入成功');
    return { success: true, count };
  } catch (error) {
    console.error('导入卡牌失败:', error);
    throw error;
  } finally {
    await db.close();
  }
}

export async function importRelicsFromJson(relicsData) {
  const db = await openDb();
  try {
    // 清空现有遗物
    await db.run('DELETE FROM relics');
    
    let count = 0;
    for (const [category, relics] of Object.entries(relicsData)) {
      for (const relic of relics) {
        await db.run(`
          INSERT INTO relics (id, name, name_en, rarity, description, flavor, character_id, is_boss, is_event, is_shop)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          relic.id,
          relic.name,
          relic.nameEn,
          relic.rarity,
          relic.description,
          relic.flavor || '',
          relic.character || null,
          category === 'boss' ? 1 : 0,
          category === 'event' ? 1 : 0,
          category === 'shop' ? 1 : 0
        ]);
        count++;
      }
    }

    console.log('遗物数据导入成功');
    return { success: true, count };
  } catch (error) {
    console.error('导入遗物失败:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// ==================== Meta 配置 ====================

export async function getMetaConfig(category) {
  const db = await openDb();
  try {
    return await db.all('SELECT * FROM meta_config WHERE category = ?', category);
  } finally {
    await db.close();
  }
}

export async function setMetaConfig(category, key, value, description) {
  const db = await openDb();
  try {
    await db.run(`
      INSERT INTO meta_config (category, key, value, description)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(category, key) DO UPDATE SET
        value = excluded.value,
        description = COALESCE(excluded.description, meta_config.description)
    `, [category, key, value, description]);
    return { success: true };
  } finally {
    await db.close();
  }
}

// ==================== Buffs CRUD ====================

export async function getAllBuffs() {
  const db = await openDb();
  try {
    const buffs = await db.all('SELECT * FROM buffs ORDER BY type, name_en');
    // 按类型分组（支持所有 buff 分类）
    const grouped = {};
    for (const buff of buffs) {
      const category = buff.type.toLowerCase();
      if (!grouped[category]) grouped[category] = [];
      
      if (buff.meta_info) {
        try {
          buff.meta = JSON.parse(buff.meta_info);
        } catch (e) {
          buff.meta = {};
        }
      }
      grouped[category].push(buff);
    }
    return grouped;
  } finally {
    await db.close();
  }
}

export async function getBuffById(id) {
  const db = await openDb();
  try {
    const buff = await db.get('SELECT * FROM buffs WHERE id = ?', id);
    if (buff && buff.meta_info) {
      try {
        buff.meta = JSON.parse(buff.meta_info);
      } catch (e) {
        buff.meta = {};
      }
    }
    return buff;
  } finally {
    await db.close();
  }
}

export async function createBuff(buff) {
  const db = await openDb();
  try {
    const {
      id, name, name_en, type, description, details, stackable, meta_info
    } = buff;
    
    await db.run(`
      INSERT INTO buffs (id, name, name_en, type, description, details, stackable, meta_info)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name, name_en, type, description, details || '', stackable || 0, meta_info ? JSON.stringify(meta_info) : null]);
    
    return await getBuffById(id);
  } finally {
    await db.close();
  }
}

export async function updateBuff(id, buff) {
  const db = await openDb();
  try {
    const {
      name, name_en, type, description, details, stackable, meta_info
    } = buff;
    
    await db.run(`
      UPDATE buffs 
      SET name = ?, name_en = ?, type = ?, description = ?, details = ?, 
          stackable = ?, meta_info = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, name_en, type, description, details || '', stackable || 0, meta_info ? JSON.stringify(meta_info) : null, id]);
    
    return await getBuffById(id);
  } finally {
    await db.close();
  }
}

export async function deleteBuff(id) {
  const db = await openDb();
  try {
    await db.run('DELETE FROM buffs WHERE id = ?', id);
    return { success: true };
  } finally {
    await db.close();
  }
}

export async function importBuffsFromJson(buffsData) {
  const db = await openDb();
  try {
    // 清空现有buffs
    await db.run('DELETE FROM buffs');
    
    let count = 0;
    for (const [category, items] of Object.entries(buffsData)) {
      for (const buff of items) {
        await db.run(`
          INSERT INTO buffs (id, name, name_en, type, description, details, stackable)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          buff.id,
          buff.name,
          buff.nameEn || buff.name_en,
          category,
          buff.description,
          buff.details || '',
          buff.stackable ? 1 : 0
        ]);
        count++;
      }
    }

    console.log('Buff数据导入成功');
    return { success: true, count };
  } catch (error) {
    console.error('导入Buff失败:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// ==================== Enemies CRUD ====================

export async function getAllEnemies() {
  const db = await openDb();
  try {
    const enemies = await db.all('SELECT * FROM enemies ORDER BY category, name_en');
    // 按类别分组
    const grouped = {};
    for (const enemy of enemies) {
      const category = enemy.category;
      if (!grouped[category]) grouped[category] = [];
      
      if (enemy.meta_info) {
        try {
          enemy.meta = JSON.parse(enemy.meta_info);
        } catch (e) {
          enemy.meta = {};
        }
      }
      grouped[category].push(enemy);
    }
    return grouped;
  } finally {
    await db.close();
  }
}

export async function getEnemyById(id) {
  const db = await openDb();
  try {
    const enemy = await db.get('SELECT * FROM enemies WHERE id = ?', id);
    if (enemy && enemy.meta_info) {
      try {
        enemy.meta = JSON.parse(enemy.meta_info);
      } catch (e) {
        enemy.meta = {};
      }
    }
    return enemy;
  } finally {
    await db.close();
  }
}

export async function createEnemy(enemy) {
  const db = await openDb();
  try {
    const {
      id, name, name_en, category, description, details, meta_info
    } = enemy;
    
    await db.run(`
      INSERT INTO enemies (id, name, name_en, category, description, details, meta_info)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, name, name_en, category, description, details, meta_info ? JSON.stringify(meta_info) : null]);
    
    return await getEnemyById(id);
  } finally {
    await db.close();
  }
}

export async function updateEnemy(id, enemy) {
  const db = await openDb();
  try {
    const {
      name, name_en, category, description, details, meta_info
    } = enemy;
    
    await db.run(`
      UPDATE enemies 
      SET name = ?, name_en = ?, category = ?, description = ?, details = ?, 
          meta_info = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, name_en, category, description, details, meta_info ? JSON.stringify(meta_info) : null, id]);
    
    return await getEnemyById(id);
  } finally {
    await db.close();
  }
}

export async function deleteEnemy(id) {
  const db = await openDb();
  try {
    await db.run('DELETE FROM enemies WHERE id = ?', id);
    return { success: true };
  } finally {
    await db.close();
  }
}

export async function importEnemiesFromJson(enemiesData) {
  const db = await openDb();
  try {
    // 清空现有enemies
    await db.run('DELETE FROM enemies');
    
    let count = 0;
    for (const [category, items] of Object.entries(enemiesData)) {
      // 将原始分类映射到标准分类
      let standardCategory = 'normal';
      const categoryLower = category.toLowerCase();
      if (categoryLower.includes('boss')) {
        standardCategory = 'boss';
      } else if (categoryLower.includes('精英')) {
        standardCategory = 'elite';
      } else if (categoryLower.includes('小怪') || categoryLower.includes('normal')) {
        standardCategory = 'normal';
      }
      
      for (const enemy of items) {
        await db.run(`
          INSERT INTO enemies (id, name, name_en, category, description, details)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          enemy.id,
          enemy.name,
          enemy.nameEn || enemy.name_en,
          standardCategory,
          enemy.description || '',
          enemy.details
        ]);
        count++;
      }
    }

    console.log('敌人数据导入成功');
    return { success: true, count };
  } catch (error) {
    console.error('导入敌人失败:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// ==================== Potions CRUD ====================

export async function getAllPotions() {
  const db = await openDb();
  try {
    return await db.all('SELECT * FROM potions ORDER BY name_en');
  } finally {
    await db.close();
  }
}

export async function getPotionById(id) {
  const db = await openDb();
  try {
    return await db.get('SELECT * FROM potions WHERE id = ?', id);
  } finally {
    await db.close();
  }
}

export async function createPotion(potion) {
  const db = await openDb();
  try {
    const { id, name, name_en, description } = potion;
    await db.run(`
      INSERT INTO potions (id, name, name_en, description)
      VALUES (?, ?, ?, ?)
    `, [id, name, name_en, description]);
    return await getPotionById(id);
  } finally {
    await db.close();
  }
}

export async function updatePotion(id, potion) {
  const db = await openDb();
  try {
    const { name, name_en, description } = potion;
    await db.run(`
      UPDATE potions 
      SET name = ?, name_en = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, name_en, description, id]);
    return await getPotionById(id);
  } finally {
    await db.close();
  }
}

export async function deletePotion(id) {
  const db = await openDb();
  try {
    await db.run('DELETE FROM potions WHERE id = ?', id);
    return { success: true };
  } finally {
    await db.close();
  }
}


export async function importPotionsFromJson(potionsData) {
  const db = await openDb();
  try {
    // 清空现有potions
    await db.run('DELETE FROM potions');
    
    let count = 0;
    for (const potion of potionsData) {
      await db.run(`
        INSERT INTO potions (id, name, name_en, description)
        VALUES (?, ?, ?, ?)
      `, [
        potion.id,
        potion.name,
        potion.nameEn || potion.name_en,
        potion.description
      ]);
      count++;
    }

    console.log('药水数据导入成功');
    return { success: true, count };
  } catch (error) {
    console.error('导入药水失败:', error);
    throw error;
  } finally {
    await db.close();
  }
}
