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

// Buff/Debuff 类型
export type BuffType = 'buff' | 'debuff';

// Buff/Debuff 接口
export interface Buff {
  id: string;
  name: string;
  type: BuffType;
  stacks: number;
  description: string;
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

// ==================== 预设数据 ====================

// 预设卡牌数据
export const PRESET_CARDS: Card[] = [
  // 铁甲战士卡牌
  { id: 'strike', name: '打击', cost: 1, type: 'attack', color: 'red', rarity: 'basic', description: '造成6点伤害。', upgraded: false },
  { id: 'strike+', name: '打击+', cost: 1, type: 'attack', color: 'red', rarity: 'basic', description: '造成9点伤害。', upgraded: true },
  { id: 'defend', name: '防御', cost: 1, type: 'skill', color: 'red', rarity: 'basic', description: '获得5点格挡。', upgraded: false },
  { id: 'defend+', name: '防御+', cost: 1, type: 'skill', color: 'red', rarity: 'basic', description: '获得8点格挡。', upgraded: true },
  { id: 'bash', name: '重击', cost: 2, type: 'attack', color: 'red', rarity: 'basic', description: '造成8点伤害。给予2层易伤。', upgraded: false },
  { id: 'bash+', name: '重击+', cost: 2, type: 'attack', color: 'red', rarity: 'basic', description: '造成10点伤害。给予3层易伤。', upgraded: true },
  
  // 静默猎手卡牌
  { id: 'survivor', name: '生存者', cost: 1, type: 'skill', color: 'green', rarity: 'basic', description: '获得8点格挡。丢弃1张牌。', upgraded: false },
  { id: 'neutralize', name: '中和', cost: 0, type: 'attack', color: 'green', rarity: 'basic', description: '造成3点伤害。给予2层虚弱。', upgraded: false },
  
  // 故障机器人卡牌
  { id: 'dualcast', name: '双重释放', cost: 1, type: 'skill', color: 'blue', rarity: 'basic', description: '激发你最右边的充能球2次。', upgraded: false },
  { id: 'zap', name: '电击', cost: 1, type: 'skill', color: 'blue', rarity: 'basic', description: '生成1个闪电充能球。', upgraded: false },
  
  // 观者卡牌
  { id: 'eruption', name: '暴怒', cost: 2, type: 'attack', color: 'purple', rarity: 'basic', description: '造成9点伤害。进入愤怒姿态。', upgraded: false },
  { id: 'eruption+', name: '暴怒+', cost: 1, type: 'attack', color: 'purple', rarity: 'basic', description: '造成9点伤害。进入愤怒姿态。', upgraded: true },
  { id: 'vigilance', name: '警惕', cost: 2, type: 'skill', color: 'purple', rarity: 'basic', description: '获得8点格挡。进入平静姿态。', upgraded: false },
  { id: 'vigilance+', name: '警惕+', cost: 2, type: 'skill', color: 'purple', rarity: 'basic', description: '获得12点格挡。进入平静姿态。', upgraded: true },
  { id: 'miracle', name: '奇迹', cost: 0, type: 'skill', color: 'purple', rarity: 'special', description: '保留。获得2点能量。消耗。', upgraded: false },
  { id: 'empty_fist', name: '化拳为空', cost: 1, type: 'attack', color: 'purple', rarity: 'common', description: '造成9点伤害。退出当前姿态。', upgraded: false },
  { id: 'empty_fist+', name: '化拳为空+', cost: 1, type: 'attack', color: 'purple', rarity: 'common', description: '造成14点伤害。退出当前姿态。', upgraded: true },
  
  // 无色卡牌
  { id: 'swift_strike', name: '迅捷打击', cost: 0, type: 'attack', color: 'colorless', rarity: 'uncommon', description: '造成7点伤害。', upgraded: false },
  { id: 'bandage', name: '绷带', cost: 0, type: 'skill', color: 'colorless', rarity: 'uncommon', description: '恢复5点生命。消耗。', upgraded: false },
];

// 完整的Buff数据（来自Wiki）
export const PRESET_BUFFS: Buff[] = [
  // ===== 共享Buff =====
  { id: 'strength', name: '力量', type: 'buff', stacks: 0, description: '攻击造成的伤害增加X点。' },
  { id: 'dexterity', name: '敏捷', type: 'buff', stacks: 0, description: '从卡牌获得的格挡增加X点。' },
  { id: 'focus', name: '集中', type: 'buff', stacks: 0, description: '充能球的被动和激发效果增加X点。' },
  { id: 'artifact', name: '人工制品', type: 'buff', stacks: 0, description: '无视下一次受到的负面效果。' },
  { id: 'barricade', name: '壁垒', type: 'buff', stacks: 0, description: '格挡不会在回合开始时消失。' },
  { id: 'buffer', name: '缓冲', type: 'buff', stacks: 0, description: '无视下一次受到的生命值损伤。' },
  { id: 'intangible', name: '无形', type: 'buff', stacks: 0, description: '受到的所有伤害和生命值损失降为1点。' },
  { id: 'mantra', name: '真言', type: 'buff', stacks: 0, description: '累计10层时进入神性姿态。' },
  { id: 'metallicize', name: '金属化', type: 'buff', stacks: 0, description: '回合结束时获得X点格挡。' },
  { id: 'plated_armor', name: '多层护甲', type: 'buff', stacks: 0, description: '受到攻击伤害时失去1层，回合结束时获得X点格挡。' },
  { id: 'regenerate', name: '再生', type: 'buff', stacks: 0, description: '回合结束时恢复X点生命值，层数减1。' },
  { id: 'ritual', name: '仪式', type: 'buff', stacks: 0, description: '回合结束时获得X点力量。' },
  { id: 'thorns', name: '荆棘', type: 'buff', stacks: 0, description: '受到攻击伤害时对攻击者造成X点伤害。' },
  { id: 'vigor', name: '活力', type: 'buff', stacks: 0, description: '下一次攻击造成额外X点伤害。' },
  
  // ===== 玩家专属Buff =====
  { id: 'accuracy', name: '精准', type: 'buff', stacks: 0, description: '小刀造成额外X点伤害。' },
  { id: 'after_image', name: '残影', type: 'buff', stacks: 0, description: '每打出一张牌获得X点格挡。' },
  { id: 'amplify', name: '增幅', type: 'buff', stacks: 0, description: '下X张能力牌被打出两次。' },
  { id: 'berserk', name: '狂暴', type: 'buff', stacks: 0, description: '回合开始时获得X点能量。' },
  { id: 'blur', name: '模糊', type: 'buff', stacks: 0, description: '格挡在下X个回合开始时不会被移除。' },
  { id: 'brutality', name: '残忍', type: 'buff', stacks: 0, description: '回合开始时失去X点生命值并抽X张牌。' },
  { id: 'burst', name: '爆发', type: 'buff', stacks: 0, description: '下X张技能牌被打出两次。' },
  { id: 'combust', name: '燃烧', type: 'buff', stacks: 0, description: '回合结束时失去1点生命值，对所有敌人造成X点伤害。' },
  { id: 'corruption', name: '腐化', type: 'buff', stacks: 0, description: '技能牌费用为0，打出时消耗。' },
  { id: 'creative_ai', name: '创造性AI', type: 'buff', stacks: 0, description: '回合开始时将X张随机能力牌加入手牌。' },
  { id: 'dark_embrace', name: '黑暗之拥', type: 'buff', stacks: 0, description: '每当一张牌被消耗，抽X张牌。' },
  { id: 'deva_form', name: '天形态', type: 'buff', stacks: 0, description: '回合开始时获得N点能量，N每次增加X。' },
  { id: 'devotion', name: '虔诚', type: 'buff', stacks: 0, description: '回合开始时获得X层真言。' },
  { id: 'double_damage', name: '双倍伤害', type: 'buff', stacks: 0, description: '攻击造成双倍伤害，持续X回合。' },
  { id: 'double_tap', name: '双击', type: 'buff', stacks: 0, description: '下X张攻击牌被打出两次。' },
  { id: 'duplication', name: '复制', type: 'buff', stacks: 0, description: '下X张牌被打出两次。' },
  { id: 'echo_form', name: '回声形态', type: 'buff', stacks: 0, description: '每回合前X张牌被打出两次。' },
  { id: 'electrodynamics', name: '电动力学', type: 'buff', stacks: 0, description: '闪电球击中所有敌人。' },
  { id: 'envenom', name: '涂毒', type: 'buff', stacks: 0, description: '每造成一次未被格挡的攻击伤害，施加X层中毒。' },
  { id: 'equilibrium', name: '平衡', type: 'buff', stacks: 0, description: '保留手牌X回合。' },
  { id: 'establishment', name: '确立', type: 'buff', stacks: 0, description: '每当一张牌被保留，其费用降低X点。' },
  { id: 'evolve', name: '进化', type: 'buff', stacks: 0, description: '每抽到一张状态牌，抽X张牌。' },
  { id: 'feel_no_pain', name: '无痛', type: 'buff', stacks: 0, description: '每当一张牌被消耗，获得X点格挡。' },
  { id: 'fire_breathing', name: '喷火', type: 'buff', stacks: 0, description: '每抽到一张状态牌或诅咒牌，对所有敌人造成X点伤害。' },
  { id: 'flame_barrier', name: '火焰障壁', type: 'buff', stacks: 0, description: '被攻击时造成X点伤害回击。' },
  { id: 'foresight', name: '预知', type: 'buff', stacks: 0, description: '回合开始时预知X张牌。' },
  { id: 'heatsinks', name: '散热片', type: 'buff', stacks: 0, description: '每打出一张能力牌，抽X张牌。' },
  { id: 'hello_world', name: '你好世界', type: 'buff', stacks: 0, description: '回合开始时将X张随机普通牌加入手牌。' },
  { id: 'infinite_blades', name: '无限刀刃', type: 'buff', stacks: 0, description: '回合开始时将X张小刀加入手牌。' },
  { id: 'juggernaut', name: '主宰', type: 'buff', stacks: 0, description: '每获得格挡时对随机敌人造成X点伤害。' },
  { id: 'like_water', name: '如水', type: 'buff', stacks: 0, description: '回合结束时若处于平静姿态，获得X点格挡。' },
  { id: 'loop', name: '循环', type: 'buff', stacks: 0, description: '回合开始时触发最右边充能球的被动效果X次。' },
  { id: 'machine_learning', name: '机器学习', type: 'buff', stacks: 0, description: '回合开始时额外抽X张牌。' },
  { id: 'magnetism', name: '磁性', type: 'buff', stacks: 0, description: '回合开始时将X张随机无色牌加入手牌。' },
  { id: 'master_reality', name: '主宰现实', type: 'buff', stacks: 0, description: '战斗中生成的牌被升级。' },
  { id: 'mayhem', name: '混乱', type: 'buff', stacks: 0, description: '回合开始时打出抽牌堆顶的X张牌。' },
  { id: 'mental_fortress', name: '精神堡垒', type: 'buff', stacks: 0, description: '切换姿态时获得X点格挡。' },
  { id: 'noxious_fumes', name: '有毒气体', type: 'buff', stacks: 0, description: '回合开始时对所有敌人施加X层中毒。' },
  { id: 'omega', name: '欧米茄', type: 'buff', stacks: 0, description: '回合结束时对所有敌人造成X点伤害。' },
  { id: 'panache', name: '华丽', type: 'buff', stacks: 0, description: '每打出5张牌对所有敌人造成X点伤害。' },
  { id: 'rage', name: '愤怒', type: 'buff', stacks: 0, description: '每打出一张攻击牌获得X点格挡。' },
  { id: 'rebound', name: '反弹', type: 'buff', stacks: 0, description: '下X张打出的牌被放到抽牌堆顶。' },
  { id: 'rushdown', name: '突袭', type: 'buff', stacks: 0, description: '进入愤怒姿态时抽X张牌。' },
  { id: 'rupture', name: '破裂', type: 'buff', stacks: 0, description: '每因卡牌失去生命值时获得X点力量。' },
  { id: 'sadistic_nature', name: '施虐天性', type: 'buff', stacks: 0, description: '每对敌人施加负面效果时造成X点伤害。' },
  { id: 'self_repair', name: '自我修复', type: 'buff', stacks: 0, description: '战斗结束时恢复X点生命值。' },
  { id: 'static_discharge', name: '静电释放', type: 'buff', stacks: 0, description: '每受到未被格挡的攻击伤害，生成X个闪电球。' },
  { id: 'storm', name: '风暴', type: 'buff', stacks: 0, description: '每打出一张能力牌，生成X个闪电球。' },
  { id: 'thousand_cuts', name: '千刀万剐', type: 'buff', stacks: 0, description: '每打出一张牌对所有敌人造成X点伤害。' },
  { id: 'tools_of_trade', name: '交易工具', type: 'buff', stacks: 0, description: '回合开始时抽X张牌并丢弃X张牌。' },
  { id: 'wave_of_hand', name: '挥手', type: 'buff', stacks: 0, description: '本回合每获得格挡对所有敌人施加X层虚弱。' },
  { id: 'well_laid_plans', name: '周密计划', type: 'buff', stacks: 0, description: '回合结束时保留最多X张牌。' },
  
  // ===== 敌人专属Buff =====
  { id: 'angry', name: '愤怒', type: 'buff', stacks: 0, description: '受到攻击伤害时获得X点力量。' },
  { id: 'back_attack', name: '背后攻击', type: 'buff', stacks: 0, description: '从背后攻击造成50%额外伤害。' },
  { id: 'beat_of_death', name: '死亡之击', type: 'buff', stacks: 0, description: '每打出一张牌受到X点伤害。' },
  { id: 'curiosity', name: '好奇', type: 'buff', stacks: 0, description: '每打出一张能力牌获得X点力量。' },
  { id: 'curl_up', name: '蜷缩', type: 'buff', stacks: 0, description: '受到攻击伤害时蜷缩获得X点格挡（每场战斗一次）。' },
  { id: 'enrage', name: '激怒', type: 'buff', stacks: 0, description: '每打出一张技能牌获得X点力量。' },
  { id: 'explosive', name: '爆炸', type: 'buff', stacks: 0, description: '3回合后爆炸造成30点伤害。' },
  { id: 'fading', name: '消逝', type: 'buff', stacks: 0, description: 'X回合后死亡。' },
  { id: 'flying', name: '飞行', type: 'buff', stacks: 0, description: '受到的伤害减少50%，被攻击X次后移除。' },
  { id: 'invincible', name: '无敌', type: 'buff', stacks: 0, description: '每回合最多失去X点生命值。' },
  { id: 'life_link', name: '生命链接', type: 'buff', stacks: 0, description: '有其他同类存活时2回合后复活。' },
  { id: 'malleable', name: '可塑', type: 'buff', stacks: 0, description: '受到攻击伤害时获得X点格挡，每次触发增加1点。' },
  { id: 'minion', name: '仆从', type: 'buff', stacks: 0, description: '首领死亡时逃离战斗。' },
  { id: 'mode_shift', name: '模式转换', type: 'buff', stacks: 0, description: '受到X点伤害后转换为防御模式。' },
  { id: 'painful_stabs', name: '痛苦刺击', type: 'buff', stacks: 0, description: '受到攻击伤害时向弃牌堆添加X张伤口。' },
  { id: 'reactive', name: '反应', type: 'buff', stacks: 0, description: '受到攻击伤害时改变意图。' },
  { id: 'sharp_hide', name: '尖刺外皮', type: 'buff', stacks: 0, description: '每打出一张攻击牌受到X点伤害。' },
  { id: 'shifting', name: '转移', type: 'buff', stacks: 0, description: '失去生命值时临时失去等量力量。' },
  { id: 'split', name: '分裂', type: 'buff', stacks: 0, description: '生命值降至50%以下时分裂为两个。' },
  { id: 'spore_cloud', name: '孢子云', type: 'buff', stacks: 0, description: '死亡时对所有敌人施加X层易伤。' },
  { id: 'stasis', name: '停滞', type: 'buff', stacks: 0, description: '死亡时将被偷走的牌返回手牌。' },
  { id: 'strength_up', name: '力量提升', type: 'buff', stacks: 0, description: '回合结束时获得X点力量。' },
  { id: 'thievery', name: '偷窃', type: 'buff', stacks: 0, description: '每次攻击偷取X金币。' },
  { id: 'time_warp', name: '时间扭曲', type: 'buff', stacks: 0, description: '每打出12张牌结束你的回合并获得X点力量。' },
  { id: 'unawakened', name: '未觉醒', type: 'buff', stacks: 0, description: '此敌人尚未觉醒...' },
  
  // ===== 共享Debuff =====
  { id: 'vulnerable', name: '易伤', type: 'debuff', stacks: 0, description: '从攻击受到的伤害增加50%。' },
  { id: 'weak', name: '虚弱', type: 'debuff', stacks: 0, description: '攻击造成的伤害减少25%。' },
  { id: 'frail', name: '脆弱', type: 'debuff', stacks: 0, description: '从卡牌获得的格挡减少25%。' },
  { id: 'poison', name: '中毒', type: 'debuff', stacks: 0, description: '回合开始时受到伤害，层数减1。' },
  { id: 'confused', name: '混乱', type: 'debuff', stacks: 0, description: '抽到牌时随机化其费用。' },
  { id: 'no_draw', name: '无法抽牌', type: 'debuff', stacks: 0, description: '本回合无法抽牌。' },
  { id: 'shackled', name: '束缚', type: 'debuff', stacks: 0, description: '回合结束时恢复失去的力量。' },
  { id: 'slow', name: '缓慢', type: 'debuff', stacks: 0, description: '每打出一张牌受到10%额外攻击伤害。' },
  
  // ===== 玩家专属Debuff =====
  { id: 'bias', name: '偏差', type: 'debuff', stacks: 0, description: '回合开始时失去X点集中。' },
  { id: 'block_return', name: '格挡反弹', type: 'debuff', stacks: 0, description: '攻击此敌人时获得X点格挡。' },
  { id: 'choked', name: '窒息', type: 'debuff', stacks: 0, description: '本回合每打出一张牌失去X点生命值。' },
  { id: 'constricted', name: '缠绕', type: 'debuff', stacks: 0, description: '回合结束时受到X点伤害。' },
  { id: 'corpse_explosion', name: '尸体爆炸', type: 'debuff', stacks: 0, description: '死亡时对其它敌人造成X倍最大生命值的伤害。' },
  { id: 'draw_reduction', name: '抽牌减少', type: 'debuff', stacks: 0, description: '下X回合少抽1张牌。' },
  { id: 'entangled', name: '纠缠', type: 'debuff', stacks: 0, description: '本回合无法打出攻击牌。' },
  { id: 'fasting', name: '禁食', type: 'debuff', stacks: 0, description: '回合开始时获得能量减少X点。' },
  { id: 'hex', name: '诅咒', type: 'debuff', stacks: 0, description: '每打出一张非攻击牌向抽牌堆添加X张眩晕。' },
  { id: 'lock_on', name: '锁定', type: 'debuff', stacks: 0, description: '闪电和黑暗球对此敌人造成50%额外伤害。' },
  { id: 'mark', name: '印记', type: 'debuff', stacks: 0, description: '打出压力点时所有有印记的敌人失去X点生命值。' },
  { id: 'no_block', name: '无法格挡', type: 'debuff', stacks: 0, description: '下X回合无法从卡牌获得格挡。' },
  { id: 'wraith_form', name: '幽灵形态', type: 'debuff', stacks: 0, description: '回合结束时失去X点敏捷。' },
  { id: 'dexterity_down', name: '敏捷下降', type: 'debuff', stacks: 0, description: '回合结束时敏捷降低X点。' },
  { id: 'strength_down', name: '力量下降', type: 'debuff', stacks: 0, description: '回合结束时力量降低X点。' },
  { id: 'focus_negative', name: '集中下降', type: 'debuff', stacks: 0, description: '集中降低X点。' },
  { id: 'strength_negative', name: '力量降低', type: 'debuff', stacks: 0, description: '力量降低X点。' },
];

// 预设遗物数据
export const PRESET_RELICS: Relic[] = [
  // 初始遗物
  { id: 'burning_blood', name: '燃烧之血', rarity: 'starter', description: '战斗结束时恢复6点生命值。', character: 'ironclad' },
  { id: 'ring_of_the_snake', name: '蛇戒', rarity: 'starter', description: '战斗开始时额外抽2张牌。', character: 'silent' },
  { id: 'cracked_core', name: '破裂核心', rarity: 'starter', description: '战斗开始时生成1个闪电球。', character: 'defect' },
  { id: 'pure_water', name: '纯水', rarity: 'starter', description: '战斗开始时将一张奇迹加入手牌。', character: 'watcher' },
  
  // 普通遗物
  { id: 'akabeko', name: '赤贝子', rarity: 'common', description: '每场战斗的第一次攻击造成8点额外伤害。' },
  { id: 'anchor', name: '船锚', rarity: 'common', description: '战斗开始时获得10点格挡。' },
  { id: 'ancient_tea_set', name: '古茶具', rarity: 'common', description: '进入休息处后下一场战斗开始时获得2点额外能量。' },
  { id: 'art_of_war', name: '战争艺术', rarity: 'common', description: '本回合未打出攻击牌时下回合获得1点额外能量。' },
  { id: 'bag_of_marbles', name: '弹珠袋', rarity: 'common', description: '战斗开始时对所有敌人施加1层易伤。' },
  { id: 'bag_of_preparation', name: '准备袋', rarity: 'common', description: '战斗开始时额外抽2张牌。' },
  { id: 'blood_vial', name: '血瓶', rarity: 'common', description: '战斗开始时恢复2点生命值。' },
  { id: 'bronze_scales', name: '青铜鳞片', rarity: 'common', description: '受到伤害时对攻击者造成3点伤害。' },
  { id: 'centennial_puzzle', name: '百年拼图', rarity: 'common', description: '每场战斗第一次失去生命值时抽3张牌。' },
  { id: 'ceramic_fish', name: '陶瓷鱼', rarity: 'common', description: '每向牌组添加一张牌获得9金币。' },
  { id: 'damaru', name: '达玛鲁', rarity: 'common', description: '回合开始时获得1层真言。', character: 'watcher' },
  { id: 'data_disk', name: '数据磁盘', rarity: 'common', description: '战斗开始时获得1点集中。', character: 'defect' },
  { id: 'dream_catcher', name: '捕梦网', rarity: 'common', description: '休息时可以将一张牌加入牌组。' },
  { id: 'happy_flower', name: '快乐花', rarity: 'common', description: '每3回合获得1点能量。' },
  { id: 'juzu_bracelet', name: '念珠手镯', rarity: 'common', description: '？房间不再遭遇普通敌人战斗。' },
  { id: 'lantern', name: '灯笼', rarity: 'common', description: '每场战斗第一回合获得1点能量。' },
  { id: 'maw_bank', name: '巨口银行', rarity: 'common', description: '每爬一层获得12金币（在商店消费后失效）。' },
  { id: 'meal_ticket', name: '餐券', rarity: 'common', description: '进入商店时恢复15点生命值。' },
  { id: 'nunchaku', name: '双节棍', rarity: 'common', description: '每打出10张攻击牌获得1点能量。' },
  { id: 'oddly_smooth_stone', name: '异常光滑的石头', rarity: 'common', description: '战斗开始时获得1点敏捷。' },
  { id: 'omamori', name: '御守', rarity: 'common', description: '抵消下2次获得的诅咒。' },
  { id: 'orichalcum', name: '奥利哈钢', rarity: 'common', description: '回合结束时若没有格挡获得6点格挡。' },
  { id: 'pen_nib', name: '钢笔尖', rarity: 'common', description: '每第10张攻击牌造成双倍伤害。' },
  { id: 'potion_belt', name: '药水腰带', rarity: 'common', description: '获得时增加2个药水栏位。' },
  { id: 'preserved_insect', name: '保存的昆虫', rarity: 'common', description: '精英房间中的敌人生命值减少25%。' },
  { id: 'red_skull', name: '红骷髅', rarity: 'common', description: '生命值低于50%时获得3点额外力量。', character: 'ironclad' },
  { id: 'regal_pillow', name: '皇家枕头', rarity: 'common', description: '休息时额外恢复15点生命值。' },
  { id: 'smiling_mask', name: '微笑面具', rarity: 'common', description: '商人的移除卡牌服务固定花费50金币。' },
  { id: 'snecko_skull', name: '蛇头骨', rarity: 'common', description: '施加中毒时额外施加1层。', character: 'silent' },
  { id: 'strawberry', name: '草莓', rarity: 'common', description: '最大生命值+7。' },
  { id: 'the_boot', name: '靴子', rarity: 'common', description: '造成4点或以下的未被格挡攻击伤害时增加至5点。' },
  { id: 'tiny_chest', name: '小宝箱', rarity: 'common', description: '每第4个？房间是宝箱房。' },
  { id: 'toy_ornithopter', name: '玩具扑翼机', rarity: 'common', description: '使用药水时恢复5点生命值。' },
  { id: 'vajra', name: '金刚杵', rarity: 'common', description: '战斗开始时获得1点力量。' },
  { id: 'war_paint', name: '战漆', rarity: 'common', description: '获得时升级2张随机技能牌。' },
  { id: 'whetstone', name: '磨刀石', rarity: 'common', description: '获得时升级2张随机攻击牌。' },
  
  // 罕见遗物
  { id: 'blue_candle', name: '蓝蜡烛', rarity: 'uncommon', description: '诅咒牌可以打出，打出时失去1点生命值并消耗。' },
  { id: 'bottled_flame', name: '瓶装火焰', rarity: 'uncommon', description: '获得时选择一张攻击牌，战斗开始时该牌在手牌中。' },
  { id: 'bottled_lightning', name: '瓶装闪电', rarity: 'uncommon', description: '获得时选择一张技能牌，战斗开始时该牌在手牌中。' },
  { id: 'bottled_tornado', name: '瓶装龙卷风', rarity: 'uncommon', description: '获得时选择一张能力牌，战斗开始时该牌在手牌中。' },
  { id: 'darkstone_periapt', name: '黑石护身符', rarity: 'uncommon', description: '获得诅咒时最大生命值+6。' },
  { id: 'duality', name: '二元性', rarity: 'uncommon', description: '打出攻击牌时获得1点临时敏捷。', character: 'watcher' },
  { id: 'eternal_feather', name: '永恒羽毛', rarity: 'uncommon', description: '牌组中每有5张牌，进入休息处时恢复3点生命值。' },
  { id: 'frozen_egg', name: '冰冻蛋', rarity: 'uncommon', description: '向牌组添加能力牌时将其升级。' },
  { id: 'gold_plated_cables', name: '镀金电缆', rarity: 'uncommon', description: '最右边的充能球额外触发1次被动效果。', character: 'defect' },
  { id: 'gremlin_horn', name: '地精号角', rarity: 'uncommon', description: '敌人死亡时获得1点能量并抽1张牌。' },
  { id: 'horn_cleat', name: '角笛', rarity: 'uncommon', description: '第2回合开始时获得14点格挡。' },
  { id: 'ink_bottle', name: '墨水瓶', rarity: 'uncommon', description: '每打出10张牌抽1张牌。' },
  { id: 'kunai', name: '苦无', rarity: 'uncommon', description: '单回合打出3张攻击牌时获得1点敏捷。' },
  { id: 'letter_opener', name: '拆信刀', rarity: 'uncommon', description: '单回合打出3张技能牌时对所有敌人造成5点伤害。' },
  { id: 'matryoshka', name: '套娃', rarity: 'uncommon', description: '下2个宝箱包含2个遗物（不包括Boss宝箱）。' },
  { id: 'meat_on_bone', name: '骨头上的肉', rarity: 'uncommon', description: '战斗结束时若生命值低于50%恢复12点生命值。' },
  { id: 'mercury_hourglass', name: '水银沙漏', rarity: 'uncommon', description: '回合开始时对所有敌人造成3点伤害。' },
  { id: 'molten_egg', name: '熔火蛋', rarity: 'uncommon', description: '向牌组添加攻击牌时将其升级。' },
  { id: 'mummified_hand', name: '木乃伊之手', rarity: 'uncommon', description: '打出能力牌时手牌中一张随机牌本回合费用为0。' },
  { id: 'ninja_scroll', name: '忍者卷轴', rarity: 'uncommon', description: '战斗开始时手牌中有3张小刀。', character: 'silent' },
  { id: 'ornamental_fan', name: '装饰扇', rarity: 'uncommon', description: '单回合打出3张攻击牌时获得4点格挡。' },
  { id: 'pantograph', name: '缩放仪', rarity: 'uncommon', description: 'Boss战斗开始时恢复25点生命值。' },
  { id: 'paper_krane', name: '纸鹤', rarity: 'uncommon', description: '虚弱的敌人造成的伤害减少40%而非25%。', character: 'silent' },
  { id: 'paper_phrog', name: '纸蛙', rarity: 'uncommon', description: '易伤的敌人受到的伤害增加75%而非50%。', character: 'ironclad' },
  { id: 'pear', name: '梨', rarity: 'uncommon', description: '最大生命值+10。' },
  { id: 'question_card', name: '问题卡', rarity: 'uncommon', description: '卡牌奖励多1个选项。' },
  { id: 'self_forming_clay', name: '自塑形黏土', rarity: 'uncommon', description: '战斗中失去生命值时下回合获得3点格挡。', character: 'ironclad' },
  { id: 'shuriken', name: '手里剑', rarity: 'uncommon', description: '单回合打出3张攻击牌时获得1点力量。' },
  { id: 'singing_bowl', name: '颂钵', rarity: 'uncommon', description: '向牌组添加牌时可以选择改为获得+2最大生命值。' },
  { id: 'strike_dummy', name: '打击假人', rarity: 'uncommon', description: '名称包含"打击"的牌造成3点额外伤害。' },
  { id: 'sundial', name: '日晷', rarity: 'uncommon', description: '每洗牌3次获得2点能量。' },
  { id: 'symbiotic_virus', name: '共生病毒', rarity: 'uncommon', description: '战斗开始时生成1个黑暗球。', character: 'defect' },
  { id: 'teardrop_locket', name: '泪滴坠饰', rarity: 'uncommon', description: '战斗开始时处于平静姿态。', character: 'watcher' },
  { id: 'the_courier', name: '信使', rarity: 'uncommon', description: '商人的商品不会售罄且价格降低20%。' },
  { id: 'toxic_egg', name: '毒蛋', rarity: 'uncommon', description: '向牌组添加技能牌时将其升级。' },
  { id: 'white_beast_statue', name: '白兽雕像', rarity: 'uncommon', description: '战斗后必定获得药水。' },
  
  // 稀有遗物
  { id: 'bird_faced_urn', name: '鸟面瓮', rarity: 'rare', description: '打出能力牌时恢复2点生命值。' },
  { id: 'calipers', name: '卡尺', rarity: 'rare', description: '回合开始时只失去15点格挡而非全部。' },
  { id: 'captains_wheel', name: '船长轮盘', rarity: 'rare', description: '第3回合开始时获得18点格挡。' },
  { id: 'champion_belt', name: '冠军腰带', rarity: 'rare', description: '施加易伤时同时施加1层虚弱。', character: 'ironclad' },
  { id: 'charons_ashes', name: '卡戎的灰烬', rarity: 'rare', description: '消耗牌时对所有敌人造成3点伤害。', character: 'ironclad' },
  { id: 'cloak_clasp', name: '斗篷扣', rarity: 'rare', description: '回合结束时手牌中每有一张牌获得1点格挡。', character: 'watcher' },
  { id: 'dead_branch', name: '枯枝', rarity: 'rare', description: '消耗牌时将一张随机牌加入手牌。' },
  { id: 'du_vu_doll', name: '杜巫娃娃', rarity: 'rare', description: '牌组中每张诅咒使战斗开始时获得1点额外力量。' },
  { id: 'emotion_chip', name: '情感芯片', rarity: 'rare', description: '回合开始时若上回合失去生命值，触发所有充能球的被动效果。', character: 'defect' },
  { id: 'fossilized_helix', name: '化石螺旋', rarity: 'rare', description: '防止战斗中第一次失去生命值。' },
  { id: 'gambling_chip', name: '赌博筹码', rarity: 'rare', description: '战斗开始时可以丢弃任意数量的牌然后抽等量的牌。' },
  { id: 'ginger', name: '生姜', rarity: 'rare', description: '不再获得虚弱。' },
  { id: 'girya', name: '吉尔雅', rarity: 'rare', description: '可以在休息处获得力量（最多3次）。' },
  { id: 'golden_eye', name: '金眼', rarity: 'rare', description: '预知时额外预知2张牌。', character: 'watcher' },
  { id: 'ice_cream', name: '冰淇淋', rarity: 'rare', description: '能量现在可以累积到下一回合。' },
  { id: 'incense_burner', name: '香炉', rarity: 'rare', description: '每6回合获得1层无形。' },
  { id: 'lizard_tail', name: '蜥蜴尾巴', rarity: 'rare', description: '死亡时改为恢复至50%最大生命值（一次有效）。' },
  { id: 'magic_flower', name: '魔法花', rarity: 'rare', description: '战斗中的治疗效果增加50%。', character: 'ironclad' },
  { id: 'mango', name: '芒果', rarity: 'rare', description: '最大生命值+14。' },
  { id: 'old_coin', name: '古币', rarity: 'rare', description: '获得300金币。' },
  { id: 'peace_pipe', name: '和平烟斗', rarity: 'rare', description: '可以在休息处移除牌组中的牌。' },
  { id: 'pocketwatch', name: '怀表', rarity: 'rare', description: '单回合打出3张或更少牌时下回合额外抽3张牌。' },
  { id: 'prayer_wheel', name: '祈祷轮', rarity: 'rare', description: '普通敌人额外掉落一张卡牌奖励。' },
  { id: 'shovel', name: '铲子', rarity: 'rare', description: '可以在休息处挖掘宝藏。' },
  { id: 'stone_calendar', name: '石制日历', rarity: 'rare', description: '第7回合结束时对所有敌人造成52点伤害。' },
  { id: 'the_specimen', name: '样本', rarity: 'rare', description: '敌人死亡时将其身上的中毒转移给随机敌人。', character: 'silent' },
  { id: 'thread_and_needle', name: '针线', rarity: 'rare', description: '战斗开始时获得4层多层护甲。' },
  { id: 'tingsha', name: '听夏', rarity: 'rare', description: '回合中每丢弃一张牌对随机敌人造成3点伤害。', character: 'silent' },
  { id: 'torii', name: '鸟居', rarity: 'rare', description: '受到5点或以下的未被格挡攻击伤害时减至1点。' },
  { id: 'tough_bandages', name: '坚韧绷带', rarity: 'rare', description: '回合中每丢弃一张牌获得3点格挡。', character: 'silent' },
  { id: 'tungsten_rod', name: '钨棒', rarity: 'rare', description: '失去生命值时少失去1点。' },
  { id: 'turnip', name: '萝卜', rarity: 'rare', description: '不再获得脆弱。' },
  { id: 'unceasing_top', name: '不息陀螺', rarity: 'rare', description: '手牌为空时抽一张牌。' },
  { id: 'wing_boots', name: '羽翼靴', rarity: 'rare', description: '可以选择路径时忽略3次。' },
  
  // Boss遗物
  { id: 'astrolabe', name: '星盘', rarity: 'boss', description: '获得时选择并转化3张牌然后升级它们。' },
  { id: 'black_blood', name: '黑血', rarity: 'boss', description: '替换燃烧之血，战斗结束时恢复12点生命值。', character: 'ironclad' },
  { id: 'black_star', name: '黑星', rarity: 'boss', description: '精英现在被击败时掉落2个遗物。' },
  { id: 'busted_crown', name: '破碎皇冠', rarity: 'boss', description: '回合开始时获得1点能量，卡牌奖励少2个选项。' },
  { id: 'calling_bell', name: '召唤铃', rarity: 'boss', description: '获得时获得一个特殊诅咒和3个遗物。' },
  { id: 'coffee_dripper', name: '咖啡滴滤器', rarity: 'boss', description: '回合开始时获得1点能量，无法在休息处休息。' },
  { id: 'cursed_key', name: '诅咒钥匙', rarity: 'boss', description: '回合开始时获得1点能量，打开非Boss宝箱时获得诅咒。' },
  { id: 'ectoplasm', name: '灵质', rarity: 'boss', description: '回合开始时获得1点能量，无法再获得金币。' },
  { id: 'empty_cage', name: '空笼', rarity: 'boss', description: '获得时从牌组移除2张牌。' },
  { id: 'frozen_core', name: '冰冻核心', rarity: 'boss', description: '替换破裂核心，回合结束时若有空充能球栏位生成1个霜冻球。', character: 'defect' },
  { id: 'fusion_hammer', name: '融合锤', rarity: 'boss', description: '回合开始时获得1点能量，无法在休息处锻造。' },
  { id: 'holy_water', name: '圣水', rarity: 'boss', description: '替换纯水，战斗开始时将3张奇迹加入手牌。', character: 'watcher' },
  { id: 'hovering_kite', name: '悬浮风筝', rarity: 'boss', description: '每回合第一次丢弃牌时获得1点能量。', character: 'silent' },
  { id: 'inserter', name: '插入器', rarity: 'boss', description: '每2回合获得1个充能球栏位。', character: 'defect' },
  { id: 'mark_of_pain', name: '痛苦印记', rarity: 'boss', description: '回合开始时获得1点能量，战斗开始时抽牌堆中有2张伤口。', character: 'ironclad' },
  { id: 'nuclear_battery', name: '核电池', rarity: 'boss', description: '战斗开始时生成1个等离子球。', character: 'defect' },
  { id: 'pandoras_box', name: '潘多拉魔盒', rarity: 'boss', description: '转化所有打击和防御。' },
  { id: 'philosophers_stone', name: '贤者之石', rarity: 'boss', description: '回合开始时获得1点能量，所有敌人开始时获得1点力量。' },
  { id: 'ring_of_the_serpent', name: '蛇环', rarity: 'boss', description: '替换蛇戒，回合开始时额外抽1张牌。', character: 'silent' },
  { id: 'runic_cube', name: '符文立方', rarity: 'boss', description: '失去生命值时抽1张牌。', character: 'ironclad' },
  { id: 'runic_dome', name: '符文圆顶', rarity: 'boss', description: '回合开始时获得1点能量，无法看到敌人意图。' },
  { id: 'runic_pyramid', name: '符文金字塔', rarity: 'boss', description: '回合结束时不再弃牌。' },
  { id: 'sacred_bark', name: '神圣树皮', rarity: 'boss', description: '药水效果翻倍。' },
  { id: 'slavers_collar', name: '奴隶项圈', rarity: 'boss', description: 'Boss和精英战斗回合开始时获得能量。' },
  { id: 'snecko_eye', name: '蛇眼', rarity: 'boss', description: '每回合额外抽2张牌，战斗开始时获得混乱。' },
  { id: 'sozu', name: '苏祖', rarity: 'boss', description: '回合开始时获得1点能量，无法再获得药水。' },
  { id: 'tiny_house', name: '小房子', rarity: 'boss', description: '获得1瓶药水、50金币、最大生命值+5、1张牌、升级1张随机牌。' },
  { id: 'velvet_choker', name: '天鹅绒颈圈', rarity: 'boss', description: '回合开始时获得1点能量，每回合最多打出6张牌。' },
  { id: 'violet_lotus', name: '紫莲花', rarity: 'boss', description: '退出平静姿态时额外获得1点能量。', character: 'watcher' },
  { id: 'wrist_blade', name: '腕刃', rarity: 'boss', description: '费用为0的攻击牌造成4点额外伤害。', character: 'silent' },
  
  // 事件遗物
  { id: 'bloody_idol', name: '血腥偶像', rarity: 'event', description: '获得金币时恢复5点生命值。' },
  { id: 'cultist_headpiece', name: '邪教徒头饰', rarity: 'event', description: '你感觉更健谈了。' },
  { id: 'enchiridion', name: '手册', rarity: 'event', description: '战斗开始时将一张随机能力牌加入手牌，本回合费用为0。' },
  { id: 'face_of_cleric', name: '牧师面容', rarity: 'event', description: '每场战斗后最大生命值+1。' },
  { id: 'golden_idol', name: '黄金偶像', rarity: 'event', description: '敌人掉落金币增加25%。' },
  { id: 'gremlin_visage', name: '地精面容', rarity: 'event', description: '战斗开始时获得1层虚弱。' },
  { id: 'mark_of_the_bloom', name: '绽放印记', rarity: 'event', description: '无法再恢复生命值。' },
  { id: 'mutagenic_strength', name: '变异力量', rarity: 'event', description: '战斗开始时获得3点力量，回合结束时失去。' },
  { id: 'nloths_gift', name: '恩洛斯的礼物', rarity: 'event', description: '获得稀有卡牌的几率变为3倍。' },
  { id: 'nloths_hungry_face', name: '恩洛斯的饥饿面容', rarity: 'event', description: '下一个非Boss宝箱是空的。' },
  { id: 'necronomicon', name: '死灵之书', rarity: 'event', description: '每回合第一张费用2或以上的攻击牌打出两次，获得时被诅咒。' },
  { id: 'neows_lament', name: '尼欧的哀叹', rarity: 'event', description: '前3场战斗的敌人只有1点生命值。' },
  { id: 'nilrys_codex', name: '尼尔里法典', rarity: 'event', description: '回合结束时可以选择3张随机牌之一洗入抽牌堆。' },
  { id: 'odd_mushroom', name: '奇异蘑菇', rarity: 'event', description: '易伤时受到的伤害增加25%而非50%。' },
  { id: 'red_mask', name: '红面具', rarity: 'event', description: '战斗开始时对所有敌人施加1层虚弱。' },
  { id: 'spirit_poop', name: '灵魂粪便', rarity: 'event', description: '令人不快。' },
  { id: 'ssserpent_head', name: '蛇头', rarity: 'event', description: '进入？房间时获得50金币。' },
  { id: 'warped_tongs', name: '扭曲钳子', rarity: 'event', description: '回合开始时升级手牌中一张随机牌。' },
  
  // 商店遗物
  { id: 'brimstone', name: '硫磺', rarity: 'shop', description: '回合开始时获得2点力量，所有敌人获得1点力量。', character: 'ironclad' },
  { id: 'cauldron', name: '大锅', rarity: 'shop', description: '获得时酿造5瓶随机药水。' },
  { id: 'chemical_x', name: '化学X', rarity: 'shop', description: '费用X牌的效果增加2。' },
  { id: 'clockwork_souvenir', name: '发条纪念品', rarity: 'shop', description: '战斗开始时获得1层人工制品。' },
  { id: 'dollys_mirror', name: '多莉的镜子', rarity: 'shop', description: '获得时复制牌组中的一张牌。' },
  { id: 'frozen_eye', name: '冰冻眼睛', rarity: 'shop', description: '查看抽牌堆时按顺序显示。' },
  { id: 'hand_drill', name: '手钻', rarity: 'shop', description: '打破敌人格挡时施加2层易伤。' },
  { id: 'lees_waffle', name: '李的华夫饼', rarity: 'shop', description: '最大生命值+7并恢复全部生命值。' },
  { id: 'medical_kit', name: '医疗包', rarity: 'shop', description: '状态牌可以打出，打出时消耗。' },
  { id: 'melange', name: '混合物', rarity: 'shop', description: '洗牌时预知3张牌。', character: 'watcher' },
  { id: 'membership_card', name: '会员卡', rarity: 'shop', description: '所有商品50%折扣。' },
  { id: 'orange_pellets', name: '橙色颗粒', rarity: 'shop', description: '单回合打出能力、攻击、技能牌时移除所有负面效果。' },
  { id: 'orrery', name: '太阳系仪', rarity: 'shop', description: '选择并向牌组添加5张牌。' },
  { id: 'prismatic_shard', name: '棱镜碎片', rarity: 'shop', description: '战斗奖励现在包含无色牌和其他颜色的牌。' },
  { id: 'runic_capacitor', name: '符文电容器', rarity: 'shop', description: '战斗开始时获得3个额外充能球栏位。', character: 'defect' },
  { id: 'sling_of_courage', name: '勇气投石索', rarity: 'shop', description: '精英战斗开始时获得2点力量。' },
  { id: 'strange_spoon', name: '奇异勺子', rarity: 'shop', description: '打出时会消耗的牌有50%几率改为丢弃。' },
  { id: 'the_abacus', name: '算盘', rarity: 'shop', description: '洗牌时获得6点格挡。' },
  { id: 'toolbox', name: '工具箱', rarity: 'shop', description: '战斗开始时选择3张随机无色牌之一加入手牌。' },
  { id: 'twisted_funnel', name: '扭曲漏斗', rarity: 'shop', description: '战斗开始时对所有敌人施加4层中毒。', character: 'silent' },
];

// 预设药水数据
export const PRESET_POTIONS: Potion[] = [
  // 普通药水
  { id: 'energy_potion', name: '能量药水', rarity: 'common', description: '获得2点能量。' },
  { id: 'explosive_potion', name: '爆炸药水', rarity: 'common', description: '对所有敌人造成10点伤害。' },
  { id: 'fire_potion', name: '火焰药水', rarity: 'common', description: '对目标敌人造成20点伤害。' },
  { id: 'block_potion', name: '格挡药水', rarity: 'common', description: '获得12点格挡。' },
  { id: 'strength_potion', name: '力量药水', rarity: 'common', description: '获得2点力量。' },
  { id: 'dexterity_potion', name: '敏捷药水', rarity: 'common', description: '获得2点敏捷。' },
  { id: 'swift_potion', name: '迅捷药水', rarity: 'common', description: '抽3张牌。' },
  { id: 'fear_potion', name: '恐惧药水', rarity: 'common', description: '施加3层易伤。' },
  { id: 'weak_potion', name: '虚弱药水', rarity: 'common', description: '施加3层虚弱。' },
  { id: 'flex_potion', name: '弹性药水', rarity: 'common', description: '获得5点力量，回合结束时失去。' },
  { id: 'speed_potion', name: '速度药水', rarity: 'common', description: '获得5点敏捷，回合结束时失去。' },
  { id: 'blessing_of_the_forge', name: '锻造祝福', rarity: 'common', description: '升级手牌中所有牌。' },
  { id: 'colorless_potion', name: '无色药水', rarity: 'common', description: '选择3张随机无色牌之一加入手牌，本回合费用为0。' },
  { id: 'attack_potion', name: '攻击药水', rarity: 'common', description: '选择3张随机攻击牌之一加入手牌，本回合费用为0。' },
  { id: 'skill_potion', name: '技能药水', rarity: 'common', description: '选择3张随机技能牌之一加入手牌，本回合费用为0。' },
  { id: 'power_potion', name: '能力药水', rarity: 'common', description: '选择3张随机能力牌之一加入手牌，本回合费用为0。' },
  { id: 'blood_potion', name: '鲜血药水', rarity: 'common', description: '恢复20%最大生命值。', character: 'ironclad' },
  { id: 'focus_potion', name: '集中药水', rarity: 'common', description: '获得2点集中。', character: 'defect' },
  { id: 'bottled_miracle', name: '瓶装奇迹', rarity: 'common', description: '将2张奇迹加入手牌。', character: 'watcher' },
  { id: 'poison_potion', name: '毒药', rarity: 'common', description: '施加6层中毒。', character: 'silent' },
  
  // 罕见药水
  { id: 'ancient_potion', name: '远古药水', rarity: 'uncommon', description: '获得1层人工制品。' },
  { id: 'distilled_chaos', name: '蒸馏混沌', rarity: 'uncommon', description: '打出抽牌堆顶的3张牌。' },
  { id: 'duplication_potion', name: '复制药水', rarity: 'uncommon', description: '本回合下一张牌打出两次。' },
  { id: 'essence_of_steel', name: '钢铁精华', rarity: 'uncommon', description: '获得4层多层护甲。' },
  { id: 'gambler_brew', name: '赌徒酿造', rarity: 'uncommon', description: '丢弃任意数量牌然后抽等量的牌。' },
  { id: 'liquid_bronze', name: '液态青铜', rarity: 'uncommon', description: '获得3层荆棘。' },
  { id: 'liquid_memories', name: '液态记忆', rarity: 'uncommon', description: '选择弃牌堆中1张牌返回手牌，本回合费用为0。' },
  { id: 'regen_potion', name: '再生药水', rarity: 'uncommon', description: '获得5层再生。' },
  { id: 'elixir', name: '灵药', rarity: 'uncommon', description: '消耗手牌中任意数量的牌。', character: 'ironclad' },
  { id: 'cunning_potion', name: '狡猾药水', rarity: 'uncommon', description: '将3张升级小刀加入手牌。', character: 'silent' },
  { id: 'potion_of_capacity', name: '容量药水', rarity: 'uncommon', description: '获得2个充能球栏位。', character: 'defect' },
  { id: 'stance_potion', name: '姿态药水', rarity: 'uncommon', description: '进入平静或愤怒姿态。', character: 'watcher' },
  
  // 稀有药水
  { id: 'ambrosia', name: '仙馐', rarity: 'rare', description: '进入神性姿态。', character: 'watcher' },
  { id: 'cultist_potion', name: '邪教徒药水', rarity: 'rare', description: '获得1层仪式。' },
  { id: 'entropic_brew', name: '熵酿', rarity: 'rare', description: '用随机药水填满所有空药水栏位。' },
  { id: 'essence_of_darkness', name: '黑暗精华', rarity: 'rare', description: '每个充能球栏位生成1个黑暗球。', character: 'defect' },
  { id: 'fairy_in_bottle', name: '瓶中仙女', rarity: 'rare', description: '死亡时改为恢复30%最大生命值并丢弃此药水。' },
  { id: 'fruit_juice', name: '果汁', rarity: 'rare', description: '最大生命值+5。' },
  { id: 'ghost_in_jar', name: '罐中幽灵', rarity: 'rare', description: '获得1层无形。', character: 'silent' },
  { id: 'heart_of_iron', name: '钢铁之心', rarity: 'rare', description: '获得6层金属化。', character: 'ironclad' },
  { id: 'smoke_bomb', name: '烟雾弹', rarity: 'rare', description: '逃离非Boss战斗，无奖励。' },
  { id: 'snecko_oil', name: '蛇油', rarity: 'rare', description: '抽5张牌，本回合随机化所有手牌费用。' },
];

// 预设敌人数据
export const PRESET_ENEMIES = [
  { name: '酸液史莱姆(小)', type: 'normal' as EnemyType, maxHp: 15 },
  { name: '酸液史莱姆(大)', type: 'normal' as EnemyType, maxHp: 35 },
  { name: '尖刺史莱姆(小)', type: 'normal' as EnemyType, maxHp: 20 },
  { name: '尖刺史莱姆(大)', type: 'normal' as EnemyType, maxHp: 42 },
  { name: '红虱虫', type: 'normal' as EnemyType, maxHp: 28 },
  { name: '绿虱虫', type: 'normal' as EnemyType, maxHp: 22 },
  { name: '蓝虱虫', type: 'normal' as EnemyType, maxHp: 30 },
  { name: '霉菌武士', type: 'normal' as EnemyType, maxHp: 50 },
  { name: '邪教徒', type: 'normal' as EnemyType, maxHp: 50 },
  { name: 'jaw蛇', type: 'normal' as EnemyType, maxHp: 45 },
  { name: '抢劫的', type: 'normal' as EnemyType, maxHp: 50 },
  { name: '大颚虫', type: 'normal' as EnemyType, maxHp: 40 },
  { name: '圆球守护者', type: 'elite' as EnemyType, maxHp: 80 },
  { name: '地精大块头', type: 'elite' as EnemyType, maxHp: 82 },
  { name: '乐加维林', type: 'elite' as EnemyType, maxHp: 112 },
  { name: '哨卫', type: 'boss' as EnemyType, maxHp: 125 },
  { name: '六火亡魂', type: 'boss' as EnemyType, maxHp: 120 },
  { name: '史莱姆老大', type: 'boss' as EnemyType, maxHp: 140 },
];

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
