import { useState, useEffect } from 'react';
import type { Character, Enemy, Card, CharacterClass, Buff } from '@/types/game';
import { BUFF_TYPE_LABELS } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// 角色配置弹窗
interface CharacterConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  availableBuffs: Buff[];
  onUpdate: (character: Character) => void;
}

export function CharacterConfigDialog({
  open,
  onOpenChange,
  character,
  availableBuffs,
  onUpdate,
}: CharacterConfigDialogProps) {
  const [localCharacter, setLocalCharacter] = useState<Character>(character);
  const [selectedBuff, setSelectedBuff] = useState<string>('');
  const [buffStacks, setBuffStacks] = useState<number>(1);

  // 当 character prop 变化时，同步到 localCharacter
  useEffect(() => {
    setLocalCharacter(character);
  }, [character]);

  const handleSave = () => {
    onUpdate(localCharacter);
    onOpenChange(false);
  };

  const handleAddBuff = () => {
    if (!selectedBuff) return;
    // 从 availableBuffs 中找到选中的 buff
    const templateBuff = availableBuffs.find(b => b.id === selectedBuff);
    if (!templateBuff) return;
    
    const newBuff = {
      ...templateBuff,
      stacks: buffStacks,
    };
    
    const existingBuff = localCharacter.buffs.find(b => b.id === selectedBuff);
    if (existingBuff) {
      setLocalCharacter(prev => ({
        ...prev,
        buffs: prev.buffs.map(b => 
          b.id === selectedBuff ? { ...b, stacks: b.stacks + buffStacks } : b
        ),
      }));
    } else {
      setLocalCharacter(prev => ({
        ...prev,
        buffs: [...prev.buffs, newBuff],
      }));
    }
    setSelectedBuff('');
    setBuffStacks(1);
  };

  const handleRemoveBuff = (buffId: string) => {
    setLocalCharacter(prev => ({
      ...prev,
      buffs: prev.buffs.filter(b => b.id !== buffId),
    }));
  };

  const getBuffColor = (type: Buff['type']) => {
    // 安全检查
    if (!type) return 'bg-gray-800 border-gray-600 text-gray-200';
    // 增益类使用绿色
    if (type.includes('buff')) {
      return 'bg-green-900 border-green-700 text-green-200';
    }
    // 减益类使用红色
    if (type.includes('debuff')) {
      return 'bg-red-900 border-red-700 text-red-200';
    }
    // 其他使用灰色
    return 'bg-gray-800 border-gray-600 text-gray-200';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">
              {localCharacter.class === 'ironclad' && '🔴'}
              {localCharacter.class === 'silent' && '🟢'}
              {localCharacter.class === 'defect' && '🔵'}
              {localCharacter.class === 'watcher' && '🟣'}
            </span>
            配置角色
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 职业选择 */}
          <div className="space-y-2">
            <Label>职业</Label>
            <Select 
              value={localCharacter.class} 
              onValueChange={(value) => setLocalCharacter(prev => ({ ...prev, class: value as CharacterClass }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ironclad">🔴 铁甲战士</SelectItem>
                <SelectItem value="silent">🟢 静默猎手</SelectItem>
                <SelectItem value="defect">🔵 故障机器人</SelectItem>
                <SelectItem value="watcher">🟣 观者</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 生命值 */}
          <div className="space-y-2">
            <Label>生命值</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={localCharacter.currentHp}
                onChange={(e) => setLocalCharacter(prev => ({ ...prev, currentHp: parseInt(e.target.value) || 0 }))}
                min={0}
              />
              <span className="text-gray-400">/</span>
              <Input
                type="number"
                value={localCharacter.maxHp}
                onChange={(e) => setLocalCharacter(prev => ({ ...prev, maxHp: parseInt(e.target.value) || 1 }))}
                min={1}
              />
            </div>
          </div>

          {/* 能量 */}
          <div className="space-y-2">
            <Label>能量</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={localCharacter.energy}
                onChange={(e) => setLocalCharacter(prev => ({ ...prev, energy: parseInt(e.target.value) || 0 }))}
                min={0}
              />
              <span className="text-gray-400">/</span>
              <Input
                type="number"
                value={localCharacter.maxEnergy}
                onChange={(e) => setLocalCharacter(prev => ({ ...prev, maxEnergy: parseInt(e.target.value) || 1 }))}
                min={1}
              />
            </div>
          </div>

          {/* 格挡 */}
          <div className="space-y-2">
            <Label>格挡</Label>
            <Input
              type="number"
              value={localCharacter.block}
              onChange={(e) => setLocalCharacter(prev => ({ ...prev, block: parseInt(e.target.value) || 0 }))}
              min={0}
            />
          </div>

          {/* Buff/Debuff - 从数据库选择 */}
          <div className="space-y-2">
            <Label>Buff / Debuff</Label>
            <div className="flex gap-2">
              <Select value={selectedBuff} onValueChange={setSelectedBuff}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="选择效果" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availableBuffs.length === 0 ? (
                    <div className="text-gray-500 px-2 py-1">暂无可用的Buff</div>
                  ) : (
                    <>
                      {/* 共享增益 */}
                      {availableBuffs.filter(b => b.type === 'shared_buff').length > 0 && (
                        <>
                          <div className="text-green-500 font-semibold px-2 py-1 sticky top-0 bg-background">{BUFF_TYPE_LABELS.shared_buff}</div>
                          {availableBuffs.filter(b => b.type === 'shared_buff').map(buff => (
                            <SelectItem key={buff.id} value={buff.id}>{buff.name}</SelectItem>
                          ))}
                        </>
                      )}
                      {/* 玩家增益 */}
                      {availableBuffs.filter(b => b.type === 'player_buff').length > 0 && (
                        <>
                          <div className="text-green-400 font-semibold px-2 py-1 sticky top-0 bg-background">{BUFF_TYPE_LABELS.player_buff}</div>
                          {availableBuffs.filter(b => b.type === 'player_buff').map(buff => (
                            <SelectItem key={buff.id} value={buff.id}>{buff.name}</SelectItem>
                          ))}
                        </>
                      )}
                      {/* 共享减益 */}
                      {availableBuffs.filter(b => b.type === 'shared_debuff').length > 0 && (
                        <>
                          <div className="text-red-500 font-semibold px-2 py-1 sticky top-0 bg-background">{BUFF_TYPE_LABELS.shared_debuff}</div>
                          {availableBuffs.filter(b => b.type === 'shared_debuff').map(buff => (
                            <SelectItem key={buff.id} value={buff.id}>{buff.name}</SelectItem>
                          ))}
                        </>
                      )}
                      {/* 玩家减益 */}
                      {availableBuffs.filter(b => b.type === 'player_debuff').length > 0 && (
                        <>
                          <div className="text-red-400 font-semibold px-2 py-1 sticky top-0 bg-background">{BUFF_TYPE_LABELS.player_debuff}</div>
                          {availableBuffs.filter(b => b.type === 'player_debuff').map(buff => (
                            <SelectItem key={buff.id} value={buff.id}>{buff.name}</SelectItem>
                          ))}
                        </>
                      )}
                      {/* 其他 */}
                      {availableBuffs.filter(b => b.type === 'other').length > 0 && (
                        <>
                          <div className="text-gray-500 font-semibold px-2 py-1 sticky top-0 bg-background">{BUFF_TYPE_LABELS.other}</div>
                          {availableBuffs.filter(b => b.type === 'other').map(buff => (
                            <SelectItem key={buff.id} value={buff.id}>{buff.name}</SelectItem>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={buffStacks}
                onChange={(e) => setBuffStacks(parseInt(e.target.value) || 1)}
                className="w-20"
                min={1}
              />
              <Button size="icon" onClick={handleAddBuff} disabled={!selectedBuff}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {localCharacter.buffs.map(buff => (
                <div
                  key={buff.id}
                  className={cn(
                    'px-2 py-1 rounded border text-sm',
                    getBuffColor(buff.type)
                  )}
                  title={`${buff.name}: ${buff.details || buff.description}`}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{buff.name}</span>
                    {buff.stacks > 1 && (
                      <Badge variant="secondary" className="text-xs">{buff.stacks}</Badge>
                    )}
                    <button onClick={() => handleRemoveBuff(buff.id)}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-xs opacity-80 mt-0.5 max-w-[200px] truncate">
                    {buff.details || buff.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 敌人配置弹窗
interface EnemyConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enemy: Enemy | null;
  availableBuffs: Buff[];
  onUpdate: (enemy: Enemy) => void;
  onDelete: (enemyId: string) => void;
}

export function EnemyConfigDialog({
  open,
  onOpenChange,
  enemy,
  availableBuffs,
  onUpdate,
  onDelete,
}: EnemyConfigDialogProps) {
  const [localEnemy, setLocalEnemy] = useState<Enemy | null>(enemy);
  const [selectedBuff, setSelectedBuff] = useState<string>('');
  const [buffStacks, setBuffStacks] = useState<number>(1);

  // 当 enemy prop 变化时，同步到 localEnemy
  useEffect(() => {
    setLocalEnemy(enemy);
  }, [enemy]);

  if (!enemy || !localEnemy) return null;

  const handleSave = () => {
    onUpdate(localEnemy);
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete(enemy.id);
    onOpenChange(false);
  };

  const handleAddBuff = () => {
    if (!selectedBuff) return;
    // 从 availableBuffs 中找到选中的 buff
    const templateBuff = availableBuffs.find(b => b.id === selectedBuff);
    if (!templateBuff) return;
    
    const newBuff = {
      ...templateBuff,
      stacks: buffStacks,
    };
    
    const existingBuff = localEnemy.buffs.find(b => b.id === selectedBuff);
    if (existingBuff) {
      setLocalEnemy(prev => prev ? {
        ...prev,
        buffs: prev.buffs.map(b => 
          b.id === selectedBuff ? { ...b, stacks: b.stacks + buffStacks } : b
        ),
      } : null);
    } else {
      setLocalEnemy(prev => prev ? {
        ...prev,
        buffs: [...prev.buffs, newBuff],
      } : null);
    }
    setSelectedBuff('');
    setBuffStacks(1);
  };

  const handleRemoveBuff = (buffId: string) => {
    setLocalEnemy(prev => prev ? {
      ...prev,
      buffs: prev.buffs.filter(b => b.id !== buffId),
    } : null);
  };

  const getBuffColor = (type: Buff['type']) => {
    // 安全检查
    if (!type) return 'bg-gray-800 border-gray-600 text-gray-200';
    // 增益类使用绿色
    if (type.includes('buff')) {
      return 'bg-green-900 border-green-700 text-green-200';
    }
    // 减益类使用红色
    if (type.includes('debuff')) {
      return 'bg-red-900 border-red-700 text-red-200';
    }
    // 其他使用灰色
    return 'bg-gray-800 border-gray-600 text-gray-200';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">
              {localEnemy.type === 'boss' ? '👹' : localEnemy.type === 'elite' ? '💀' : '👾'}
            </span>
            配置敌人
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 名称 */}
          <div className="space-y-2">
            <Label>名称</Label>
            <Input
              value={localEnemy.name}
              onChange={(e) => setLocalEnemy(prev => prev ? { ...prev, name: e.target.value } : null)}
            />
          </div>

          {/* 类型 */}
          <div className="space-y-2">
            <Label>类型</Label>
            <Select 
              value={localEnemy.type} 
              onValueChange={(value) => setLocalEnemy(prev => prev ? { ...prev, type: value as any } : null)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">👾 普通</SelectItem>
                <SelectItem value="elite">💀 精英</SelectItem>
                <SelectItem value="boss">👹 Boss</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 生命值 */}
          <div className="space-y-2">
            <Label>生命值</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={localEnemy.currentHp}
                onChange={(e) => setLocalEnemy(prev => prev ? { ...prev, currentHp: parseInt(e.target.value) || 0 } : null)}
                min={0}
              />
              <span className="text-gray-400">/</span>
              <Input
                type="number"
                value={localEnemy.maxHp}
                onChange={(e) => setLocalEnemy(prev => prev ? { ...prev, maxHp: parseInt(e.target.value) || 1 } : null)}
                min={1}
              />
            </div>
          </div>

          {/* 格挡 */}
          <div className="space-y-2">
            <Label>格挡</Label>
            <Input
              type="number"
              value={localEnemy.block}
              onChange={(e) => setLocalEnemy(prev => prev ? { ...prev, block: parseInt(e.target.value) || 0 } : null)}
              min={0}
            />
          </div>

          {/* 意图 */}
          <div className="space-y-2">
            <Label>意图</Label>
            <div className="flex gap-2">
              <Select 
                value={localEnemy.intent.type} 
                onValueChange={(value) => setLocalEnemy(prev => prev ? { 
                  ...prev, 
                  intent: { ...prev.intent, type: value as any }
                } : null)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attack">⚔️ 攻击</SelectItem>
                  <SelectItem value="defend">🛡️ 防御</SelectItem>
                  <SelectItem value="buff">⚡ 增益</SelectItem>
                  <SelectItem value="debuff">💀 减益</SelectItem>
                  <SelectItem value="sleep">💤 睡眠</SelectItem>
                  <SelectItem value="unknown">❓ 未知</SelectItem>
                </SelectContent>
              </Select>
              {localEnemy.intent.type === 'attack' && (
                <Input
                  type="number"
                  value={localEnemy.intent.value || 0}
                  onChange={(e) => setLocalEnemy(prev => prev ? { 
                    ...prev, 
                    intent: { ...prev.intent, value: parseInt(e.target.value) || 0 }
                  } : null)}
                  className="w-20"
                  placeholder="伤害"
                />
              )}
            </div>
            <Input
              value={localEnemy.intent.description}
              onChange={(e) => setLocalEnemy(prev => prev ? { 
                ...prev, 
                intent: { ...prev.intent, description: e.target.value }
              } : null)}
              placeholder="意图描述"
            />
          </div>

          {/* Buff/Debuff - 从数据库选择 */}
          <div className="space-y-2">
            <Label>Buff / Debuff</Label>
            <div className="flex gap-2">
              <Select value={selectedBuff} onValueChange={setSelectedBuff}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="选择效果" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availableBuffs.length === 0 ? (
                    <div className="text-gray-500 px-2 py-1">暂无可用的Buff</div>
                  ) : (
                    <>
                      {/* 共享增益 */}
                      {availableBuffs.filter(b => b.type === 'shared_buff').length > 0 && (
                        <>
                          <div className="text-green-500 font-semibold px-2 py-1 sticky top-0 bg-background">{BUFF_TYPE_LABELS.shared_buff}</div>
                          {availableBuffs.filter(b => b.type === 'shared_buff').map(buff => (
                            <SelectItem key={buff.id} value={buff.id}>{buff.name}</SelectItem>
                          ))}
                        </>
                      )}
                      {/* 敌人增益 */}
                      {availableBuffs.filter(b => b.type === 'enemy_buff').length > 0 && (
                        <>
                          <div className="text-yellow-500 font-semibold px-2 py-1 sticky top-0 bg-background">{BUFF_TYPE_LABELS.enemy_buff}</div>
                          {availableBuffs.filter(b => b.type === 'enemy_buff').map(buff => (
                            <SelectItem key={buff.id} value={buff.id}>{buff.name}</SelectItem>
                          ))}
                        </>
                      )}
                      {/* 共享减益 */}
                      {availableBuffs.filter(b => b.type === 'shared_debuff').length > 0 && (
                        <>
                          <div className="text-red-500 font-semibold px-2 py-1 sticky top-0 bg-background">{BUFF_TYPE_LABELS.shared_debuff}</div>
                          {availableBuffs.filter(b => b.type === 'shared_debuff').map(buff => (
                            <SelectItem key={buff.id} value={buff.id}>{buff.name}</SelectItem>
                          ))}
                        </>
                      )}
                      {/* 敌人减益 */}
                      {availableBuffs.filter(b => b.type === 'enemy_debuff').length > 0 && (
                        <>
                          <div className="text-orange-500 font-semibold px-2 py-1 sticky top-0 bg-background">{BUFF_TYPE_LABELS.enemy_debuff}</div>
                          {availableBuffs.filter(b => b.type === 'enemy_debuff').map(buff => (
                            <SelectItem key={buff.id} value={buff.id}>{buff.name}</SelectItem>
                          ))}
                        </>
                      )}
                      {/* 其他 */}
                      {availableBuffs.filter(b => b.type === 'other').length > 0 && (
                        <>
                          <div className="text-gray-500 font-semibold px-2 py-1 sticky top-0 bg-background">{BUFF_TYPE_LABELS.other}</div>
                          {availableBuffs.filter(b => b.type === 'other').map(buff => (
                            <SelectItem key={buff.id} value={buff.id}>{buff.name}</SelectItem>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={buffStacks}
                onChange={(e) => setBuffStacks(parseInt(e.target.value) || 1)}
                className="w-20"
                min={1}
              />
              <Button size="icon" onClick={handleAddBuff} disabled={!selectedBuff}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {localEnemy.buffs.map(buff => (
                <div
                  key={buff.id}
                  className={cn(
                    'px-2 py-1 rounded border text-sm',
                    getBuffColor(buff.type)
                  )}
                  title={`${buff.name}: ${buff.details || buff.description}`}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{buff.name}</span>
                    {buff.stacks > 1 && (
                      <Badge variant="secondary" className="text-xs">{buff.stacks}</Badge>
                    )}
                    <button onClick={() => handleRemoveBuff(buff.id)}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-xs opacity-80 mt-0.5 max-w-[200px] truncate">
                    {buff.details || buff.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-1" />
            删除
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 手牌配置弹窗
interface HandConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hand: Card[];
  onUpdate: (hand: Card[]) => void;
  availableCards: Card[];
  isLoading?: boolean;
}

export function HandConfigDialog({
  open,
  onOpenChange,
  hand,
  onUpdate,
  availableCards,
  isLoading = false,
}: HandConfigDialogProps) {
  const [localHand, setLocalHand] = useState<Card[]>(hand);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSave = () => {
    onUpdate(localHand);
    onOpenChange(false);
  };

  const handleAddCard = (card: Card) => {
    const newCard = { 
      ...card, 
      id: `${card.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
    };
    setLocalHand(prev => [...prev, newCard]);
  };

  const handleRemoveCard = (cardId: string) => {
    setLocalHand(prev => prev.filter(c => c.id !== cardId));
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

  const filteredCards = availableCards.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>配置手牌 ({localHand.length}张)</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="current">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">当前手牌</TabsTrigger>
            <TabsTrigger value="add">添加卡牌</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            {localHand.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                手牌为空，切换到"添加卡牌"标签添加卡牌
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {localHand.map(card => (
                  <div
                    key={card.id}
                    className={cn(
                      "relative rounded-lg bg-gradient-to-br border-2 p-3 flex flex-col h-40",
                      getCardColor(card.color)
                    )}
                  >
                    <button
                      onClick={() => handleRemoveCard(card.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center text-white text-sm font-bold">
                      {card.cost === -1 ? 'X' : card.cost}
                    </div>
                    
                    {card.upgraded && (
                      <div className="absolute top-2 right-8 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">
                        +
                      </div>
                    )}

                    <div className="mt-6 text-center">
                      <div className="text-sm font-bold text-white">{card.name}</div>
                    </div>

                    <div className="flex-1 my-2 bg-black/30 rounded flex items-center justify-center">
                      <span className="text-2xl">
                        {card.type === 'attack' ? '⚔️' : card.type === 'skill' ? '🛡️' : '⚡'}
                      </span>
                    </div>

                    <div className="text-xs text-gray-300 text-center line-clamp-2">
                      {card.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索卡牌..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  加载中...
                </div>
              ) : availableCards.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  暂无可用卡牌，请检查数据库连接
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {filteredCards.map(card => (
                    <div
                      key={card.id}
                      onClick={() => handleAddCard(card)}
                      className={cn(
                        "rounded-lg bg-gradient-to-br border-2 p-3 flex flex-col h-40 cursor-pointer hover:scale-105 transition-transform",
                        getCardColor(card.color)
                      )}
                    >
                      <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center text-white text-sm font-bold">
                        {card.cost === -1 ? 'X' : card.cost}
                      </div>
                      
                      {card.upgraded && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">
                          +
                        </div>
                      )}

                      <div className="mt-6 text-center">
                        <div className="text-sm font-bold text-white">{card.name}</div>
                      </div>

                      <div className="flex-1 my-2 bg-black/30 rounded flex items-center justify-center">
                        <span className="text-2xl">
                          {card.type === 'attack' ? '⚔️' : card.type === 'skill' ? '🛡️' : '⚡'}
                        </span>
                      </div>

                      <div className="text-xs text-gray-300 text-center line-clamp-2">
                        {card.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 添加敌人弹窗
interface AddEnemyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (enemy: Enemy) => void;
  availableEnemies: Enemy[];
  availableBuffs: Buff[];
  isLoading?: boolean;
}

export function AddEnemyDialog({
  open,
  onOpenChange,
  onAdd,
  availableEnemies,
  isLoading = false,
}: AddEnemyDialogProps) {
  const handleAdd = (templateEnemy: Enemy) => {
    const newEnemy: Enemy = {
      ...templateEnemy,
      id: `enemy-${Date.now()}`,
      currentHp: templateEnemy.maxHp,
      block: 0,
      buffs: [],
      intent: { type: 'attack', value: 5, description: '准备攻击造成5点伤害' },
    };
    onAdd(newEnemy);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>添加敌人</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-slate-400">
            加载中...
          </div>
        ) : availableEnemies.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-400">
            暂无可用敌人，请检查数据库连接
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                普通敌人
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableEnemies.filter(e => e.type === 'normal').map(enemy => (
                  <Button
                    key={enemy.id}
                    variant="outline"
                    className="justify-start border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50"
                    onClick={() => handleAdd(enemy)}
                  >
                    <span className="text-slate-300">👾 {enemy.name}</span>
                    <span className="ml-auto text-slate-500">{enemy.maxHp}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-amber-400 text-sm mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                精英敌人
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableEnemies.filter(e => e.type === 'elite').map(enemy => (
                  <Button
                    key={enemy.id}
                    variant="outline"
                    className="justify-start border-amber-700/50 hover:border-amber-600 hover:bg-amber-950/30"
                    onClick={() => handleAdd(enemy)}
                  >
                    <span className="text-amber-400">💀 {enemy.name}</span>
                    <span className="ml-auto text-slate-500">{enemy.maxHp}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-rose-400 text-sm mb-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Boss
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableEnemies.filter(e => e.type === 'boss').map(enemy => (
                  <Button
                    key={enemy.id}
                    variant="outline"
                    className="justify-start border-rose-700/50 hover:border-rose-600 hover:bg-rose-950/30"
                    onClick={() => handleAdd(enemy)}
                  >
                    <span className="text-rose-400">👹 {enemy.name}</span>
                    <span className="ml-auto text-slate-500">{enemy.maxHp}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// 牌堆查看弹窗
interface PileViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  cards: Card[];
  icon: React.ReactNode;
  color: string;
}

export function PileViewDialog({
  open,
  onOpenChange,
  title,
  cards,
  icon,
  color,
}: PileViewDialogProps) {
  const getCardColor = (cardColor: string) => {
    switch (cardColor) {
      case 'red': return 'from-red-900 to-red-800 border-red-700';
      case 'green': return 'from-green-900 to-green-800 border-green-700';
      case 'blue': return 'from-cyan-900 to-cyan-800 border-cyan-700';
      case 'purple': return 'from-purple-900 to-purple-800 border-purple-700';
      case 'colorless': return 'from-gray-700 to-gray-600 border-gray-500';
      default: return 'from-gray-800 to-gray-700 border-gray-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={color}>{icon}</span>
            {title} ({cards.length}张)
          </DialogTitle>
        </DialogHeader>

        {cards.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            牌堆为空
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {cards.map(card => (
              <div
                key={card.id}
                className={cn(
                  "rounded-lg bg-gradient-to-br border-2 p-3 flex flex-col h-40",
                  getCardColor(card.color)
                )}
              >
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center text-white text-sm font-bold">
                  {card.cost === -1 ? 'X' : card.cost}
                </div>
                
                {card.upgraded && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">
                    +
                  </div>
                )}

                <div className="mt-6 text-center">
                  <div className="text-sm font-bold text-white">{card.name}</div>
                </div>

                <div className="flex-1 my-2 bg-black/30 rounded flex items-center justify-center">
                  <span className="text-2xl">
                    {card.type === 'attack' ? '⚔️' : card.type === 'skill' ? '🛡️' : '⚡'}
                  </span>
                </div>

                <div className="text-xs text-gray-300 text-center line-clamp-2">
                  {card.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
