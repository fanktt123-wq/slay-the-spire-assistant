import { useState } from 'react';
import type { Enemy, Buff } from '@/types/game';
import { PRESET_ENEMIES, PRESET_BUFFS } from '@/types/game';
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
import { Plus, Trash2, Heart, Shield, Eye, Skull } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnemyPanelProps {
  enemies: Enemy[];
  onAddEnemy: (enemy: Enemy) => void;
  onRemoveEnemy: (enemyId: string) => void;
  onUpdateEnemy: (enemyId: string, updates: Partial<Enemy>) => void;
  onAddBuff: (enemyId: string, buff: Buff) => void;
  onRemoveBuff: (enemyId: string, buffId: string) => void;
  onUpdateBuffStacks: (enemyId: string, buffId: string, stacks: number) => void;
}

export function EnemyPanel({
  enemies,
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

  const handleAddEnemy = (presetName: string) => {
    const preset = PRESET_ENEMIES.find(e => e.name === presetName);
    if (!preset) return;

    const newEnemy: Enemy = {
      id: `enemy-${Date.now()}`,
      name: preset.name,
      type: preset.type,
      currentHp: preset.maxHp,
      maxHp: preset.maxHp,
      block: 0,
      buffs: [],
      intent: { type: 'attack', value: 5, description: '准备攻击造成5点伤害' },
      details: {
        description: '',
        behavior: '',
        specialMechanics: '',
        recommendedStrategy: '',
      },
    };
    onAddEnemy(newEnemy);
  };

  const handleAddBuff = (enemyId: string) => {
    if (!selectedBuff) return;
    const presetBuff = PRESET_BUFFS.find(b => b.id === selectedBuff);
    if (!presetBuff) return;

    const enemy = enemies.find(e => e.id === enemyId);
    const existingBuff = enemy?.buffs.find(b => b.id === selectedBuff);
    
    if (existingBuff) {
      onUpdateBuffStacks(enemyId, selectedBuff, existingBuff.stacks + buffStacks);
    } else {
      onAddBuff(enemyId, {
        ...presetBuff,
        stacks: buffStacks,
      });
    }
    setSelectedBuff('');
    setBuffStacks(1);
  };

  const getEnemyTypeColor = (type: string) => {
    switch (type) {
      case 'normal': return 'text-gray-400';
      case 'elite': return 'text-yellow-500';
      case 'boss': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getEnemyTypeBg = (type: string) => {
    switch (type) {
      case 'normal': return 'bg-gray-800 border-gray-700';
      case 'elite': return 'bg-yellow-900/30 border-yellow-700';
      case 'boss': return 'bg-red-900/30 border-red-700';
      default: return 'bg-gray-800 border-gray-700';
    }
  };

  const getBuffColor = (type: 'buff' | 'debuff') => {
    return type === 'buff' 
      ? 'bg-green-900 border-green-700 text-green-200' 
      : 'bg-red-900 border-red-700 text-red-200';
  };

  return (
    <div className="space-y-4">
      {/* 添加敌人按钮 */}
      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              添加敌人
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>添加敌人</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <div className="text-gray-500 text-sm mb-2">普通敌人</div>
              {PRESET_ENEMIES.filter(e => e.type === 'normal').map(enemy => (
                <Button
                  key={enemy.name}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleAddEnemy(enemy.name)}
                >
                  <span className="text-gray-400">{enemy.name}</span>
                  <span className="ml-auto text-gray-500">{enemy.maxHp} HP</span>
                </Button>
              ))}
              <div className="text-yellow-500 text-sm mb-2 mt-4">精英敌人</div>
              {PRESET_ENEMIES.filter(e => e.type === 'elite').map(enemy => (
                <Button
                  key={enemy.name}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleAddEnemy(enemy.name)}
                >
                  <span className="text-yellow-500">{enemy.name}</span>
                  <span className="ml-auto text-gray-500">{enemy.maxHp} HP</span>
                </Button>
              ))}
              <div className="text-red-500 text-sm mb-2 mt-4">Boss</div>
              {PRESET_ENEMIES.filter(e => e.type === 'boss').map(enemy => (
                <Button
                  key={enemy.name}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleAddEnemy(enemy.name)}
                >
                  <span className="text-red-500">{enemy.name}</span>
                  <span className="ml-auto text-gray-500">{enemy.maxHp} HP</span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 敌人列表 */}
      <div className="space-y-3">
        {enemies.length === 0 ? (
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 text-center text-gray-500">
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
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        添加
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>为 {enemy.name} 添加效果</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>选择效果</Label>
                          <Select value={selectedBuff} onValueChange={setSelectedBuff}>
                            <SelectTrigger>
                              <SelectValue placeholder="选择Buff或Debuff" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="text-green-500 font-semibold px-2 py-1">Buff</div>
                              {PRESET_BUFFS.filter(b => b.type === 'buff').map(buff => (
                                <SelectItem key={buff.id} value={buff.id}>
                                  {buff.name} - {buff.description}
                                </SelectItem>
                              ))}
                              <div className="text-red-500 font-semibold px-2 py-1">Debuff</div>
                              {PRESET_BUFFS.filter(b => b.type === 'debuff').map(buff => (
                                <SelectItem key={buff.id} value={buff.id}>
                                  {buff.name} - {buff.description}
                                </SelectItem>
                              ))}
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
