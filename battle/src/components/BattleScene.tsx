import { useState, useRef, useEffect } from 'react';
import type { GameState, Card, CharacterClass, Enemy, Potion, Relic, Buff } from '@/types/game';
import { CHARACTER_NAMES } from '@/types/game';
import { RelicSystem } from './RelicSystem';
import { PotionSystem } from './PotionSystem';
import { CardActionsDialog } from './CardActionsDialog';
import { LLMPromptPanel } from './LLMPromptPanel';
import { AIConfigDialog, loadSavedConfig, saveConfig, type ApiConfig } from '@/components/AIConfigDialog';
import { CommonKnowledgeDialog, loadCommonKnowledge, saveCommonKnowledge } from './CommonKnowledgeDialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { 
  Heart, 
  Zap, 
  Shield, 
  Layers, 
  Package, 
  Flame, 
  Plus,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Info,
  Copy,
  Check,
  Send,
  ChevronDown,
  ChevronUp,
  User,
  Bot,
  Sparkles,
  Settings,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface BattleSceneProps {
  gameState: GameState;
  availableCards: Card[];
  availablePotions: Potion[];
  availableEnemies: Enemy[];
  availableRelics: Relic[];
  availableBuffs: Buff[];
  isDataLoading?: boolean;
  isDataConnected?: boolean;
  onEditCharacter: () => void;
  onEditEnemy: (enemyId: string) => void;
  onViewEnemyInfo: (enemyId: string) => void;
  onEditHand: () => void;
  onEditDrawPile: () => void;
  onEditDiscardPile: () => void;
  onEditExhaustPile: () => void;
  onAddEnemy: () => void;
  onPlayCard?: (card: Card) => void;
  onAddRelic: (relic: Relic) => void;
  onRemoveRelic: (relicId: string) => void;
  onUpdateRelicCounter?: (relicId: string, counter: number | undefined) => void;
  onAddPotion: (potion: Potion) => void;
  onRemovePotion: (potionId: string) => void;
  onUpdateProgress: (progress: { act?: number; floor?: number }) => void;
  onChangeCharacterClass: (characterClass: CharacterClass) => void;
  onSetGold?: (gold: number) => void;
  onSetMaxPotionSlots?: (slots: number) => void;
  onSetTurn?: (turn: number) => void;
  onMoveCardFromHand?: (cardId: string, destination: 'draw' | 'discard' | 'exhaust' | 'hand') => void;
  onRemoveCardFromHand?: (cardId: string) => void;
}

