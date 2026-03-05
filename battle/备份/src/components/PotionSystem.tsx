import { useState } from 'react';
import type { Potion } from '@/types/game';
import { PRESET_POTIONS, POTION_RARITY_COLORS } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, X, Search, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PotionSystemProps {
  potions: Potion[];
  maxPotionSlots: number;
  onAddPotion: (potion: Potion) => void;
  onRemovePotion: (potionId: string) => void;
}

export function PotionSystem({ potions, maxPotionSlots, onAddPotion, onRemovePotion }: PotionSystemProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredPotions = PRESET_POTIONS.filter(potion =>
    !potions.some(p => p.id === potion.id) &&
    (potion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    potion.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddPotion = (potion: Potion) => {
    onAddPotion({ ...potion, id: `${potion.id}-${Date.now()}` });
    setDialogOpen(false);
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return '🧪';
      case 'uncommon': return '⚗️';
      case 'rare': return '🔮';
      default: return '🧪';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-600 bg-gray-800';
      case 'uncommon': return 'border-green-600 bg-green-900/30';
      case 'rare': return 'border-yellow-600 bg-yellow-900/30';
      default: return 'border-gray-600 bg-gray-800';
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-300">药水</span>
          <Badge variant="outline" className="text-xs">
            {potions.length}/{maxPotionSlots}
          </Badge>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="icon" 
              variant="ghost" 
              className="w-6 h-6"
              disabled={potions.length >= maxPotionSlots}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>添加药水</DialogTitle>
            </DialogHeader>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索药水..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 gap-2">
                {filteredPotions.map(potion => (
                  <button
                    key={potion.id}
                    onClick={() => handleAddPotion(potion)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border transition-colors text-left",
                      getRarityColor(potion.rarity),
                      "hover:brightness-110"
                    )}
                  >
                    <span className="text-xl">{getRarityIcon(potion.rarity)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-medium", POTION_RARITY_COLORS[potion.rarity])}>
                          {potion.name}
                        </span>
                        {potion.character && (
                          <Badge variant="secondary" className="text-xs">
                            {potion.character === 'ironclad' ? '战士' :
                             potion.character === 'silent' ? '猎手' :
                             potion.character === 'defect' ? '机器人' : '观者'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{potion.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* 药水列表 */}
      <div className="flex flex-wrap gap-1.5">
        {potions.length === 0 ? (
          <span className="text-xs text-gray-500">点击 + 添加药水</span>
        ) : (
          potions.map(potion => (
            <div
              key={potion.id}
              className={cn(
                "group relative flex items-center gap-1.5 px-2 py-1 rounded border transition-colors",
                getRarityColor(potion.rarity),
                "hover:brightness-110"
              )}
              title={potion.description}
            >
              <span>{getRarityIcon(potion.rarity)}</span>
              <span className={cn("text-xs font-medium", POTION_RARITY_COLORS[potion.rarity])}>
                {potion.name}
              </span>
              <button
                onClick={() => onRemovePotion(potion.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
              >
                <X className="w-3 h-3 text-red-400" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
