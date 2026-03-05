import { openDb } from '../backend/database.js';

const db = await openDb();

console.log('=== 数据库中的 Buff 数据统计 ===\n');

// 按类型统计
const typeStats = await db.all('SELECT type, COUNT(*) as count FROM buffs GROUP BY type');
console.log('按类型统计:');
for (const stat of typeStats) {
  console.log(`  ${stat.type}: ${stat.count}`);
}

// 显示部分数据示例
console.log('\n=== Buff 数据示例 ===\n');

const buffs = await db.all(`
  SELECT id, name, name_en, type, description 
  FROM buffs 
  ORDER BY type, name_en 
  LIMIT 15
`);

for (const b of buffs) {
  console.log(`[${b.type.toUpperCase()}] ${b.name} (${b.name_en})`);
  console.log(`  描述: ${b.description}`);
  console.log(`  ID: ${b.id}\n`);
}

// 搜索特定 buff
console.log('=== 搜索 "力量" 相关 Buff ===\n');
const strengthBuffs = await db.all(`
  SELECT id, name, name_en, type, description 
  FROM buffs 
  WHERE name LIKE '%力量%' OR name_en LIKE '%Strength%'
  ORDER BY type
`);

for (const b of strengthBuffs) {
  console.log(`[${b.type.toUpperCase()}] ${b.name} (${b.name_en})`);
}

await db.close();
console.log('\n✅ 验证完成！');
