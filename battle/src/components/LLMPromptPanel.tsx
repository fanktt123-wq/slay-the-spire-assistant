import { useMemo } from 'react';
import type { GameState } from '@/types/game';
import { CHARACTER_NAMES } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { loadCommonKnowledge } from './CommonKnowledgeDialog';

interface LLMPromptPanelProps {
  gameState: GameState;
  inline?: boolean;
  onEditCommonKnowledge?: () => void;
}

export function LLMPromptPanel({ gameState, inline, onEditCommonKnowledge }: LLMPromptPanelProps) {
  const [copied, setCopied] = useState(false);
  const commonKnowledge = loadCommonKnowledge();

  const promptText = useMemo(() => {
    // 构建提示词文本
    const { character, enemies, deckState, turn, relics, potions, progress, gold } = gameState;
    
    let text = '';
    
    // 常识区域
    const commonKnowledge = loadCommonKnowledge();
    if (commonKnowledge.trim()) {
      text += `${commonKnowledge}\n\n`;
    }
    
    // 游戏概况
    text += `【游戏概况】\n`;
    text += `- Act ${progress.act}, ${progress.floor}层\n`;
    text += `- 回合 ${turn}\n`;
    text += `- 金钱: ${gold}G\n\n`;
    
    // 角色信息
    text += `【角色信息】\n`;
    text += `- 职业: ${CHARACTER_NAMES[character.class]}\n`;
    text += `- 生命值: ${character.currentHp}/${character.maxHp}\n`;
    text += `- 能量: ${character.energy}/${character.maxEnergy}\n`;
    text += `- 格挡: ${character.block}\n`;
    if (character.buffs.length > 0) {
      text += `- 状态: ${character.buffs.map(b => `${b.name}(${b.stacks}) - ${b.details || b.description}`).join('; ')}\n`;
    }
    text += `\n`;
    
    // 手牌
    text += `【手牌】(共${deckState.hand.length}张)\n`;
    deckState.hand.forEach((card, i) => {
      text += `${i + 1}. ${card.name} (${card.cost}费) [${card.type}] - ${card.description}${card.upgraded ? ' [已升级]' : ''}\n`;
    });
    text += `\n`;
    
    // 牌堆信息
    text += `【牌堆信息】\n`;
    text += `- 抽牌堆: ${deckState.drawPile.length}张\n`;
    if (deckState.drawPile.length > 0) {
      deckState.drawPile.forEach((card, i) => {
        text += `  ${i + 1}. ${card.name} (${card.cost}费) [${card.type}]${card.upgraded ? ' [已升级]' : ''}\n`;
      });
    }
    text += `- 弃牌堆: ${deckState.discardPile.length}张\n`;
    if (deckState.discardPile.length > 0) {
      deckState.discardPile.forEach((card, i) => {
        text += `  ${i + 1}. ${card.name} (${card.cost}费) [${card.type}]${card.upgraded ? ' [已升级]' : ''}\n`;
      });
    }
    text += `- 消耗堆: ${deckState.exhaustPile.length}张\n`;
    if (deckState.exhaustPile.length > 0) {
      deckState.exhaustPile.forEach((card, i) => {
        text += `  ${i + 1}. ${card.name} (${card.cost}费) [${card.type}]${card.upgraded ? ' [已升级]' : ''}\n`;
      });
    }
    text += `- 卡组总数: ${deckState.deck.length}张\n\n`;
    
    // 遗物
    if (relics.length > 0) {
      text += `【遗物】(共${relics.length}个)\n`;
      relics.forEach(relic => {
        text += `- ${relic.name}${relic.counter !== undefined ? ` [计数:${relic.counter}]` : ''}: ${relic.description}\n`;
      });
      text += `\n`;
    }
    
    // 药水
    if (potions.length > 0) {
      text += `【药水】(共${potions.length}/${gameState.maxPotionSlots}瓶)\n`;
      potions.forEach(potion => {
        text += `- ${potion.name}: ${potion.description}\n`;
      });
      text += `\n`;
    }
    
    // 敌人信息
    text += `【敌人信息】\n`;
    enemies.forEach((enemy, i) => {
      text += `[敌人${i + 1}] ${enemy.name} (${enemy.type === 'boss' ? 'Boss' : enemy.type === 'elite' ? '精英' : '普通'})\n`;
      text += `- 生命值: ${enemy.currentHp}/${enemy.maxHp}\n`;
      text += `- 格挡: ${enemy.block}\n`;
      text += `- 意图: ${enemy.intent.description}\n`;
      if (enemy.buffs.length > 0) {
        text += `- 状态: ${enemy.buffs.map(b => `${b.name}(${b.stacks}) - ${b.details || b.description}`).join('; ')}\n`;
      }
      // 添加敌人详细信息到提示词
      if (enemy.details.description) {
        text += `- 描述: ${enemy.details.description}\n`;
      }
      if (enemy.details.behavior) {
        text += `- 行为模式: ${enemy.details.behavior.replace(/\n/g, ' ')}\n`;
      }
      if (enemy.details.specialMechanics) {
        text += `- 特殊机制: ${enemy.details.specialMechanics.replace(/\n/g, ' ')}\n`;
      }
      if (enemy.details.recommendedStrategy) {
        text += `- 应对策略: ${enemy.details.recommendedStrategy.replace(/\n/g, ' ')}\n`;
      }
      text += `\n`;
    });
    
    return text;
  }, [gameState]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono">
        {promptText}
      </pre>
    );
  }

  return (
    <Card className="p-4 bg-gray-900 border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">LLM 提示词预览</h3>
        <div className="flex items-center gap-2">
          {onEditCommonKnowledge && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onEditCommonKnowledge}
              className="text-yellow-400 border-yellow-600/50 hover:bg-yellow-900/30"
            >
              <Lightbulb className="w-4 h-4 mr-1" />
              常识
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? '已复制' : '复制'}
          </Button>
        </div>
      </div>
      
      {/* 常识区域预览 */}
      {commonKnowledge.trim() && (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-yellow-400 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" />
              常识区域
            </span>
          </div>
          <pre className="text-xs text-yellow-200/80 whitespace-pre-wrap font-mono max-h-24 overflow-hidden">
            {commonKnowledge}
          </pre>
        </div>
      )}
      
      <ScrollArea className="h-96">
        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-950 p-4 rounded">
          {promptText}
        </pre>
      </ScrollArea>
    </Card>
  );
}
