import { useState } from 'react';
import type { Relic } from '@/types/game';
import { PRESET_RELICS, RELIC_RARITY_COLORS } from '@/types/game';
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
import { Plus, X, Search, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RelicSystemProps {
  relics: Relic[];
  onAddRelic: (relic: Relic) => void;
  onRemoveRelic: (relicId: string) => void;
}

export function RelicSystem({ relics, onAddRelic, onRemoveRelic }: RelicSystemProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredRelics = PRESET_RELICS.filter(relic =>
    !relics.some(r => r.id === relic.id) &&
    (relic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    relic.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddRelic = (relic: Relic) => {
    onAddRelic({ ...relic, id: `${relic.id}-${Date.now()}` });
    setDialogOpen(false);
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'starter': return '⚪';
      case 'common': return '⚪';
      case 'uncommon': return '🟢';
      case 'rare': return '🟡';
      case 'boss': return '🔴';
      case 'event': return '🟣';
      case 'shop': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Gem className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-gray-300">遗物</span>
          <Badge variant="outline" className="text-xs">
            {relics.length}
          </Badge>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost" className="w-6 h-6">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>添加遗物</DialogTitle>
            </DialogHeader>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索遗物..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 gap-2">
                {filteredRelics.map(relic => (
                  <button
                    key={relic.id}
                    onClick={() => handleAddRelic(relic)}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-left"
                  >
                    <span className="text-xl">{getRarityIcon(relic.rarity)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-medium", RELIC_RARITY_COLORS[relic.rarity])}>
                          {relic.name}
                        </span>
                        {relic.character && (
                          <Badge variant="secondary" className="text-xs">
                            {relic.character === 'ironclad' ? '战士' :
                             relic.character === 'silent' ? '猎手' :
                             relic.character === 'defect' ? '机器人' : '观者'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{relic.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* 遗物列表 */}
      <div className="flex flex-wrap gap-1.5">
        {relics.length === 0 ? (
          <span className="text-xs text-gray-500">点击 + 添加遗物</span>
        ) : (
          relics.map(relic => (
            <div
              key={relic.id}
              className="group relative flex items-center gap-1.5 px-2 py-1 rounded bg-gray-800/80 border border-gray-700 hover:border-gray-500 transition-colors"
              title={relic.description}
            >
              <span>{getRarityIcon(relic.rarity)}</span>
              <span className={cn("text-xs font-medium", RELIC_RARITY_COLORS[relic.rarity])}>
                {relic.name}
              </span>
              <button
                onClick={() => onRemoveRelic(relic.id)}
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
