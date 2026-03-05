/**
 * 卡牌截图 OCR 识别脚本
 * 使用 Tesseract.js 识别游戏截图中的卡牌
 * 
 * 使用方法：
 * node scripts/card-ocr.js <截图路径>
 */

import Tesseract from 'tesseract.js';
import fs from 'fs/promises';
import path from 'path';

// 杀戮尖塔卡牌关键词库（用于提高识别准确率）
const CARD_KEYWORDS = [
  'Strike', 'Defend', 'Bash', 'Clash', 'Cleave', 'Clothesline',
  'Iron Wave', 'Thunderclap', 'Pommel Strike', 'Shrug It Off',
  // ... 可以添加更多卡牌名称
];

async function recognizeCards(imagePath) {
  console.log('正在识别截图:', imagePath);
  
  try {
    const result = await Tesseract.recognize(
      imagePath,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            process.stdout.write(`\r进度: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );
    
    console.log('\n识别结果:');
    console.log(result.data.text);
    
    // 简单的卡牌匹配
    const foundCards = [];
    const text = result.data.text.toLowerCase();
    
    for (const card of CARD_KEYWORDS) {
      if (text.includes(card.toLowerCase())) {
        foundCards.push(card);
      }
    }
    
    if (foundCards.length > 0) {
      console.log('\n识别到的卡牌:', foundCards);
    }
    
    return foundCards;
  } catch (error) {
    console.error('识别失败:', error);
    return [];
  }
}

// 主函数
const imagePath = process.argv[2];
if (!imagePath) {
  console.log('使用方法: node card-ocr.js <截图路径>');
  process.exit(1);
}

recognizeCards(imagePath);
