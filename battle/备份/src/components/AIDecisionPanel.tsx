import { useState } from 'react';
import type { GameState, AIResponse } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Sparkles, Lightbulb, Target, AlertCircle, CheckCircle, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIDecisionPanelProps {
  gameState: GameState;
}

export function AIDecisionPanel({ gameState }: AIDecisionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState('');
  const [copied, setCopied] = useState(false);

  const { character, enemies, deckState, turn, relics, potions, progress } = gameState;

  const generatePrompt = (): string => {
    let prompt = `【杀戮尖塔战斗分析 - Act${progress.act} 第${progress.floor}层 - 第${turn}回合】\n\n`;
    
    // 角色信息
    prompt += `【角色状态】\n`;
    prompt += `- 职业: ${character.class === 'ironclad' ? '铁甲战士' : character.class === 'silent' ? '静默猎手' : character.class === 'defect' ? '故障机器人' : '观者'}\n`;
    prompt += `- 生命值: ${character.currentHp}/${character.maxHp}\n`;
    prompt += `- 能量: ${character.energy}/${character.maxEnergy}\n`;
    prompt += `- 格挡: ${character.block}\n`;
    
    if (character.buffs.length > 0) {
      prompt += `- Buff/Debuff: ${character.buffs.map(b => `${b.name}${b.stacks > 1 ? `(${b.stacks})` : ''}`).join(', ')}\n`;
    }
    
    // 遗物信息
    if (relics.length > 0) {
      prompt += `\n【遗物】(${relics.length}个)\n`;
      relics.forEach(relic => {
        prompt += `- ${relic.name}: ${relic.description}\n`;
      });
    }
    
    // 药水信息
    if (potions.length > 0) {
      prompt += `\n【药水】(${potions.length}/3)\n`;
      potions.forEach(potion => {
        prompt += `- ${potion.name}: ${potion.description}\n`;
      });
    }
    
    // 敌人状态
    prompt += `\n【敌人状态】\n`;
    enemies.forEach((enemy, index) => {
      prompt += `敌人${index + 1}: ${enemy.name} (${enemy.type === 'boss' ? 'Boss' : enemy.type === 'elite' ? '精英' : '普通'})\n`;
      prompt += `  - 生命值: ${enemy.currentHp}/${enemy.maxHp}\n`;
      prompt += `  - 格挡: ${enemy.block}\n`;
      prompt += `  - 意图: ${enemy.intent.description}\n`;
      if (enemy.buffs.length > 0) {
        prompt += `  - Buff/Debuff: ${enemy.buffs.map(b => `${b.name}${b.stacks > 1 ? `(${b.stacks})` : ''}`).join(', ')}\n`;
      }
      // 添加怪物详细信息
      if (enemy.details.description || enemy.details.behavior || enemy.details.specialMechanics) {
        prompt += `  - 详细信息:\n`;
        if (enemy.details.description) prompt += `    描述: ${enemy.details.description}\n`;
        if (enemy.details.behavior) prompt += `    行为: ${enemy.details.behavior}\n`;
        if (enemy.details.specialMechanics) prompt += `    特殊机制: ${enemy.details.specialMechanics}\n`;
        if (enemy.details.recommendedStrategy) prompt += `    推荐策略: ${enemy.details.recommendedStrategy}\n`;
      }
    });
    
    // 卡牌状态
    prompt += `\n【卡牌状态】\n`;
    prompt += `- 手牌(${deckState.hand.length}张):\n`;
    deckState.hand.forEach((card, index) => {
      prompt += `  ${index + 1}. [${card.cost}费] ${card.name}${card.upgraded ? '+' : ''} - ${card.description}\n`;
    });
    
    if (deckState.drawPile.length > 0) {
      prompt += `- 抽牌堆: ${deckState.drawPile.length}张\n`;
    }
    if (deckState.discardPile.length > 0) {
      prompt += `- 弃牌堆: ${deckState.discardPile.length}张\n`;
    }
    if (deckState.exhaustPile.length > 0) {
      prompt += `- 消耗堆: ${deckState.exhaustPile.length}张\n`;
    }
    
    // 额外信息
    if (context) {
      prompt += `\n【额外信息】\n${context}\n`;
    }
    
    // 任务
    prompt += `\n【任务】\n`;
    prompt += `请分析当前战斗局势，提供最优的出牌策略。请包括:\n`;
    prompt += `1. 局势分析（当前威胁、机会、药水使用建议等）\n`;
    prompt += `2. 推荐的出牌顺序（具体到每张牌的目标，考虑遗物效果）\n`;
    prompt += `3. 预期结果（伤害计算、生存能力等）\n`;
    prompt += `4. 备选方案（如果有的话）\n`;
    
    return prompt;
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatePrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const requestAIDecision = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResponse: AIResponse = {
        reasoning: generateMockAnalysis(),
        recommendedActions: generateMockActions(),
        expectedOutcome: generateMockOutcome(),
        alternativeOptions: generateMockAlternatives(),
      };
      
      setResponse(mockResponse);
    } catch {
      setError('请求AI决策时出错，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalysis = (): string => {
    const totalDamage = deckState.hand
      .filter(c => c.type === 'attack')
      .reduce((sum, c) => sum + (c.name.includes('打击') ? (c.upgraded ? 9 : 6) : 8), 0);
    
    let analysis = `当前局势分析:\n\n`;
    analysis += `• 你的生命值为 ${character.currentHp}/${character.maxHp}，`;
    if (character.currentHp / character.maxHp < 0.3) {
      analysis += `处于危险状态，需要优先考虑防御。\n`;
    } else if (character.currentHp / character.maxHp < 0.6) {
      analysis += `需要注意生命值管理。\n`;
    } else {
      analysis += `生命值相对安全。\n`;
    }
    
    analysis += `• 当前能量为 ${character.energy}点，`;
    const handCost = deckState.hand.reduce((sum, c) => sum + c.cost, 0);
    if (handCost <= character.energy) {
      analysis += `可以打出所有手牌。\n`;
    } else {
      analysis += `需要选择性出牌。\n`;
    }
    
    // 遗物效果分析
    if (relics.length > 0) {
      analysis += `• 拥有的遗物:\n`;
      relics.forEach(relic => {
        analysis += `  - ${relic.name}: ${relic.description}\n`;
      });
    }
    
    // 药水分析
    if (potions.length > 0) {
      analysis += `• 可用药水:\n`;
      potions.forEach(potion => {
        analysis += `  - ${potion.name}: ${potion.description}\n`;
      });
    }
    
    enemies.forEach((enemy) => {
      analysis += `• ${enemy.name} 意图${enemy.intent.type === 'attack' ? '攻击' : enemy.intent.type === 'defend' ? '防御' : '其他'}，`;
      if (enemy.intent.type === 'attack' && enemy.intent.value) {
        const damageAfterBlock = Math.max(0, enemy.intent.value - character.block);
        analysis += `预计造成 ${damageAfterBlock} 点伤害（已计算格挡）。\n`;
      } else {
        analysis += `威胁较低。\n`;
      }
    });
    
    analysis += `• 你手牌中的攻击牌总共可以造成约 ${totalDamage} 点伤害。`;
    
    return analysis;
  };

  const generateMockActions = (): string[] => {
    const actions: string[] = [];
    let remainingEnergy = character.energy;
    
    // 药水建议
    if (potions.length > 0) {
      const energyPotion = potions.find(p => p.id.includes('energy'));
      if (energyPotion && deckState.hand.reduce((sum, c) => sum + c.cost, 0) > character.energy) {
        actions.push(`[建议] 使用 ${energyPotion.name} 获得额外能量`);
      }
    }
    
    // 优先使用0费牌
    const zeroCostCards = deckState.hand.filter(c => c.cost === 0);
    zeroCostCards.forEach(card => {
      actions.push(`使用 [${card.name}] (${card.description})`);
    });
    
    // 然后使用其他牌
    const otherCards = deckState.hand.filter(c => c.cost > 0).sort((a, b) => b.cost - a.cost);
    otherCards.forEach(card => {
      if (remainingEnergy >= card.cost) {
        const target = card.type === 'attack' ? ' → 攻击敌人' : '';
        actions.push(`使用 [${card.name}] (${card.cost}费)${target}`);
        remainingEnergy -= card.cost;
      }
    });
    
    if (actions.length === 0) {
      actions.push('结束回合');
    } else {
      actions.push('结束回合（保留能量）');
    }
    
    return actions;
  };

  const generateMockOutcome = (): string => {
    let outcome = `预期结果:\n\n`;
    
    const totalDamage = deckState.hand
      .filter(c => c.type === 'attack')
      .reduce((sum, c) => sum + (c.name.includes('打击') ? (c.upgraded ? 9 : 6) : 8), 0);
    
    outcome += `• 对敌人造成总计约 ${totalDamage} 点伤害\n`;
    
    enemies.forEach(enemy => {
      const newHp = Math.max(0, enemy.currentHp - totalDamage);
      if (newHp === 0) {
        outcome += `• ${enemy.name} 将被击败\n`;
      } else {
        outcome += `• ${enemy.name} 剩余生命值: ${newHp}/${enemy.maxHp}\n`;
      }
    });
    
    outcome += `• 回合结束后格挡将清零\n`;
    outcome += `• 下回合将抽取5张新牌\n`;
    
    // 遗物效果
    if (relics.length > 0) {
      outcome += `\n• 遗物效果触发:\n`;
      relics.forEach(relic => {
        outcome += `  - ${relic.name}\n`;
      });
    }
    
    return outcome;
  };

  const generateMockAlternatives = (): string[] => {
    const alternatives = [
      '如果优先防御：先使用防御牌获得格挡，再使用攻击牌',
      '如果保留能量：只使用关键牌，为下回合做准备',
      '如果激进进攻：全部使用攻击牌，尽快消灭敌人',
    ];
    
    if (potions.length > 0) {
      alternatives.push('考虑使用药水来获得额外优势');
    }
    
    return alternatives;
  };

  return (
    <div className="space-y-4">
      {/* 额外信息输入 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          额外信息（可选）
        </label>
        <Textarea
          placeholder="输入任何额外的战斗信息，例如：下回合会抽到什么牌、特殊遗物效果、敌人的特殊行为模式等..."
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="min-h-[80px] bg-gray-900 border-gray-700"
        />
      </div>

      {/* 生成提示词预览 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            将发送给AI的提示词
          </label>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {generatePrompt().length} 字符
            </Badge>
            <Button size="sm" variant="outline" onClick={handleCopyPrompt}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <ScrollArea className="h-48 bg-gray-900 rounded-lg border border-gray-700 p-3">
          <pre className="text-xs text-gray-400 whitespace-pre-wrap">
            {generatePrompt()}
          </pre>
        </ScrollArea>
      </div>

      {/* 请求按钮 */}
      <Button
        onClick={requestAIDecision}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            正在分析...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            获取AI决策建议
          </>
        )}
      </Button>

      {/* 错误提示 */}
      {error && (
        <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-center gap-2 text-red-200">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* AI响应 */}
      {response && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">AI分析完成</span>
          </div>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-blue-400">
                <Lightbulb className="w-4 h-4" />
                局势分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {response.reasoning}
              </pre>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-green-400">
                <Target className="w-4 h-4" />
                推荐出牌顺序
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {response.recommendedActions.map((action, index) => (
                  <li
                    key={index}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded',
                      action.includes('结束') 
                        ? 'bg-gray-800 text-gray-400' 
                        : action.includes('[建议]')
                        ? 'bg-yellow-900/30 text-yellow-200'
                        : 'bg-green-900/30 text-green-200'
                    )}
                  >
                    <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    {action}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-purple-400">
                <Sparkles className="w-4 h-4" />
                预期结果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {response.expectedOutcome}
              </pre>
            </CardContent>
          </Card>

          {response.alternativeOptions && response.alternativeOptions.length > 0 && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-yellow-400">
                  <AlertCircle className="w-4 h-4" />
                  备选方案
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {response.alternativeOptions.map((option, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-yellow-500">•</span>
                      {option}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