export function BattleScene({
  gameState,
  availableCards: _availableCards,
  availablePotions,
  availableEnemies: _availableEnemies,
  availableRelics,
  availableBuffs: _availableBuffs,
  isDataLoading = false,
  isDataConnected: _isDataConnected = false,
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
  onUpdateRelicCounter,
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
  const [copied, setCopied] = useState(false);
  
  // 聊天相关状态
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [aiConfigOpen, setAiConfigOpen] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>(loadSavedConfig());
  const [streamingContent, setStreamingContent] = useState('');
  const [commonKnowledgeOpen, setCommonKnowledgeOpen] = useState(false);
  const [commonKnowledge, setCommonKnowledge] = useState(loadCommonKnowledge());
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages, streamingContent]);

  // 保存 API 配置
  const handleConfigChange = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    saveConfig(newConfig);
  };

  // 检查 API 配置是否有效
  const isApiConfigured = apiConfig.apiKey && apiConfig.apiUrl && apiConfig.model;

  // 保存常识内容
  const handleSaveCommonKnowledge = (value: string) => {
    setCommonKnowledge(value);
    saveCommonKnowledge(value);
  };

  // 生成提示词 - 与 LLMPromptPanel 保持一致
  const generatePrompt = (userMessage: string): string => {
    const { character, enemies, deckState, turn, relics, potions, progress, gold } = gameState;
    
    let prompt = '';
    
    // 添加常识区域
    const commonKnowledgeText = loadCommonKnowledge();
    if (commonKnowledgeText.trim()) {
      prompt += `${commonKnowledgeText}\n\n`;
    }
    
    // 游戏概况
    prompt += `【游戏概况】\n`;
    prompt += `- Act ${progress.act}, ${progress.floor}层\n`;
    prompt += `- 回合 ${turn}\n`;
    prompt += `- 金钱: ${gold}G\n\n`;
    
    // 角色信息
    prompt += `【角色信息】\n`;
    prompt += `- 职业: ${CHARACTER_NAMES[character.class]}\n`;
    prompt += `- 生命值: ${character.currentHp}/${character.maxHp}\n`;
    prompt += `- 能量: ${character.energy}/${character.maxEnergy}\n`;
    prompt += `- 格挡: ${character.block}\n`;
    if (character.buffs.length > 0) {
      prompt += `- 状态: ${character.buffs.map(b => `${b.name}(${b.stacks}) - ${b.details || b.description}`).join('; ')}\n`;
    }
    prompt += `\n`;
    
    // 手牌
    prompt += `【手牌】(共${deckState.hand.length}张)\n`;
    deckState.hand.forEach((card, i) => {
      prompt += `${i + 1}. ${card.name} (${card.cost}费) [${card.type}] - ${card.description}${card.upgraded ? ' [已升级]' : ''}\n`;
    });
    prompt += `\n`;
    
    // 牌堆信息
    prompt += `【牌堆信息】\n`;
    prompt += `- 抽牌堆: ${deckState.drawPile.length}张\n`;
    if (deckState.drawPile.length > 0) {
      deckState.drawPile.forEach((card, i) => {
        prompt += `  ${i + 1}. ${card.name} (${card.cost}费) [${card.type}]${card.upgraded ? ' [已升级]' : ''}\n`;
      });
    }
    prompt += `- 弃牌堆: ${deckState.discardPile.length}张\n`;
    if (deckState.discardPile.length > 0) {
      deckState.discardPile.forEach((card, i) => {
        prompt += `  ${i + 1}. ${card.name} (${card.cost}费) [${card.type}]${card.upgraded ? ' [已升级]' : ''}\n`;
      });
    }
    prompt += `- 消耗堆: ${deckState.exhaustPile.length}张\n`;
    if (deckState.exhaustPile.length > 0) {
      deckState.exhaustPile.forEach((card, i) => {
        prompt += `  ${i + 1}. ${card.name} (${card.cost}费) [${card.type}]${card.upgraded ? ' [已升级]' : ''}\n`;
      });
    }
    prompt += `- 卡组总数: ${deckState.deck.length}张\n\n`;
    
    // 遗物
    if (relics.length > 0) {
      prompt += `【遗物】(共${relics.length}个)\n`;
      relics.forEach(relic => {
        prompt += `- ${relic.name}${relic.counter !== undefined ? ` [计数:${relic.counter}]` : ''}: ${relic.description}\n`;
      });
      prompt += `\n`;
    }
    
    // 药水
    if (potions.length > 0) {
      prompt += `【药水】(共${potions.length}/${gameState.maxPotionSlots}瓶)\n`;
      potions.forEach(potion => {
        prompt += `- ${potion.name}: ${potion.description}\n`;
      });
      prompt += `\n`;
    }
    
    // 敌人信息
    prompt += `【敌人信息】\n`;
    enemies.forEach((enemy, i) => {
      prompt += `[敌人${i + 1}] ${enemy.name} (${enemy.type === 'boss' ? 'Boss' : enemy.type === 'elite' ? '精英' : '普通'})\n`;
      prompt += `- 生命值: ${enemy.currentHp}/${enemy.maxHp}\n`;
      prompt += `- 格挡: ${enemy.block}\n`;
      prompt += `- 意图: ${enemy.intent.description}\n`;
      if (enemy.buffs.length > 0) {
        prompt += `- 状态: ${enemy.buffs.map(b => `${b.name}(${b.stacks}) - ${b.details || b.description}`).join('; ')}\n`;
      }
      // 添加敌人详细信息到提示词
      if (enemy.details.description) {
        prompt += `- 描述: ${enemy.details.description}\n`;
      }
      if (enemy.details.behavior) {
        prompt += `- 行为模式: ${enemy.details.behavior.replace(/\n/g, ' ')}\n`;
      }
      if (enemy.details.specialMechanics) {
        prompt += `- 特殊机制: ${enemy.details.specialMechanics.replace(/\n/g, ' ')}\n`;
      }
      if (enemy.details.recommendedStrategy) {
        prompt += `- 应对策略: ${enemy.details.recommendedStrategy.replace(/\n/g, ' ')}\n`;
      }
      prompt += `\n`;
    });
    
    // 用户问题
    prompt += `【用户问题】\n${userMessage}\n`;
    
    return prompt;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    if (!isApiConfigured) {
      setAiConfigOpen(true);
      return;
    }
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsGenerating(true);
    setStreamingContent('');
    
    try {
      const prompt = generatePrompt(userMsg.content);
      
      // 构建请求体
      // 转换消息格式为后端历史格式
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const requestBody = {
        deck: gameState.deckState.hand.map(c => c.id),
        relics: gameState.relics.map(r => r.id),
        character: gameState.character.class,
        apiConfig,
        knowledgeOptions: {
          sendDeckInfo: true,
          methodology: false,
          gameKnowledge: false,
          characterCards: [],
          allRelics: false,
          selectedGuides: []
        },
        userMessage: prompt,
        isFollowUp: messages.length > 0,
        analysisType: 'battle',
        history: history
      };

      const response = await fetch('/api/analyze-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder('utf-8');
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (data.type) {
                case 'chunk':
                  fullContent += data.content;
                  setStreamingContent(prev => prev + data.content);
                  break;
                case 'done':
                  setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: fullContent,
                    timestamp: Date.now(),
                  }]);
                  setStreamingContent('');
                  setIsGenerating(false);
                  break;
                case 'error':
                  throw new Error(data.error);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '请求 AI 时出错';
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ 错误：${errorMsg}\n\n请检查 AI 配置是否正确，或稍后重试。`,
        timestamp: Date.now(),
      }]);
      setStreamingContent('');
      setIsGenerating(false);
    }
  };

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

  const getBuffColor = (type: Buff['type']) => {
    // 增益类使用绿色
    if (type.includes('buff')) {
      return 'bg-green-600 text-white';
    }
    // 减益类使用红色
    if (type.includes('debuff')) {
      return 'bg-red-600 text-white';
    }
    // 其他使用灰色
    return 'bg-gray-600 text-white';
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
    <div className="relative w-full h-screen flex flex-col bg-animated overflow-hidden">
      {/* 顶部信息栏 */}
      <div className="flex items-center justify-between px-4 py-2 glass-card border-b border-white/5">
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
                className="w-8 bg-transparent text-center font-bold focus:outline-none focus:bg-slate-800/70 rounded border border-transparent focus:border-violet-500/50 transition-colors"
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
                className="w-10 bg-transparent text-center text-sm focus:outline-none focus:bg-slate-800/70 rounded border border-transparent focus:border-violet-500/50 transition-colors"
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
          
          <div className="h-4 w-px bg-gradient-to-b from-transparent via-slate-600 to-transparent" />
          
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
          
          <div className="h-4 w-px bg-gradient-to-b from-transparent via-slate-600 to-transparent" />
          
          {/* 金钱 - 可编辑 */}
          <div className="flex items-center gap-1 text-amber-400">
            <span>💰</span>
            <input
              type="number"
              value={gameState.gold}
              onChange={(e) => onSetGold?.(parseInt(e.target.value) || 0)}
              className="w-14 bg-transparent text-center font-bold focus:outline-none focus:bg-slate-800/70 rounded border border-transparent focus:border-violet-500/50 transition-colors"
              min={0}
            />
            <span className="text-xs">G</span>
          </div>
          
          <div className="h-4 w-px bg-gradient-to-b from-transparent via-slate-600 to-transparent" />
          
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
            availablePotions={availablePotions}
            isLoading={isDataLoading}
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
              className="w-8 bg-transparent text-center font-bold focus:outline-none focus:bg-slate-800/70 rounded border border-transparent focus:border-violet-500/50 transition-colors"
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
            availableRelics={availableRelics}
            isLoading={isDataLoading}
            onAddRelic={onAddRelic} 
            onRemoveRelic={onRemoveRelic}
            onUpdateRelicCounter={onUpdateRelicCounter}
          />
          
          {/* 角色区域 */}
          <div 
            onClick={onEditCharacter}
            className="glass-card rounded-xl p-4 cursor-pointer group transition-all hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10"
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
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-4 border-slate-600 flex items-center justify-center text-5xl shadow-2xl group-hover:border-violet-500 transition-all group-hover:shadow-lg group-hover:shadow-violet-500/30">
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
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                    <div 
                      className="h-full bg-gradient-to-r from-rose-600 via-red-500 to-rose-500 transition-all"
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
                          'px-1.5 py-0.5 rounded text-xs font-medium max-w-[120px]',
                          getBuffColor(buff.type)
                        )}
                        title={`${buff.name}${buff.stacks > 1 ? ` (${buff.stacks})` : ''}: ${buff.details || buff.description}`}
                      >
                        <span className="truncate block">{buff.name}</span>
                        {buff.stacks > 1 && <span className="ml-0.5">{buff.stacks}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 中间 - AI聊天区域 */}
        <div className="flex-1 flex flex-col relative px-4 py-2 min-h-0">
          {/* 背景装饰 */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600 rounded-full blur-3xl" />
          </div>

          {/* AI聊天对话框 */}
          <div className="glass-card rounded-xl flex flex-col overflow-hidden h-full max-h-[calc(100vh-280px)]">
            {/* 聊天标题栏 */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-300">AI 助手</span>
                <span className="text-xs text-gray-500">- 杀戮尖塔战斗分析</span>
              </div>
              <div className="flex items-center gap-2">
                {/* AI 配置按钮 */}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className={cn(
                    "h-7 px-2 text-xs",
                    isApiConfigured 
                      ? "text-green-400 hover:text-green-300 hover:bg-green-900/30" 
                      : "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/30"
                  )}
                  onClick={() => setAiConfigOpen(true)}
                  title={isApiConfigured ? "AI 已配置" : "点击配置 AI"}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  {isApiConfigured ? "已配置" : "配置AI"}
                </Button>
                {/* 提示词预览展开/折叠按钮 */}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 px-2 text-xs"
                  onClick={() => setPromptExpanded(!promptExpanded)}
                >
                  <Sparkles className="w-3 h-3 mr-1 text-yellow-400" />
                  提示词
                  {promptExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                </Button>
                {/* 常识编辑按钮 */}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 px-2 text-xs text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/30"
                  onClick={() => setCommonKnowledgeOpen(true)}
                  title="编辑常识区域"
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  常识
                </Button>
              </div>
            </div>

            {/* 可折叠的提示词预览 */}
            {promptExpanded && (
              <div className="border-b border-white/5 bg-slate-950/80">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-800">
                  <span className="text-xs text-gray-500">发送给 LLM 的提示词</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 px-2 text-xs"
                    onClick={async () => {
                      const promptText = document.querySelector('.llm-prompt-text')?.textContent || '';
                      await navigator.clipboard.writeText(promptText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copied ? '已复制' : '复制'}
                  </Button>
                </div>
                <ScrollArea className="h-32 px-3 py-2">
                  <div className="llm-prompt-text">
                    <LLMPromptPanel 
                      gameState={gameState} 
                      inline 
                      onEditCommonKnowledge={() => setCommonKnowledgeOpen(true)}
                    />
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* 聊天消息区域 */}
            <ScrollArea className="flex-1 px-3 min-h-0" type="always">
              <div ref={chatScrollRef} className="py-3 space-y-3">
                {/* API 未配置提示 */}
                {!isApiConfigured && messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <AlertCircle className="w-12 h-12 mb-2 text-yellow-500/50" />
                    <p className="text-sm text-yellow-400/80">请先配置 AI API</p>
                    <p className="text-xs mt-1 opacity-60">点击右上角"配置AI"按钮</p>
                  </div>
                )}
                
                {isApiConfigured && messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <Bot className="w-12 h-12 mb-2 opacity-30" />
                    <p className="text-sm">开始与 AI 对话，获取战斗建议</p>
                    <p className="text-xs mt-1 opacity-60">输入当前局势或询问出牌策略</p>
                  </div>
                )}
                
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex gap-2',
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                      msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                    )}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={cn(
                      'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                      msg.role === 'user' 
                        ? 'bg-blue-600/20 border border-blue-500/30 text-gray-200' 
                        : 'bg-gray-800/80 border border-gray-700 text-gray-200'
                    )}>
                      {msg.role === 'user' ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <div className="prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* 流式输出显示 */}
                {isGenerating && streamingContent && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 max-w-[80%]">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {streamingContent}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 加载动画 */}
                {isGenerating && !streamingContent && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-gray-800/80 border border-gray-700 rounded-lg px-3 py-2 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* 输入区域 */}
            <div className="border-t border-gray-700/50 p-3 bg-gray-900/30">
              <div className="flex gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="输入消息询问 AI... (Shift+Enter 换行)"
                  className="min-h-[44px] max-h-24 bg-gray-900/80 border-gray-700 text-sm resize-none"
                  rows={1}
                />
                <Button 
                  size="icon"
                  className="h-11 w-11 bg-purple-600 hover:bg-purple-700 flex-shrink-0"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isGenerating}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧 - 敌人区域 */}
        <div className="w-64 flex flex-col gap-3 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">敌人</span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onAddEnemy}
              disabled={isDataLoading || _availableEnemies.length === 0}
            >
              <Plus className="w-3 h-3 mr-1" />
              添加
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {enemies.length === 0 ? (
              <div 
                onClick={onAddEnemy}
                className="h-32 rounded-xl border-2 border-dashed border-slate-600/60 flex items-center justify-center cursor-pointer hover:border-slate-500 hover:bg-slate-800/30 transition-all"
              >
                <Plus className="w-8 h-8 text-gray-500" />
              </div>
            ) : (
              enemies.map(enemy => (
                <div 
                  key={enemy.id}
                  className={cn(
                    'relative rounded-xl p-3 border transition-all cursor-pointer group',
                    enemy.type === 'boss' ? 'enemy-card-boss hover:border-red-500/60' :
                    enemy.type === 'elite' ? 'enemy-card-elite hover:border-amber-500/60' :
                    'enemy-card-normal hover:border-slate-500/60',
                    'hover:shadow-lg'
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
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/30">
                        <div 
                          className="h-full bg-gradient-to-r from-rose-600 via-red-500 to-rose-500 transition-all"
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
                              'px-1 py-0.5 rounded text-xs font-medium max-w-[100px]',
                              getBuffColor(buff.type)
                            )}
                            title={`${buff.name}${buff.stacks > 1 ? ` (${buff.stacks})` : ''}: ${buff.details || buff.description}`}
                          >
                            <span className="truncate block">{buff.name}</span>
                            {buff.stacks > 1 && <span className="ml-0.5">{buff.stacks}</span>}
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
              <div className="text-slate-500 text-center py-6 group-hover:text-slate-400 transition-colors">
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
                  <div className="absolute -top-2 -left-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-blue-300/70 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/30">
                    {card.cost === -1 ? 'X' : card.cost}
                  </div>
                  
                  {/* 升级标记 */}
                  {card.upgraded && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border border-yellow-200/70 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-amber-500/30">
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
                  <div className="flex-1 my-1 bg-gradient-to-b from-black/40 to-black/20 rounded flex items-center justify-center">
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

        {/* 抽牌堆、消耗堆和弃牌堆 - 放在手牌上方 */}
        <div className="absolute -top-2 left-4 right-4 flex justify-between pointer-events-none">
          {/* 抽牌堆 - 左侧 */}
          <div 
            onClick={onEditDrawPile}
            className="pointer-events-auto cursor-pointer group"
          >
            <div className="relative">
              <div className="w-14 h-20 rounded-xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 border-2 border-blue-400/60 flex flex-col items-center justify-center shadow-lg shadow-blue-900/30 group-hover:scale-105 group-hover:shadow-blue-500/40 transition-all py-1.5 px-2">
                <Layers className="w-5 h-5 text-blue-400 mb-0.5" />
                <span className="text-lg font-bold text-white">{deckState.drawPile.length}</span>
                <span className="text-[10px] text-blue-300 mt-0.5">抽牌堆</span>
              </div>
              {/* 卡牌堆叠效果 */}
              <div className="absolute -top-1 -left-1 w-14 h-20 rounded-xl bg-blue-800/40 border border-blue-600/50 -z-10" />
              <div className="absolute -top-2 -left-2 w-14 h-20 rounded-xl bg-blue-800/20 border border-blue-700/30 -z-20" />
            </div>
          </div>

          {/* 右侧 - 消耗堆在上，弃牌堆在下 */}
          <div className="flex flex-col gap-2">
            {/* 消耗堆 */}
            <div 
              onClick={onEditExhaustPile}
              className="pointer-events-auto cursor-pointer group"
            >
              <div className="relative">
                <div className={cn(
                  "w-12 h-16 rounded-lg bg-gradient-to-br from-orange-900 to-orange-800 border-2 flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform py-1 px-1.5",
                  deckState.exhaustPile.length > 0 ? "border-orange-500" : "border-orange-700/50 opacity-50"
                )}>
                  <Flame className="w-4 h-4 text-orange-400 mb-0.5" />
                  <span className="text-sm font-bold text-white">{deckState.exhaustPile.length}</span>
                  <span className="text-[9px] text-orange-300 mt-0.5">消耗</span>
                </div>
                {/* 卡牌堆叠效果 */}
                {deckState.exhaustPile.length > 0 && (
                  <>
                    <div className="absolute -top-1 -left-1 w-12 h-16 rounded-xl bg-orange-800/40 border border-orange-600/50 -z-10" />
                    <div className="absolute -top-2 -left-2 w-12 h-16 rounded-xl bg-orange-800/20 border border-orange-700/30 -z-20" />
                  </>
                )}
              </div>
            </div>

            {/* 弃牌堆 */}
            <div 
              onClick={onEditDiscardPile}
              className="pointer-events-auto cursor-pointer group"
            >
              <div className="relative">
                <div className="w-14 h-20 rounded-xl bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 border-2 border-slate-500/70 flex flex-col items-center justify-center shadow-lg shadow-slate-900/30 group-hover:scale-105 group-hover:shadow-slate-500/20 transition-all py-1.5 px-2">
                  <Package className="w-5 h-5 text-slate-400 mb-0.5" />
                  <span className="text-lg font-bold text-white">{deckState.discardPile.length}</span>
                  <span className="text-[10px] text-slate-300 mt-0.5">弃牌堆</span>
                </div>
                {/* 卡牌堆叠效果 */}
                {deckState.discardPile.length > 0 && (
                  <>
                    <div className="absolute -top-1 -left-1 w-14 h-20 rounded-xl bg-slate-700/40 border border-slate-600/50 -z-10" />
                    <div className="absolute -top-2 -left-2 w-14 h-20 rounded-xl bg-slate-700/20 border border-slate-700/30 -z-20" />
                  </>
                )}
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

      {/* AI 配置弹窗 */}
      <AIConfigDialog
        open={aiConfigOpen}
        onOpenChange={setAiConfigOpen}
        config={apiConfig}
        onConfigChange={handleConfigChange}
      />

      {/* 常识编辑弹窗 */}
      <CommonKnowledgeDialog
        open={commonKnowledgeOpen}
        onOpenChange={setCommonKnowledgeOpen}
        value={commonKnowledge}
        onSave={handleSaveCommonKnowledge}
      />
    </div>
  );
}
