import { getAllCards } from './database.js';

async function check() {
  const allCards = await getAllCards();
  if (allCards.ironclad) {
    const content = allCards.ironclad.map(c => {
      const cost = c.cost === -1 ? 'X' : c.cost;
      return `${c.name_en} [${cost}费 ${c.type_en}]: ${c.description}`;
    }).join('\n');
    
    console.log('铁甲战士卡牌数量:', allCards.ironclad.length);
    console.log('铁甲战士卡牌内容长度:', content.length, '字符');
  }
  
  // 检查知识库文件大小
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const knowledgeDir = path.join(__dirname, '../data/新建文件夹');
  
  const files = ['howtobuild_en.txt', 'wiki_guide_en.txt', 'watcher_guide_en.txt'];
  for (const f of files) {
    const filePath = path.join(knowledgeDir, f);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      console.log(`${f}: ${content.length} 字符`);
    } else {
      console.log(`${f}: 文件不存在于 ${knowledgeDir}`);
    }
  }
}

check().catch(console.error);
