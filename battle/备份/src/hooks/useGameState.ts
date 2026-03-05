import { useState, useCallback } from 'react';
import type { 
  GameState, 
  Character, 
  Enemy, 
  Card, 
  Buff, 
  DeckState,
  CharacterClass,
  EnemyIntent,
  Relic,
  Potion,
  GameProgress,
  EnemyDetails
} from '@/types/game';

const defaultCharacter: Character = {
  class: 'watcher',
  currentHp: 72,
  maxHp: 72,
  block: 0,
  energy: 3,
  maxEnergy: 3,
  buffs: [],
};

const defaultEnemyDetails: EnemyDetails = {
  description: '',
  behavior: '',
  specialMechanics: '',
  recommendedStrategy: '',
};

const defaultEnemy: Enemy = {
  id: 'enemy-1',
  name: '酸液史莱姆(小)',
  type: 'normal',
  currentHp: 15,
  maxHp: 15,
  block: 0,
  buffs: [],
  intent: { type: 'attack', value: 5, description: '准备攻击造成5点伤害' },
  details: { ...defaultEnemyDetails },
};

const defaultDeckState: DeckState = {
  deck: [],
  hand: [],
  drawPile: [],
  discardPile: [],
  exhaustPile: [],
};

const defaultProgress: GameProgress = {
  act: 1,
  floor: 1,
};

