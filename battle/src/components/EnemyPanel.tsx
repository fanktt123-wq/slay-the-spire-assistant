import { useState } from 'react';
import type { Enemy, Buff } from '@/types/game';
import { BUFF_TYPE_LABELS } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Plus, Trash2, Heart, Shield, Eye, Skull, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnemyPanelProps {
  enemies: Enemy[];
  availableEnemies: Enemy[]; // 从API获取的可用敌人模板
  availableBuffs: Buff[];    // 从API获取的可用Buff
  isLoading?: boolean;
  onAddEnemy: (enemy: Enemy) => void;
  onRemoveEnemy: (enemyId: string) => void;
  onUpdateEnemy: (enemyId: string, updates: Partial<Enemy>) => void;
  onAddBuff: (enemyId: string, buff: Buff) => void;
  onRemoveBuff: (enemyId: string, buffId: string) => void;
  onUpdateBuffStacks: (enemyId: string, buffId: string, stacks: number) => void;
}

export function EnemyPanel({
  enemies,
  availableEnemies,
  availableBuffs,
  isLoading = false,
  onAddEnemy,
  onRemoveEnemy,
  onUpdateEnemy,
  onAddBuff,
  onRemoveBuff,
  onUpdateBuffStacks,
}: EnemyPanelProps) {
  const [selectedEnemy, setSelectedEnemy] = useState<string | null>(null);
  const [selectedBuff, setSelectedBuff] = useState<string>('');
  const [buffStacks, setBuffStacks] = useState<number>(1);

  const handleAddEnemy = (templateEnemy: Enemy) => {
    const newEnemy: Enemy = {
      ...templateEnemy,
      id: `enemy-${Date.now()}`,
      currentHp: templateEnemy.maxHp,
      block: 0,
      buffs: [],
      intent: { type: 'attack', value: 5, description: '准备攻击造成5点伤害' },
    };
    onAddEnemy(newEnemy);
  };

  const handleAddBuff = (enemyId: string) => {
    if (!selectedBuff) return;
    const templateBuff = availableBuffs.find(b => b.id === selectedBuff);
    if (!templateBuff) return;

    const enemy = enemies.find(e => e.id === enemyId);
    const existingBuff = enemy?.buffs.find(b => b.id === selectedBuff);
    
    if (existingBuff) {
      onUpdateBuffStacks(enemyId, selectedBuff, existingBuff.stacks + buffStacks);
    } else {
      onAddBuff(enemyId, {
        ...templateBuff,
        stacks: buffStacks,
      });
    }
    setSelectedBuff('');
    setBuffStacks(1);
  };

  const getEnemyTypeColor = (type: string) => {
    switch (type) {
      case 'normal': return 'text-slate-400';
      case 'elite': return 'text-amber-400';
      case 'boss': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  const getEnemyTypeBg = (type: string) => {
    switch (type) {
      case 'normal': return 'enemy-card-normal';
      case 'elite': return 'enemy-card-elite';
      case 'boss': return 'enemy-card-boss';
      default: return 'enemy-card-normal';
    }
  };

  const getBuffColor = (type: Buff['type']) => {
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
    <div className="space-y-4">
      {/* 添加敌人按钮 */}
      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={isLoading || availableEnemies.length === 0}>
              <Plus className="w-4 h-4 mr-1" />
              添加敌人
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>添加敌人</DialogTitle>
            </DialogHeader>
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                加载中...
              </div>
            ) : availableEnemies.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                暂无可用敌人，请检查数据库连接
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                  普通敌人
                </div>
                {availableEnemies.filter(e => e.type === 'normal').map(enemy => (
                  <Button
                    key={enemy.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleAddEnemy(enemy)}
                  >
                    <span className="text-gray-400">{enemy.name}</span>
                    <span className="ml-auto text-gray-500">{enemy.maxHp} HP</span>
                  </Button>
                ))}
                <div className="flex items-center gap-2 text-amber-400 text-sm mb-2 mt-4">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  精英敌人
                </div>
                {availableEnemies.filter(e => e.type === 'elite').map(enemy => (
                  <Button
                    key={enemy.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleAddEnemy(enemy)}
                  >
                    <span className="text-yellow-500">{enemy.name}</span>
                    <span className="ml-auto text-gray-500">{enemy.maxHp} HP</span>
                  </Button>
                ))}
                <div className="flex items-center gap-2 text-rose-400 text-sm mb-2 mt-4">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Boss
                </div>
                {availableEnemies.filter(e => e.type === 'boss').map(enemy => (
                  <Button
                    key={enemy.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleAddEnemy(enemy)}
                  >
                    <span className="text-red-500">{enemy.name}</span>
                    <span className="ml-auto text-gray-500">{enemy.maxHp} HP</span>
                  </Button>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* 敌人列表 */}
      <div className="space-y-3">
        {enemies.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center text-slate-400">
            暂无敌人，点击"添加敌人"按钮添加
          </div>
        ) : (
          enemies.map(enemy => (
            <div
              key={enemy.id}
              className={cn(
                'rounded-lg p-4 border transition-all',
                getEnemyTypeBg(enemy.type),
                selectedEnemy === enemy.id && 'ring-2 ring-blue-500'
              )}
              onClick={() => setSelectedEnemy(selectedEnemy === enemy.id ? null : enemy.id)}
            >
              {/* 敌人头部信息 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {enemy.type === 'boss' ? '👹' : enemy.type === 'elite' ? '💀' : '👾'}
                  </span>
                  <div>
                    <h4 className="font-semibold text-white">{enemy.name}</h4>
                    <span className={cn('text-xs', getEnemyTypeColor(enemy.type))}>
                      {enemy.type === 'normal' ? '普通' : enemy.type === 'elite' ? '精英' : 'Boss'}
                    </span>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="destructive"
                  className="w-6 h-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveEnemy(enemy.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>

              {/* 血量和护甲 */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="space-y-1">
                  <Label className="text-red-400 text-xs flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    生命值
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={enemy.currentHp}
                      onChange={(e) => onUpdateEnemy(enemy.id, { 
                        currentHp: parseInt(e.target.value) || 0 
                      })}
                      className="w-16 h-8 text-sm"
                      min={0}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-gray-400">/</span>
                    <Input
                      type="number"
                      value={enemy.maxHp}
                      onChange={(e) => onUpdateEnemy(enemy.id, { 
                        maxHp: parseInt(e.target.value) || 1 
                      })}
                      className="w-16 h-8 text-sm"
                      min={1}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-600 transition-all"
                      style={{ 
                        width: `${Math.max(0, Math.min(100, (enemy.currentHp / enemy.maxHp) * 100))}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-blue-400 text-xs flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    格挡
                  </Label>
                  <Input
                    type="number"
                    value={enemy.block}
                    onChange={(e) => onUpdateEnemy(enemy.id, { 
                      block: parseInt(e.target.value) || 0 
                    })}
                    className="w-20 h-8 text-sm"
                    min={0}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {enemy.block > 0 && (
                    <Badge variant="outline" className="text-blue-400 border-blue-400 text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      {enemy.block}
                    </Badge>
                  )}
                </div>
              </div>

              {/* 意图 */}
              <div className="space-y-1 mb-3">
                <Label className="text-purple-400 text-xs flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  意图
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={enemy.intent.type}
                    onValueChange={(value) => onUpdateEnemy(enemy.id, {
                      intent: { ...enemy.intent, type: value as any }
                    })}
                  >
                    <SelectTrigger className="w-28 h-8 text-sm">
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
                  {enemy.intent.type === 'attack' && (
                    <Input
                      type="number"
                      value={enemy.intent.value || 0}
                      onChange={(e) => onUpdateEnemy(enemy.id, {
                        intent: { ...enemy.intent, value: parseInt(e.target.value) || 0 }
                      })}
                      className="w-16 h-8 text-sm"
                      placeholder="伤害"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <Input
                    value={enemy.intent.description}
                    onChange={(e) => onUpdateEnemy(enemy.id, {
                      intent: { ...enemy.intent, description: e.target.value }
                    })}
                    className="flex-1 h-8 text-sm"
                    placeholder="意图描述"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* 怪物信息 */}
              {(enemy.details.description || enemy.details.behavior || enemy.details.specialMechanics || enemy.details.recommendedStrategy) && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="info" className="border-0">
                    <AccordionTrigger className="py-2 hover:no-underline">
                      <div className="flex items-center gap-1 text-xs text-blue-400">
                        <BookOpen className="w-3 h-3" />
                        怪物信息
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-xs bg-black/20 rounded p-2">
                        {enemy.details.description && (
                          <div>
                            <span className="text-gray-400">描述: </span>
                            <span className="text-gray-300">{enemy.details.description}</span>
                          </div>
                        )}
                        {enemy.details.behavior && (
                          <div>
                            <span className="text-gray-400">行为: </span>
                            <span className="text-gray-300 whitespace-pre-wrap">{enemy.details.behavior}</span>
                          </div>
                        )}
                        {enemy.details.specialMechanics && (
                          <div>
                            <span className="text-gray-400">机制: </span>
                            <span className="text-gray-300 whitespace-pre-wrap">{enemy.details.specialMechanics}</span>
                          </div>
                        )}
                        {enemy.details.recommendedStrategy && (
                          <div>
                            <span className="text-gray-400">策略: </span>
                            <span className="text-gray-300 whitespace-pre-wrap">{enemy.details.recommendedStrategy}</span>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {/* Buff/Debuff */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-400 text-xs flex items-center gap-1">
                    <Skull className="w-3 h-3" />
                    Buff / Debuff
                  </Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 text-xs"
                        onClick={(e) => e.stopPropagation()}
                        disabled={isLoading || availableBuffs.length === 0}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        添加
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>为 {enemy.name} 添加效果</DialogTitle>
                      </DialogHeader>
                      {isLoading ? (
                        <div className="flex items-center justify-center h-32 text-gray-500">
                          加载中...
                        </div>
                      ) : availableBuffs.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-500">
                          暂无可用Buff，请检查数据库连接
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>选择效果</Label>
                            <Select value={selectedBuff} onValueChange={setSelectedBuff}>
                              <SelectTrigger>
                                <SelectValue placeholder="选择Buff或Debuff" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[400px]">
                                {/* 共享增益 */}
                                {availableBuffs.filter(b => b.type === 'shared_buff').length > 0 && (
                                  <>
                                    <div className="text-green-500 font-semibold px-2 py-1 sticky top-0 bg-background">{BUFF_TYPE_LABELS.shared_buff}</div>
                                    {availableBuffs.filter(b => b.type === 'shared_buff').map(buff => (
                                      <SelectItem key={buff.id} value={buff.id}>
                                        {buff.name}
                                      </SelectItem>
                                    ))}
                                  </>
                                )}
                                {/* 敌人增益 */}
                                {availableBuffs.filter(b => b.type === 'enemy_buff').length > 0 && (
                                  <>
                                    <div className="text-yellow-500 font-semibold px-2 py-1 sticky top-0 bg-background">{BUFF_TYPE_LABELS.enemy_buff}</div>
                                    {availableBuffs.filter(b => b.type === 'enemy_buff').map(buff => (
                                      <SelectItem key={buff.id} value={buff.id}>
                                        {buff.name}
                                      </SelectItem>
                                    ))}
                                  </>
                                )}
                                {/* 共享减益 */}
                                {availableBuffs.filter(b => b.type === 'shared_debuff').length > 0 && (
                                  <>
                                    <div className="text-red-500 font-semibold px-2 py-1 sticky top-0 bg-background">{BUFF_TYPE_LABELS.shared_debuff}</div>
                                    {availableBuffs.filter(b => b.type === 'shared_debuff').map(buff => (
                                      <SelectItem key={buff.id} value={buff.id}>
                                        {buff.name}
                                      </SelectItem>
                                    ))}
                                  </>
                                )}
                                {/* 敌人减益 */}
                                {availableBuffs.filter(b => b.type === 'enemy_debuff').length > 0 && (
                                  <>
                                    <div className="text-orange-500 font-semibold px-2 py-1 sticky top-0 bg-background">{BUFF_TYPE_LABELS.enemy_debuff}</div>
                                    {availableBuffs.filter(b => b.type === 'enemy_debuff').map(buff => (
                                      <SelectItem key={buff.id} value={buff.id}>
                                        {buff.name}
                                      </SelectItem>
                                    ))}
                                  </>
                                )}
                                {/* 其他 */}
                                {availableBuffs.filter(b => b.type === 'other').length > 0 && (
                                  <>
                                    <div className="text-gray-500 font-semibold px-2 py-1 sticky top-0 bg-background">{BUFF_TYPE_LABELS.other}</div>
                                    {availableBuffs.filter(b => b.type === 'other').map(buff => (
                                      <SelectItem key={buff.id} value={buff.id}>
                                        {buff.name}
                                      </SelectItem>
                                    ))}
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>层数</Label>
                            <Input
                              type="number"
                              value={buffStacks}
                              onChange={(e) => setBuffStacks(parseInt(e.target.value) || 1)}
                              min={1}
                            />
                          </div>
                          <Button 
                            onClick={() => handleAddBuff(enemy.id)} 
                            className="w-full"
                          >
                            添加
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-wrap gap-1">
                  {enemy.buffs.map(buff => (
                    <div
                      key={buff.id}
                      className={cn(
                        'px-2 py-1 rounded border flex items-center gap-1 text-xs',
                        getBuffColor(buff.type)
                      )}
                    >
                      <span>{buff.name}</span>
                      {buff.stacks > 0 && (
                        <Badge variant="secondary" className="text-xs px-1">
                          {buff.stacks}
                        </Badge>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveBuff(enemy.id, buff.id);
                        }}
                        className="ml-1 hover:text-white"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
