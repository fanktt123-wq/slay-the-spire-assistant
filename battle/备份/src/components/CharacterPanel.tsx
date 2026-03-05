import { useState } from 'react';
import type { Character, CharacterClass, Buff } from '@/types/game';
import { PRESET_BUFFS, CHARACTER_NAMES } from '@/types/game';
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
import { Plus, Trash2, Heart, Zap, Shield, Sword } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CharacterPanelProps {
  character: Character;
  onUpdateCharacter: (updates: Partial<Character>) => void;
  onAddBuff: (buff: Buff) => void;
  onRemoveBuff: (buffId: string) => void;
  onUpdateBuffStacks: (buffId: string, stacks: number) => void;
}

export function CharacterPanel({
  character,
  onUpdateCharacter,
  onAddBuff,
  onRemoveBuff,
  onUpdateBuffStacks,
}: CharacterPanelProps) {
  const [selectedBuff, setSelectedBuff] = useState<string>('');
  const [buffStacks, setBuffStacks] = useState<number>(1);

  const handleAddBuff = () => {
    if (!selectedBuff) return;
    const presetBuff = PRESET_BUFFS.find(b => b.id === selectedBuff);
    if (!presetBuff) return;
    
    const existingBuff = character.buffs.find(b => b.id === selectedBuff);
    if (existingBuff) {
      onUpdateBuffStacks(selectedBuff, existingBuff.stacks + buffStacks);
    } else {
      onAddBuff({
        ...presetBuff,
        stacks: buffStacks,
      });
    }
    setSelectedBuff('');
    setBuffStacks(1);
  };

  const getClassIcon = (characterClass: CharacterClass) => {
    switch (characterClass) {
      case 'ironclad': return '🔴';
      case 'silent': return '🟢';
      case 'defect': return '🔵';
      case 'watcher': return '🟣';
    }
  };

  const getClassColor = (characterClass: CharacterClass) => {
    switch (characterClass) {
      case 'ironclad': return 'text-red-500';
      case 'silent': return 'text-green-500';
      case 'defect': return 'text-cyan-500';
      case 'watcher': return 'text-purple-500';
    }
  };

  const getBuffColor = (type: 'buff' | 'debuff') => {
    return type === 'buff' 
      ? 'bg-green-900 border-green-700 text-green-200' 
      : 'bg-red-900 border-red-700 text-red-200';
  };

  return (
    <div className="space-y-4">
      {/* 角色基本信息 */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-2xl">{getClassIcon(character.class)}</span>
            <span className={getClassColor(character.class)}>
              {CHARACTER_NAMES[character.class]}
            </span>
          </h3>
          <Select
            value={character.class}
            onValueChange={(value) => onUpdateCharacter({ class: value as CharacterClass })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="选择职业" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ironclad">铁甲战士</SelectItem>
              <SelectItem value="silent">静默猎手</SelectItem>
              <SelectItem value="defect">故障机器人</SelectItem>
              <SelectItem value="watcher">观者</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 血量和能量 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label className="text-red-400 flex items-center gap-1">
              <Heart className="w-4 h-4" />
              生命值
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={character.currentHp}
                onChange={(e) => onUpdateCharacter({ 
                  currentHp: parseInt(e.target.value) || 0 
                })}
                className="w-20"
                min={0}
              />
              <span className="text-gray-400">/</span>
              <Input
                type="number"
                value={character.maxHp}
                onChange={(e) => onUpdateCharacter({ 
                  maxHp: parseInt(e.target.value) || 1 
                })}
                className="w-20"
                min={1}
              />
            </div>
            {/* 血量条 */}
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-600 transition-all"
                style={{ 
                  width: `${Math.max(0, Math.min(100, (character.currentHp / character.maxHp) * 100))}%` 
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-yellow-400 flex items-center gap-1">
              <Zap className="w-4 h-4" />
              能量
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={character.energy}
                onChange={(e) => onUpdateCharacter({ 
                  energy: parseInt(e.target.value) || 0 
                })}
                className="w-20"
                min={0}
              />
              <span className="text-gray-400">/</span>
              <Input
                type="number"
                value={character.maxEnergy}
                onChange={(e) => onUpdateCharacter({ 
                  maxEnergy: parseInt(e.target.value) || 1 
                })}
                className="w-20"
                min={1}
              />
            </div>
            {/* 能量条 */}
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500 transition-all"
                style={{ 
                  width: `${Math.max(0, Math.min(100, (character.energy / character.maxEnergy) * 100))}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* 护甲 */}
        <div className="space-y-2 mb-4">
          <Label className="text-blue-400 flex items-center gap-1">
            <Shield className="w-4 h-4" />
            格挡
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={character.block}
              onChange={(e) => onUpdateCharacter({ 
                block: parseInt(e.target.value) || 0 
              })}
              className="w-24"
              min={0}
            />
            {character.block > 0 && (
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                <Shield className="w-3 h-3 mr-1" />
                {character.block}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Buff/Debuff */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sword className="w-5 h-5" />
            Buff / Debuff
          </h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                添加效果
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加 Buff/Debuff</DialogTitle>
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
                <Button onClick={handleAddBuff} className="w-full">
                  添加
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-wrap gap-2">
          {character.buffs.length === 0 ? (
            <div className="text-gray-500 text-sm">暂无Buff或Debuff</div>
          ) : (
            character.buffs.map(buff => (
              <div
                key={buff.id}
                className={cn(
                  'relative group px-3 py-2 rounded-lg border flex items-center gap-2',
                  getBuffColor(buff.type)
                )}
              >
                <span className="font-medium">{buff.name}</span>
                {buff.stacks > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {buff.stacks}
                  </Badge>
                )}
                <button
                  onClick={() => onRemoveBuff(buff.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
