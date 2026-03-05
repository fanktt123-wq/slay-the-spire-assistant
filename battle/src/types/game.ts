// 卡牌类型
export type CardType = 'attack' | 'skill' | 'power' | 'status' | 'curse';

// 卡牌颜色/职业
export type CardColor = 'red' | 'green' | 'blue' | 'purple' | 'colorless' | 'curse';

// 卡牌稀有度
export type CardRarity = 'basic' | 'common' | 'uncommon' | 'rare' | 'special';

// 卡牌接口
export interface Card {
  id: string;
  name: string;
  cost: number;
  type: CardType;
  color: CardColor;
  rarity: CardRarity;
  description: string;
  upgraded: boolean;
  imageUrl?: string;
}

// Buff/Debuff 类型（与数据库分类一致）
export type BuffType = 
  | 'shared_buff'      // 共享增益
  | 'player_buff'      // 玩家增益
  | 'enemy_buff'       // 敌人增益
  | 'shared_debuff'    // 共享减益
  | 'player_debuff'    // 玩家减益
  | 'enemy_debuff'     // 敌人减益
  | 'other';           // 其他

// Buff 分类显示名称
export const BUFF_TYPE_LABELS: Record<BuffType, string> = {
  shared_buff: '共享增益',
  player_buff: '玩家增益',
  enemy_buff: '敌人增益',
  shared_debuff: '共享减益',
  player_debuff: '玩家减益',
  enemy_debuff: '敌人减益',
  other: '其他',
};

// Buff/Debuff 接口
export interface Buff {
  id: string;
  name: string;
  type: BuffType;
  stacks: number;
  description: string;
  details?: string;  // 详细说明
  icon?: string;
}

// 敌人类型
export type EnemyType = 'normal' | 'elite' | 'boss';

// 敌人意图
export interface EnemyIntent {
  type: 'attack' | 'defend' | 'buff' | 'debuff' | 'unknown' | 'sleep';
  value?: number;
  description: string;
}

// 敌人详细信息
export interface EnemyDetails {
  description: string;      // 怪物描述
  behavior: string;         // 行为模式
  specialMechanics: string; // 特殊机制
  recommendedStrategy: string; // 推荐策略
}

// 敌人接口
export interface Enemy {
  id: string;
  name: string;
  type: EnemyType;
  currentHp: number;
  maxHp: number;
  block: number;
  buffs: Buff[];
  intent: EnemyIntent;
  details: EnemyDetails;
  imageUrl?: string;
}

// 角色职业
export type CharacterClass = 'ironclad' | 'silent' | 'defect' | 'watcher';

// 角色接口
export interface Character {
  class: CharacterClass;
  currentHp: number;
  maxHp: number;
  block: number;
  energy: number;
  maxEnergy: number;
  buffs: Buff[];
}

// 遗物稀有度
export type RelicRarity = 'starter' | 'common' | 'uncommon' | 'rare' | 'boss' | 'event' | 'shop' | 'special';

// 遗物接口
export interface Relic {
  id: string;
  name: string;
  rarity: RelicRarity;
  description: string;
  character?: CharacterClass; // 专属职业（如果有）
  icon?: string;
  counter?: number; // 计数器（可选，用于如钢笔尖、香炉等需要计数的遗物）
}

// 药水稀有度
export type PotionRarity = 'common' | 'uncommon' | 'rare';

// 药水接口
export interface Potion {
  id: string;
  name: string;
  rarity: PotionRarity;
  description: string;
  character?: CharacterClass; // 专属职业（如果有）
  icon?: string;
}

// 卡组状态
export interface DeckState {
  deck: Card[];        // 完整卡组
  hand: Card[];        // 手牌
  drawPile: Card[];    // 抽牌堆
  discardPile: Card[]; // 弃牌堆
  exhaustPile: Card[]; // 消耗堆
}

// 游戏进度
export interface GameProgress {
  act: number;      // 当前Act (1-4)
  floor: number;    // 当前层数
}

// 完整游戏状态
export interface GameState {
  character: Character;
  enemies: Enemy[];
  deckState: DeckState;
  turn: number;
  relics: Relic[];
  potions: Potion[];
  progress: GameProgress;
  gold: number;           // 当前金钱
  maxPotionSlots: number; // 最大药水栏位
}

// AI 决策请求
export interface AIRequest {
  gameState: GameState;
  context: string;
}

// AI 决策响应
export interface AIResponse {
  reasoning: string;
  recommendedActions: string[];
  expectedOutcome: string;
  alternativeOptions?: string[];
}

// ==================== 样式常量 ====================

// 角色职业显示名称
export const CHARACTER_NAMES: Record<CharacterClass, string> = {
  ironclad: '铁甲战士',
  silent: '静默猎手',
  defect: '故障机器人',
  watcher: '观者',
};

// 卡牌颜色样式
export const CARD_COLOR_STYLES: Record<CardColor, string> = {
  red: 'bg-red-900 border-red-700',
  green: 'bg-green-900 border-green-700',
  blue: 'bg-cyan-900 border-cyan-700',
  purple: 'bg-purple-900 border-purple-700',
  colorless: 'bg-gray-700 border-gray-500',
  curse: 'bg-gray-900 border-gray-700',
};

// 卡牌类型图标
export const CARD_TYPE_ICONS: Record<CardType, string> = {
  attack: '⚔️',
  skill: '🛡️',
  power: '⚡',
  status: '⚠️',
  curse: '💀',
};

// 遗物稀有度颜色
export const RELIC_RARITY_COLORS: Record<RelicRarity, string> = {
  starter: 'text-gray-400',
  common: 'text-gray-300',
  uncommon: 'text-green-400',
  rare: 'text-yellow-400',
  boss: 'text-red-400',
  event: 'text-purple-400',
  shop: 'text-blue-400',
  special: 'text-pink-400',
};

// 药水稀有度颜色
export const POTION_RARITY_COLORS: Record<PotionRarity, string> = {
  common: 'text-gray-300',
  uncommon: 'text-green-400',
  rare: 'text-yellow-400',
};

// 注意：所有游戏数据（卡牌、遗物、药水、敌人、Buff）
// 都从后端 API 获取，不再使用硬编码数据