const defaultGameState: GameState = {
  character: defaultCharacter,
  enemies: [defaultEnemy],
  deckState: defaultDeckState,
  turn: 1,
  relics: [],
  potions: [],
  progress: defaultProgress,
  gold: 100,          // 默认金钱
  maxPotionSlots: 3,  // 默认3个药水栏位
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(defaultGameState);

  // 角色相关操作
  const updateCharacter = useCallback((updates: Partial<Character>) => {
    setGameState(prev => ({
      ...prev,
      character: { ...prev.character, ...updates },
    }));
  }, []);

  const setCharacterClass = useCallback((characterClass: CharacterClass) => {
    setGameState(prev => ({
      ...prev,
      character: { ...prev.character, class: characterClass },
    }));
  }, []);

  const setCharacterHp = useCallback((currentHp: number, maxHp?: number) => {
    setGameState(prev => ({
      ...prev,
      character: { 
        ...prev.character, 
        currentHp, 
        maxHp: maxHp ?? prev.character.maxHp 
      },
    }));
  }, []);

  const setEnergy = useCallback((energy: number, maxEnergy?: number) => {
    setGameState(prev => ({
      ...prev,
      character: { 
        ...prev.character, 
        energy, 
        maxEnergy: maxEnergy ?? prev.character.maxEnergy 
      },
    }));
  }, []);

  const setBlock = useCallback((block: number) => {
    setGameState(prev => ({
      ...prev,
      character: { ...prev.character, block },
    }));
  }, []);

  // Buff相关操作
  const addCharacterBuff = useCallback((buff: Buff) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        buffs: [...prev.character.buffs, buff],
      },
    }));
  }, []);

  const removeCharacterBuff = useCallback((buffId: string) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        buffs: prev.character.buffs.filter(b => b.id !== buffId),
      },
    }));
  }, []);

  const updateCharacterBuffStacks = useCallback((buffId: string, stacks: number) => {
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character,
        buffs: prev.character.buffs.map(b => 
          b.id === buffId ? { ...b, stacks } : b
        ),
      },
    }));
  }, []);

  // 敌人相关操作
  const addEnemy = useCallback((enemy: Enemy) => {
    setGameState(prev => ({
      ...prev,
      enemies: [...prev.enemies, enemy],
    }));
  }, []);

  const removeEnemy = useCallback((enemyId: string) => {
    setGameState(prev => ({
      ...prev,
      enemies: prev.enemies.filter(e => e.id !== enemyId),
    }));
  }, []);

  const updateEnemy = useCallback((enemyId: string, updates: Partial<Enemy>) => {
    setGameState(prev => ({
      ...prev,
      enemies: prev.enemies.map(e => 
        e.id === enemyId ? { ...e, ...updates } : e
      ),
    }));
  }, []);

  const updateEnemyDetails = useCallback((enemyId: string, details: Partial<EnemyDetails>) => {
    setGameState(prev => ({
      ...prev,
      enemies: prev.enemies.map(e => 
        e.id === enemyId ? { ...e, details: { ...e.details, ...details } } : e
      ),
    }));
  }, []);

  const setEnemyHp = useCallback((enemyId: string, currentHp: number, maxHp?: number) => {
    setGameState(prev => ({
      ...prev,
      enemies: prev.enemies.map(e => 
        e.id === enemyId 
          ? { ...e, currentHp, maxHp: maxHp ?? e.maxHp } 
          : e
      ),
    }));
  }, []);

  const setEnemyBlock = useCallback((enemyId: string, block: number) => {
    setGameState(prev => ({
      ...prev,
      enemies: prev.enemies.map(e => 
        e.id === enemyId ? { ...e, block } : e
      ),
    }));
  }, []);

  const setEnemyIntent = useCallback((enemyId: string, intent: EnemyIntent) => {
    setGameState(prev => ({
      ...prev,
      enemies: prev.enemies.map(e => 
        e.id === enemyId ? { ...e, intent } : e
      ),
    }));
  }, []);

  const addEnemyBuff = useCallback((enemyId: string, buff: Buff) => {
    setGameState(prev => ({
      ...prev,
      enemies: prev.enemies.map(e => 
        e.id === enemyId 
          ? { ...e, buffs: [...e.buffs, buff] } 
          : e
      ),
    }));
  }, []);

  const removeEnemyBuff = useCallback((enemyId: string, buffId: string) => {
    setGameState(prev => ({
      ...prev,
      enemies: prev.enemies.map(e => 
        e.id === enemyId 
          ? { ...e, buffs: e.buffs.filter(b => b.id !== buffId) } 
          : e
      ),
    }));
  }, []);

  const updateEnemyBuffStacks = useCallback((enemyId: string, buffId: string, stacks: number) => {
    setGameState(prev => ({
      ...prev,
      enemies: prev.enemies.map(e => 
        e.id === enemyId 
          ? { 
              ...e, 
              buffs: e.buffs.map(b => 
                b.id === buffId ? { ...b, stacks } : b
              ) 
            } 
          : e
      ),
    }));
  }, []);

  // 卡牌相关操作
  const setDeck = useCallback((deck: Card[]) => {
    setGameState(prev => ({
      ...prev,
      deckState: { ...prev.deckState, deck },
    }));
  }, []);

  const setHand = useCallback((hand: Card[]) => {
    setGameState(prev => ({
      ...prev,
      deckState: { ...prev.deckState, hand },
    }));
  }, []);

  const setDrawPile = useCallback((drawPile: Card[]) => {
    setGameState(prev => ({
      ...prev,
      deckState: { ...prev.deckState, drawPile },
    }));
  }, []);

  const setDiscardPile = useCallback((discardPile: Card[]) => {
    setGameState(prev => ({
      ...prev,
      deckState: { ...prev.deckState, discardPile },
    }));
  }, []);

  const setExhaustPile = useCallback((exhaustPile: Card[]) => {
    setGameState(prev => ({
      ...prev,
      deckState: { ...prev.deckState, exhaustPile },
    }));
  }, []);

  const addCardToHand = useCallback((card: Card) => {
    setGameState(prev => ({
      ...prev,
      deckState: { 
        ...prev.deckState, 
        hand: [...prev.deckState.hand, card] 
      },
    }));
  }, []);

  const removeCardFromHand = useCallback((cardId: string) => {
    setGameState(prev => ({
      ...prev,
      deckState: { 
        ...prev.deckState, 
        hand: prev.deckState.hand.filter(c => c.id !== cardId) 
      },
    }));
  }, []);

  const moveCardToDiscard = useCallback((cardId: string) => {
    setGameState(prev => {
      const card = prev.deckState.hand.find(c => c.id === cardId);
      if (!card) return prev;
      return {
        ...prev,
        deckState: {
          ...prev.deckState,
          hand: prev.deckState.hand.filter(c => c.id !== cardId),
          discardPile: [...prev.deckState.discardPile, card],
        },
      };
    });
  }, []);

  const moveCardToExhaust = useCallback((cardId: string) => {
    setGameState(prev => {
      const card = prev.deckState.hand.find(c => c.id === cardId);
      if (!card) return prev;
      return {
        ...prev,
        deckState: {
          ...prev.deckState,
          hand: prev.deckState.hand.filter(c => c.id !== cardId),
          exhaustPile: [...prev.deckState.exhaustPile, card],
        },
      };
    });
  }, []);

  // 从任意位置移动卡牌到指定堆
  const moveCardFromTo = useCallback((
    cardId: string, 
    from: 'hand' | 'draw' | 'discard' | 'exhaust',
    to: 'hand' | 'draw' | 'discard' | 'exhaust'
  ) => {
    if (from === to) return;

    setGameState(prev => {
      const sourcePile = from === 'hand' ? prev.deckState.hand :
                        from === 'draw' ? prev.deckState.drawPile :
                        from === 'discard' ? prev.deckState.discardPile :
                        prev.deckState.exhaustPile;
      
      const card = sourcePile.find(c => c.id === cardId);
      if (!card) return prev;

      const newState = {
        ...prev,
        deckState: {
          ...prev.deckState,
          hand: from === 'hand' ? prev.deckState.hand.filter(c => c.id !== cardId) : 
                to === 'hand' ? [...prev.deckState.hand, card] : prev.deckState.hand,
          drawPile: from === 'draw' ? prev.deckState.drawPile.filter(c => c.id !== cardId) :
                    to === 'draw' ? [...prev.deckState.drawPile, card] : prev.deckState.drawPile,
          discardPile: from === 'discard' ? prev.deckState.discardPile.filter(c => c.id !== cardId) :
                       to === 'discard' ? [...prev.deckState.discardPile, card] : prev.deckState.discardPile,
          exhaustPile: from === 'exhaust' ? prev.deckState.exhaustPile.filter(c => c.id !== cardId) :
                       to === 'exhaust' ? [...prev.deckState.exhaustPile, card] : prev.deckState.exhaustPile,
        },
      };
      return newState;
    });
  }, []);

  // 从任意堆中删除卡牌
  const removeCardFromPile = useCallback((
    cardId: string,
    pile: 'hand' | 'draw' | 'discard' | 'exhaust'
  ) => {
    setGameState(prev => ({
      ...prev,
      deckState: {
        ...prev.deckState,
        hand: pile === 'hand' ? prev.deckState.hand.filter(c => c.id !== cardId) : prev.deckState.hand,
        drawPile: pile === 'draw' ? prev.deckState.drawPile.filter(c => c.id !== cardId) : prev.deckState.drawPile,
        discardPile: pile === 'discard' ? prev.deckState.discardPile.filter(c => c.id !== cardId) : prev.deckState.discardPile,
        exhaustPile: pile === 'exhaust' ? prev.deckState.exhaustPile.filter(c => c.id !== cardId) : prev.deckState.exhaustPile,
      },
    }));
  }, []);

  // 添加卡牌到指定堆
  const addCardToPile = useCallback((card: Card, pile: 'hand' | 'draw' | 'discard' | 'exhaust') => {
    setGameState(prev => ({
      ...prev,
      deckState: {
        ...prev.deckState,
        hand: pile === 'hand' ? [...prev.deckState.hand, card] : prev.deckState.hand,
        drawPile: pile === 'draw' ? [...prev.deckState.drawPile, card] : prev.deckState.drawPile,
        discardPile: pile === 'discard' ? [...prev.deckState.discardPile, card] : prev.deckState.discardPile,
        exhaustPile: pile === 'exhaust' ? [...prev.deckState.exhaustPile, card] : prev.deckState.exhaustPile,
      },
    }));
  }, []);

  // 遗物相关操作
  const addRelic = useCallback((relic: Relic) => {
    setGameState(prev => ({
      ...prev,
      relics: [...prev.relics, relic],
    }));
  }, []);

  const removeRelic = useCallback((relicId: string) => {
    setGameState(prev => ({
      ...prev,
      relics: prev.relics.filter(r => r.id !== relicId),
    }));
  }, []);

  // 药水相关操作
  const addPotion = useCallback((potion: Potion) => {
    setGameState(prev => ({
      ...prev,
      potions: [...prev.potions, potion],
    }));
  }, []);

  const removePotion = useCallback((potionId: string) => {
    setGameState(prev => ({
      ...prev,
      potions: prev.potions.filter(p => p.id !== potionId),
    }));
  }, []);

  // 进度相关操作
  const setProgress = useCallback((progress: Partial<GameProgress>) => {
    setGameState(prev => ({
      ...prev,
      progress: { ...prev.progress, ...progress },
    }));
  }, []);

  // 回合相关
  const setTurn = useCallback((turn: number) => {
    setGameState(prev => ({ ...prev, turn }));
  }, []);

  const nextTurn = useCallback(() => {
    setGameState(prev => ({ ...prev, turn: prev.turn + 1 }));
  }, []);

  // 重置游戏状态
  const resetGameState = useCallback(() => {
    setGameState(defaultGameState);
  }, []);

  // 设置完整游戏状态
  const setFullGameState = useCallback((state: GameState) => {
    setGameState(state);
  }, []);

  // 金钱相关操作
  const setGold = useCallback((gold: number) => {
    setGameState(prev => ({ ...prev, gold }));
  }, []);

  // 药水栏位相关操作
  const setMaxPotionSlots = useCallback((maxPotionSlots: number) => {
    setGameState(prev => ({ ...prev, maxPotionSlots }));
  }, []);

  return {
    gameState,
    // 角色操作
    updateCharacter,
    setCharacterClass,
    setCharacterHp,
    setEnergy,
    setBlock,
    addCharacterBuff,
    removeCharacterBuff,
    updateCharacterBuffStacks,
    // 敌人操作
    addEnemy,
    removeEnemy,
    updateEnemy,
    updateEnemyDetails,
    setEnemyHp,
    setEnemyBlock,
    setEnemyIntent,
    addEnemyBuff,
    removeEnemyBuff,
    updateEnemyBuffStacks,
    // 卡牌操作
    setDeck,
    setHand,
    setDrawPile,
    setDiscardPile,
    setExhaustPile,
    addCardToHand,
    removeCardFromHand,
    moveCardToDiscard,
    moveCardToExhaust,
    // 遗物操作
    addRelic,
    removeRelic,
    // 药水操作
    addPotion,
    removePotion,
    // 进度操作
    setProgress,
    // 回合操作
    setTurn,
    nextTurn,
    // 全局操作
    resetGameState,
    setFullGameState,
    // 金钱操作
    setGold,
    // 药水栏位操作
    setMaxPotionSlots,
    // 高级卡牌操作
    moveCardFromTo,
    removeCardFromPile,
    addCardToPile,
  };
}
