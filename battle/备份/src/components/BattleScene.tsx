import { useState } from 'react';
import type { GameState, Card, CharacterClass } from '@/types/game';
import { CHARACTER_NAMES } from '@/types/game';
import { RelicSystem } from './RelicSystem';
import { PotionSystem } from './PotionSystem';
import { CardActionsDialog } from './CardActionsDialog';
import { Button } from '@/components/ui/button';

import { 
  Heart, 
  Zap, 
  Shield, 
  Layers, 
  Package, 
  Flame, 
  Swords, 
  Plus,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BattleSceneProps {
  gameState: GameState;
  onEditCharacter: () => void;
  onEditEnemy: (enemyId: string) => void;
  onViewEnemyInfo: (enemyId: string) => void;
  onEditHand: () => void;
  onEditDrawPile: () => void;
  onEditDiscardPile: () => void;
  onEditExhaustPile: () => void;
  onAddEnemy: () => void;
  onPlayCard?: (card: Card) => void;
  onAddRelic: (relic: any) => void;
  onRemoveRelic: (relicId: string) => void;
  onAddPotion: (potion: any) => void;
  onRemovePotion: (potionId: string) => void;
  onUpdateProgress: (progress: { act?: number; floor?: number }) => void;
  onChangeCharacterClass: (characterClass: CharacterClass) => void;
  onSetGold?: (gold: number) => void;
  onSetMaxPotionSlots?: (slots: number) => void;
  onSetTurn?: (turn: number) => void;
  onMoveCardFromHand?: (cardId: string, destination: 'draw' | 'discard' | 'exhaust') => void;
  onRemoveCardFromHand?: (cardId: string) => void;
}

export function BattleScene({
  gameState,
  onEditCharacter,
  onEditEnemy,
  onViewEnemyInfo,
  onEditHand,
  onEditDrawPile,
  onEditDiscardPile,
  onEditExhaustPile,
  onAddEnemy,
  onAddRelic,
  onRemoveRelic,
  onAddPotion,
  onRemovePotion,
  onUpdateProgress,
  onChangeCharacterClass,
  onSetGold,
  onSetMaxPotionSlots,
  onSetTurn,
  onMoveCardFromHand,
  onRemoveCardFromHand,
}: BattleSceneProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [cardActionsOpen, setCardActionsOpen] = useState(false);

  const { character, enemies, deckState, turn, relics, potions, progress } = gameState;

  const characterClasses: CharacterClass[] = ['ironclad', 'silent', 'defect', 'watcher'];

  const getClassIcon = (characterClass: string) => {
    switch (characterClass) {
      case 'ironclad': return '🔴';
      case 'silent': return '🟢';
      case 'defect': return '🔵';
      case 'watcher': return '🟣';
      default: return '⚪';
    }
  };

  const getBuffColor = (type: 'buff' | 'debuff') => {
    return type === 'buff' 
      ? 'bg-green-600 text-white' 
      : 'bg-red-600 text-white';
  };

  const getIntentIcon = (type: string) => {
    switch (type) {
      case 'attack': return '⚔️';
      case 'defend': return '🛡️';
      case 'buff': return '⚡';
      case 'debuff': return '💀';
      case 'sleep': return '💤';
      default: return '❓';
    }
  };

  const getIntentColor = (type: string) => {
    switch (type) {
      case 'attack': return 'text-red-400';
      case 'defend': return 'text-blue-400';
      case 'buff': return 'text-green-400';
      case 'debuff': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getCardColor = (color: string) => {
    switch (color) {
      case 'red': return 'from-red-900 to-red-800 border-red-700';
      case 'green': return 'from-green-900 to-green-800 border-green-700';
      case 'blue': return 'from-cyan-900 to-cyan-800 border-cyan-700';
      case 'purple': return 'from-purple-900 to-purple-800 border-purple-700';
      case 'colorless': return 'from-gray-700 to-gray-600 border-gray-500';
      default: return 'from-gray-800 to-gray-700 border-gray-600';
    }
  };

  const getCardTypeIcon = (type: string) => {
    switch (type) {
      case 'attack': return '⚔️';
      case 'skill': return '🛡️';
      case 'power': return '⚡';
      default: return '📄';
    }
  };

  const handlePrevClass = () => {
    const currentIndex = characterClasses.indexOf(character.class);
    const newIndex = currentIndex === 0 ? characterClasses.length - 1 : currentIndex - 1;
    onChangeCharacterClass(characterClasses[newIndex]);
  };

  const handleNextClass = () => {
    const currentIndex = characterClasses.indexOf(character.class);
    const newIndex = currentIndex === characterClasses.length - 1 ? 0 : currentIndex + 1;
    onChangeCharacterClass(characterClasses[newIndex]);
  };

  return (
    <div className="relative w-full h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* 顶部信息栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 backdrop-blur-sm border-b border-gray-700/50">
        <div className="flex items-center gap-4">
          {/* Act和层数 - 可编辑 */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-yellow-400" />
            <div className="flex items-center gap-1 text-yellow-400">
              <span>Act</span>
              <input
                type="number"
                value={progress.act}
                onChange={(e) => onUpdateProgress({ act: parseInt(e.target.value) || 1 })}
                className="w-8 bg-transparent text-center font-bold focus:outline-none focus:bg-gray-800 rounded border border-transparent focus:border-gray-600"
                min={1}
                max={4}
              />
            </div>
            <div className="flex items-center gap-1">
              <Button 
                size="icon" 
                variant="ghost" 
                className="w-5 h-5"
                onClick={() => onUpdateProgress({ floor: Math.max(1, progress.floor - 1) })}
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>
              <input
                type="number"
                value={progress.floor}
                onChange={(e) => onUpdateProgress({ floor: parseInt(e.target.value) || 1 })}
                className="w-10 bg-transparent text-center text-sm focus:outline-none focus:bg-gray-800 rounded border border-transparent focus:border-gray-600"
                min={1}
              />
              <span className="text-sm text-gray-300">层</span>
              <Button 
                size="icon" 
                variant="ghost" 
                className="w-5 h-5"
                onClick={() => onUpdateProgress({ floor: progress.floor + 1 })}
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <div className="h-4 w-px bg-gray-700" />
          
          {/* 回合 - 可编辑 */}
          <div className="flex items-center gap-1 text-blue-400">
            <span>回合</span>
            <input
              type="number"
              value={turn}
              onChange={(e) => onSetTurn?.(parseInt(e.target.value) || 1)}
              className="w-10 bg-transparent text-center font-bold focus:outline-none focus:bg-gray-800 rounded border border-transparent focus:border-gray-600"
              min={1}
            />
          </div>
          
          <div className="h-4 w-px bg-gray-700" />
          
          {/* 金钱 - 可编辑 */}
          <div className="flex items-center gap-1 text-amber-400">
            <span>💰</span>
            <input
              type="number"
              value={gameState.gold}
              onChange={(e) => onSetGold?.(parseInt(e.target.value) || 0)}
              className="w-14 bg-transparent text-center font-bold focus:outline-none focus:bg-gray-800 rounded border border-transparent focus:border-gray-600"
              min={0}
            />
            <span className="text-xs">G</span>
          </div>
          
          <div className="h-4 w-px bg-gray-700" />
          
          {/* 能量 - 可编辑 */}
          <div className="flex items-center gap-1 text-yellow-400">
            <Zap className="w-4 h-4" />
            <input
              type="number"
              value={character.energy}
              onChange={() => {}}
              className="w-8 bg-transparent text-center font-bold focus:outline-none focus:bg-gray-800 rounded border border-transparent focus:border-gray-600 cursor-pointer"
              min={0}
              readOnly
              title="点击编辑能量"
              onClick={onEditCharacter}
            />
            <span className="font-bold">/</span>
            <input
              type="number"
              value={character.maxEnergy}
              onChange={() => {}}
              className="w-8 bg-transparent text-center font-bold focus:outline-none focus:bg-gray-800 rounded border border-transparent focus:border-gray-600 cursor-pointer"
              min={1}
              readOnly
              title="点击编辑最大能量"
              onClick={onEditCharacter}
            />
          </div>
        </div>

        {/* 药水系统 */}
        <div className="flex items-center gap-2">
          <PotionSystem 
            potions={potions}
            maxPotionSlots={gameState.maxPotionSlots}
            onAddPotion={onAddPotion} 
            onRemovePotion={onRemovePotion} 
          />
          {/* 最大药水栏位编辑 */}
          <div className="flex items-center gap-1 text-blue-400 text-xs ml-2">
            <span>栏位:</span>
            <input
              type="number"
              value={gameState.maxPotionSlots}
              onChange={(e) => onSetMaxPotionSlots?.(parseInt(e.target.value) || 1)}
              className="w-8 bg-transparent text-center font-bold focus:outline-none focus:bg-gray-800 rounded border border-transparent focus:border-gray-600"
              min={1}
              max={5}
            />
          </div>
        </div>
      </div>

      {/* 主战斗区域 */}
      <div className="flex-1 flex relative">
        {/* 左侧 - 遗物和角色 */}
        <div className="w-64 flex flex-col gap-3 p-3">
          {/* 遗物系统 */}
          <RelicSystem 
            relics={relics} 
            onAddRelic={onAddRelic} 
            onRemoveRelic={onRemoveRelic} 
          />
          
          {/* 角色区域 */}
          <div 
            onClick={onEditCharacter}
            className="flex-1 bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 cursor-pointer group transition-all hover:border-purple-500/50"
          >
            {/* 职业切换 */}
            <div className="flex items-center justify-between mb-3">
              <Button 
                size="icon" 
                variant="ghost" 
                className="w-6 h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevClass();
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-gray-400">切换职业</span>
              <Button 
                size="icon" 
                variant="ghost" 
                className="w-6 h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextClass();
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* 角色主体 */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-4 border-gray-600 flex items-center justify-center text-5xl shadow-2xl group-hover:border-purple-500 transition-colors">
                  {getClassIcon(character.class)}
                </div>
                <div className="absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-0.5 rounded text-xs">
                  点击编辑
                </div>
              </div>

              {/* 角色信息 */}
              <div className="mt-3 text-center">
                <div className="text-base font-bold text-white">
                  {CHARACTER_NAMES[character.class]}
                </div>
                
                {/* 血条 */}
                <div className="mt-2 w-36 mx-auto">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <Heart className="w-3 h-3 text-red-500" />
                    <span className="text-red-400 font-bold">{character.currentHp}/{character.maxHp}</span>
                  </div>
                  <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all"
                      style={{ width: `${(character.currentHp / character.maxHp) * 100}%` }}
                    />
                  </div>
                </div>

                {/* 格挡 */}
                {character.block > 0 && (
                  <div className="mt-2 flex items-center justify-center gap-1 text-blue-400 text-sm">
                    <Shield className="w-3 h-3" />
                    <span className="font-bold">{character.block}</span>
                  </div>
                )}

                {/* Buffs */}
                {character.buffs.length > 0 && (
                  <div className="mt-2 flex flex-wrap justify-center gap-1 max-w-40">
                    {character.buffs.map(buff => (
                      <div
                        key={buff.id}
                        className={cn(
                          'px-1.5 py-0.5 rounded text-xs font-medium',
                          getBuffColor(buff.type)
                        )}
                      >
                        {buff.name}
                        {buff.stacks > 1 && buff.stacks}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 中间 - 战斗区域 */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* 背景装饰 */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600 rounded-full blur-3xl" />
          </div>

          {/* VS 标志 */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl text-gray-600 font-bold opacity-30 pointer-events-none">
            <Swords className="w-12 h-12" />
          </div>
        </div>

        {/* 右侧 - 敌人区域 */}
        <div className="w-64 flex flex-col gap-3 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">敌人</span>
            <Button size="sm" variant="outline" onClick={onAddEnemy}>
              <Plus className="w-3 h-3 mr-1" />
              添加
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {enemies.length === 0 ? (
              <div 
                onClick={onAddEnemy}
                className="h-32 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-gray-500 transition-colors"
              >
                <Plus className="w-8 h-8 text-gray-500" />
              </div>
            ) : (
              enemies.map(enemy => (
                <div 
                  key={enemy.id}
                  className={cn(
                    'relative rounded-lg p-3 border transition-all cursor-pointer group',
                    enemy.type === 'boss' ? 'bg-red-900/20 border-red-700/50' :
                    enemy.type === 'elite' ? 'bg-yellow-900/20 border-yellow-700/50' :
                    'bg-gray-800/50 border-gray-700/50',
                    'hover:border-opacity-100'
                  )}
                >
                  {/* 查看详情按钮 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewEnemyInfo(enemy.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Info className="w-4 h-4 text-blue-400" />
                  </button>

                  <div onClick={() => onEditEnemy(enemy.id)}>
                    {/* 敌人头部 */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {enemy.type === 'boss' ? '👹' : enemy.type === 'elite' ? '💀' : '👾'}
                      </span>
                      <span className="font-medium text-sm">{enemy.name}</span>
                    </div>

                    {/* 血条 */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <Heart className="w-3 h-3 text-red-500" />
                        <span className="text-red-400">{enemy.currentHp}/{enemy.maxHp}</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all"
                          style={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* 格挡和意图 */}
                    <div className="flex items-center justify-between text-xs">
                      {enemy.block > 0 && (
                        <span className="text-blue-400 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {enemy.block}
                        </span>
                      )}
                      <span className={cn("flex items-center gap-1 ml-auto", getIntentColor(enemy.intent.type))}>
                        {getIntentIcon(enemy.intent.type)}
                        {enemy.intent.value && ` ${enemy.intent.value}`}
                      </span>
                    </div>

                    {/* Buffs */}
                    {enemy.buffs.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {enemy.buffs.map(buff => (
                          <div
                            key={buff.id}
                            className={cn(
                              'px-1 py-0.5 rounded text-xs font-medium',
                              getBuffColor(buff.type)
                            )}
                          >
                            {buff.name}
                            {buff.stacks > 1 && buff.stacks}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 底部区域 */}
      <div className="relative">
        {/* 手牌区域 */}
        <div 
          onClick={onEditHand}
          className="bg-gradient-to-t from-black/80 to-transparent px-8 py-4 cursor-pointer group"
        >
          <div className="flex items-end justify-center gap-2">
            {deckState.hand.length === 0 ? (
              <div className="text-gray-500 text-center py-6 group-hover:text-gray-400 transition-colors">
                <p>点击此处添加手牌</p>
              </div>
            ) : (
              deckState.hand.map((card) => (
                <div
                  key={card.id}
                  className={cn(
                    "relative w-20 h-28 rounded-lg bg-gradient-to-br border-2 flex flex-col p-1.5 transition-all cursor-pointer",
                    getCardColor(card.color),
                    hoveredCard === card.id ? "transform -translate-y-3 scale-105 z-20" : "hover:-translate-y-1"
                  )}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCard(card);
                    setCardActionsOpen(true);
                  }}
                >
                  {/* 费用 */}
                  <div className="absolute -top-2 -left-1.5 w-5 h-5 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    {card.cost}
                  </div>
                  
                  {/* 升级标记 */}
                  {card.upgraded && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-yellow-500 border border-yellow-300 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      +
                    </div>
                  )}

                  {/* 类型图标 */}
                  <div className="absolute top-1 right-1 text-sm">
                    {getCardTypeIcon(card.type)}
                  </div>

                  {/* 卡牌名称 */}
                  <div className="mt-4 text-center">
                    <div className="text-xs font-bold text-white leading-tight line-clamp-2">
                      {card.name}
                    </div>
                  </div>

                  {/* 占位图 */}
                  <div className="flex-1 my-1 bg-black/30 rounded flex items-center justify-center">
                    <span className="text-xl">{getCardTypeIcon(card.type)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* 手牌编辑提示 */}
          <div className="text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-gray-400 bg-black/60 px-2 py-0.5 rounded">点击编辑手牌</span>
          </div>
        </div>

        {/* 抽牌堆和弃牌堆 */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between pointer-events-none">
          {/* 抽牌堆 */}
          <div 
            onClick={onEditDrawPile}
            className="pointer-events-auto cursor-pointer group"
          >
            <div className="relative">
              <div className="w-14 h-20 rounded-lg bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-blue-600 flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 text-blue-400 mb-1" />
                <span className="text-lg font-bold text-white">{deckState.drawPile.length}</span>
              </div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <span className="text-xs text-gray-400 bg-black/60 px-2 py-0.5 rounded">抽牌堆</span>
              </div>
            </div>
          </div>

          {/* 消耗堆 */}
          {deckState.exhaustPile.length > 0 && (
            <div 
              onClick={onEditExhaustPile}
              className="pointer-events-auto cursor-pointer group"
            >
              <div className="relative">
                <div className="w-12 h-18 rounded-lg bg-gradient-to-br from-orange-900 to-orange-800 border-2 border-orange-600 flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Flame className="w-4 h-4 text-orange-400 mb-1" />
                  <span className="text-base font-bold text-white">{deckState.exhaustPile.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* 弃牌堆 */}
          <div 
            onClick={onEditDiscardPile}
            className="pointer-events-auto cursor-pointer group"
          >
            <div className="relative">
              <div className="w-14 h-20 rounded-lg bg-gradient-to-br from-gray-800 to-gray-700 border-2 border-gray-600 flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5 text-gray-400 mb-1" />
                <span className="text-lg font-bold text-white">{deckState.discardPile.length}</span>
              </div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                <span className="text-xs text-gray-400 bg-black/60 px-2 py-0.5 rounded">弃牌堆</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 卡牌操作弹窗 */}
      <CardActionsDialog
        open={cardActionsOpen}
        onOpenChange={setCardActionsOpen}
        card={selectedCard}
        onMoveTo={(cardId, destination) => {
          onMoveCardFromHand?.(cardId, destination);
        }}
        onDelete={(cardId) => {
          onRemoveCardFromHand?.(cardId);
        }}
      />
    </div>
  );
}
