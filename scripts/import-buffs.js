/**
 * 导入 Buffs 数据到数据库
 * 支持新的分类格式：shared_buff, player_buff, enemy_buff, shared_debuff, player_debuff, enemy_debuff
 */

import { openDb, initDatabase } from '../backend/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buffsFilePath = path.join(__dirname, '../data/buffs.json');

// 分类映射：将新分类映射到数据库类型
const categoryToTypeMap = {
  'shared_buff': 'buff',
  'player_buff': 'buff',
  'enemy_buff': 'buff',
  'shared_debuff': 'debuff',
  'player_debuff': 'debuff',
  'enemy_debuff': 'debuff',
  'other': 'other'
};

// 分类名称映射（用于生成中文描述）
const categoryNameMap = {
  'shared_buff': '共享增益',
  'player_buff': '玩家增益',
  'enemy_buff': '敌人增益',
  'shared_debuff': '共享减益',
  'player_debuff': '玩家减益',
  'enemy_debuff': '敌人减益',
  'other': '其他'
};

async function importBuffs() {
  console.log('开始导入 Buffs 数据...\n');
  
  // 读取 buffs.json
  const buffsData = JSON.parse(fs.readFileSync(buffsFilePath, 'utf-8'));
  
  const db = await openDb();
  
  try {
    // 清空现有 buffs
    await db.run('DELETE FROM buffs');
    console.log('已清空现有 Buff 数据\n');
    
    let totalCount = 0;
    
    for (const [category, items] of Object.entries(buffsData)) {
      if (!Array.isArray(items)) {
        console.warn(`警告: ${category} 不是数组，跳过`);
        continue;
      }
      
      const type = categoryToTypeMap[category] || 'other';
      const categoryName = categoryNameMap[category] || category;
      
      console.log(`导入 ${categoryName} (${items.length} 项)...`);
      
      for (const buff of items) {
        // 生成唯一 ID（如果是共享的 buff，可能需要添加前缀区分）
        let buffId = buff.id;
        
        // 检查是否有重复（如 dexterity 在 shared_buff 和 shared_debuff 中都有）
        const existing = await db.get('SELECT id FROM buffs WHERE id = ?', buffId);
        if (existing) {
          // 如果有重复，添加分类前缀
          buffId = `${category}_${buff.id}`;
        }
        
        // 构建详细描述
        let details = buff.details || '';
        
        // 如果是分类特定的 buff，在描述中标注
        if (category.includes('player_')) {
          details = details || '';
        }
        
        await db.run(`
          INSERT INTO buffs (id, name, name_en, type, description, details, stackable, meta_info)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          buffId,
          buff.name,
          buff.nameEn,
          type,
          buff.description,
          details,
          buff.stackable !== undefined ? (buff.stackable ? 1 : 0) : 1, // 默认可堆叠
          JSON.stringify({ category, originalId: buff.id })
        ]);
        
        totalCount++;
      }
      
      console.log(`  ✓ ${categoryName} 导入完成\n`);
    }
    
    console.log('='.repeat(40));
    console.log(`导入完成！共导入 ${totalCount} 个 Buff/Debuff`);
    console.log('='.repeat(40));
    
    // 显示各类型统计
    const stats = await db.all(`
      SELECT type, COUNT(*) as count FROM buffs GROUP BY type
    `);
    console.log('\n按类型统计:');
    for (const stat of stats) {
      console.log(`  ${stat.type}: ${stat.count}`);
    }
    
  } catch (error) {
    console.error('导入失败:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// 执行导入
(async () => {
  try {
    // 确保数据库已初始化
    await initDatabase();
    // 导入 buffs
    await importBuffs();
    console.log('\n✅ 所有操作完成！');
  } catch (error) {
    console.error('\n❌ 错误:', error);
    process.exit(1);
  }
})();
