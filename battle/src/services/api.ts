import type { Card, CardType, CardColor, CardRarity, Potion, PotionRarity, Enemy, EnemyType, Relic, RelicRarity, Buff, BuffType } from '@/types/game';

const API_BASE_URL = 'http://localhost:3000/api';

// API错误类
export class APIError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

// 检查API是否可用
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/cards`, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

// 类型映射函数
function mapCardType(typeEn: string): CardType {
  const map: Record<string, CardType> = {
    'Attack': 'attack',
    'Skill': 'skill',
    'Power': 'power',
    'Status': 'status',
    'Curse': 'curse',
  };
  return map[typeEn] || 'skill';
}

function mapCardColor(characterId: string): CardColor {
  const map: Record<string, CardColor> = {
    'ironclad': 'red',
    'silent': 'green',
    'defect': 'blue',
    'watcher': 'purple',
    'colorless': 'colorless',
    'curse': 'curse',
  };
  return map[characterId] || 'colorless';
}

function mapCardRarity(rarityEn: string): CardRarity {
  const map: Record<string, CardRarity> = {
    'Basic': 'basic',
    'Common': 'common',
    'Uncommon': 'uncommon',
    'Rare': 'rare',
    'Special': 'special',
  };
  return map[rarityEn] || 'common';
}

function mapPotionRarity(rarity: string): PotionRarity {
  const map: Record<string, PotionRarity> = {
    'common': 'common',
    'uncommon': 'uncommon',
    'rare': 'rare',
  };
  return map[rarity.toLowerCase()] || 'common';
}

function mapEnemyType(category: string): EnemyType {
  // 标准化分类为 normal/elite/boss
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('boss')) return 'boss';
  if (categoryLower.includes('elite')) return 'elite';
  return 'normal';
}

function mapRelicRarity(rarity: string): RelicRarity {
  const map: Record<string, RelicRarity> = {
    'starter': 'starter',
    'common': 'common',
    'uncommon': 'uncommon',
    'rare': 'rare',
    'boss': 'boss',
    'event': 'event',
    'shop': 'shop',
    'special': 'special',
  };
  return map[rarity.toLowerCase()] || 'common';
}

function mapBuffType(type: string): BuffType {
  const lowerType = type.toLowerCase();
  // 支持数据库中的分类
  const validTypes: BuffType[] = [
    'shared_buff', 'player_buff', 'enemy_buff',
    'shared_debuff', 'player_debuff', 'enemy_debuff',
    'other'
  ];
  if (validTypes.includes(lowerType as BuffType)) {
    return lowerType as BuffType;
  }
  // 兼容旧数据
  if (lowerType === 'debuff') return 'shared_debuff';
  return 'shared_buff';
}

// 从敌人details中提取HP
function extractMaxHp(details: string): number {
  // 尝试从details文本中匹配HP值
  const hpMatch = details.match(/HP[:：]\s*(\d+)/i) || 
                  details.match(/生命值[:：]\s*(\d+)/i) ||
                  details.match(/(\d+)\s*HP/i);
  if (hpMatch) {
    return parseInt(hpMatch[1], 10);
  }
  // 默认值
  return 50;
}

// API方法
export const api = {
  // 获取所有卡牌
  async getCards(): Promise<Card[]> {
    const res = await fetch(`${API_BASE_URL}/cards`);
    if (!res.ok) throw new APIError(`获取卡牌失败: ${res.status}`);
    
    const data = await res.json();
    const cards: Card[] = [];
    
    for (const [characterId, charCards] of Object.entries(data)) {
      for (const c of charCards as any[]) {
        cards.push({
          id: c.id,
          name: c.name,
          cost: c.cost === 'X' ? -1 : (typeof c.cost === 'number' ? c.cost : 1),
          type: mapCardType(c.typeEn),
          color: mapCardColor(characterId),
          rarity: mapCardRarity(c.rarityEn),
          description: c.description,
          upgraded: false,
        });
      }
    }
    
    return cards;
  },

  // 获取所有药水
  async getPotions(): Promise<Potion[]> {
    const res = await fetch(`${API_BASE_URL}/admin/potions`);
    if (!res.ok) throw new APIError(`获取药水失败: ${res.status}`);
    
    const data = await res.json();
    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      rarity: mapPotionRarity(p.rarity || 'common'),
      description: p.description,
      // character字段可选
    }));
  },

  // 获取所有敌人
  async getEnemies(): Promise<Enemy[]> {
    const res = await fetch(`${API_BASE_URL}/enemies`);
    if (!res.ok) throw new APIError(`获取敌人失败: ${res.status}`);
    
    const data = await res.json();
    const enemies: Enemy[] = [];
    
    for (const [category, items] of Object.entries(data)) {
      for (const e of items as any[]) {
        const maxHp = extractMaxHp(e.details || '');
        enemies.push({
          id: e.id,
          name: e.name,
          type: mapEnemyType(e.category || category),
          currentHp: maxHp,
          maxHp: maxHp,
          block: 0,
          buffs: [],
          intent: { type: 'unknown', description: '未知意图' },
          details: {
            description: e.description || '',
            behavior: e.details || '',
            specialMechanics: '',
            recommendedStrategy: '',
          },
        });
      }
    }
    
    return enemies;
  },

  // 获取所有遗物
  async getRelics(): Promise<Relic[]> {
    const res = await fetch(`${API_BASE_URL}/relics`);
    if (!res.ok) throw new APIError(`获取遗物失败: ${res.status}`);
    
    const data = await res.json();
    const relics: Relic[] = [];
    
    for (const [category, items] of Object.entries(data)) {
      for (const r of items as any[]) {
        relics.push({
          id: r.id,
          name: r.name,
          rarity: mapRelicRarity(r.rarity || category),
          description: r.description,
          character: r.character,
        });
      }
    }
    
    return relics;
  },

  // 获取所有Buffs
  async getBuffs(): Promise<Buff[]> {
    const res = await fetch(`${API_BASE_URL}/buffs`);
    if (!res.ok) throw new APIError(`获取Buff失败: ${res.status}`);
    
    const data = await res.json();
    const buffs: Buff[] = [];
    
    for (const [type, items] of Object.entries(data)) {
      for (const b of items as any[]) {
        buffs.push({
          id: b.id,
          name: b.name,
          type: mapBuffType(b.type || type),
          stacks: 0,
          description: b.description,
          details: b.details,
        });
      }
    }
    
    return buffs;
  },

  // 获取角色列表
  async getCharacters(): Promise<Array<{ id: string; name: string; nameEn: string; color: string }>> {
    const res = await fetch(`${API_BASE_URL}/characters`);
    if (!res.ok) throw new APIError(`获取角色失败: ${res.status}`);
    return res.json();
  },
};

export default api;
