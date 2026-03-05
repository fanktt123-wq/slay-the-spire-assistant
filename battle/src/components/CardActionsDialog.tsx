import { useState } from 'react';
import type { Card } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Layers, Package, Flame, Trash2, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';

type CardDestination = 'draw' | 'discard' | 'exhaust' | 'hand';

interface CardActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: Card | null;
  onMoveTo: (cardId: string, destination: CardDestination) => void;
  onDelete: (cardId: string) => void;
}

export function CardActionsDialog({
  open,
  onOpenChange,
  card,
  onMoveTo,
  onDelete,
}: CardActionsDialogProps) {
  if (!card) return null;

  const handleMove = (destination: CardDestination) => {
    onMoveTo(card.id, destination);
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete(card.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>卡牌操作</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 卡牌信息 */}
          <div className={cn(
            "relative rounded-lg bg-gradient-to-br border-2 p-4 flex flex-col h-48",
            getCardColor(card.color)
          )}>
            <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-white text-sm font-bold">
              {card.cost}
            </div>
            
            {card.upgraded && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">
                +
              </div>
            )}

            <div className="mt-8 text-center">
              <div className="text-lg font-bold text-white">{card.name}</div>
            </div>

            <div className="flex-1 my-3 bg-black/30 rounded flex items-center justify-center">
              <span className="text-4xl">
                {card.type === 'attack' ? '⚔️' : card.type === 'skill' ? '🛡️' : '⚡'}
              </span>
            </div>

            <div className="text-sm text-gray-300 text-center">
              {card.description}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="grid grid-cols-1 gap-2">
            <Label className="text-sm text-gray-400">移动到</Label>
            
            <Button 
              variant="outline" 
              onClick={() => handleMove('draw')}
              className="justify-start"
            >
              <Layers className="w-4 h-4 mr-2 text-blue-400" />
              抽牌堆
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleMove('discard')}
              className="justify-start"
            >
              <Package className="w-4 h-4 mr-2 text-gray-400" />
              弃牌堆
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleMove('exhaust')}
              className="justify-start"
            >
              <Flame className="w-4 h-4 mr-2 text-orange-400" />
              消耗堆
            </Button>

            <div className="h-px bg-gray-700 my-2" />

            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="justify-start"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              删除卡牌
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getCardColor(color: string) {
  switch (color) {
    case 'red': return 'from-red-900 to-red-800 border-red-700';
    case 'green': return 'from-green-900 to-green-800 border-green-700';
    case 'blue': return 'from-cyan-900 to-cyan-800 border-cyan-700';
    case 'purple': return 'from-purple-900 to-purple-800 border-purple-700';
    case 'colorless': return 'from-gray-700 to-gray-600 border-gray-500';
    default: return 'from-gray-800 to-gray-700 border-gray-600';
  }
}

// 牌堆管理弹窗（增强版）
interface PileManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  cards: Card[];
  icon: React.ReactNode;
  color: string;
  pileType: 'draw' | 'discard' | 'exhaust';
  availableCards: Card[];
  isLoading?: boolean;
  onUpdateCards: (cards: Card[]) => void;
  onMoveCardTo: (cardId: string, destination: 'draw' | 'discard' | 'exhaust' | 'hand') => void;
}

export function PileManagerDialog({
  open,
  onOpenChange,
  title,
  cards,
  icon,
  color,
  pileType,
  availableCards,
  isLoading = false,
  onUpdateCards,
  onMoveCardTo,
}: PileManagerDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showCardActions, setShowCardActions] = useState(false);

  const filteredCards = availableCards.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCard = (presetCard: Card) => {
    const newCard: Card = {
      ...presetCard,
      id: `${presetCard.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    onUpdateCards([...cards, newCard]);
    setShowAddDialog(false);
  };

  const handleRemoveCard = (cardId: string) => {
    onUpdateCards(cards.filter(c => c.id !== cardId));
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setShowCardActions(true);
  };

  const handleMoveCard = (cardId: string, destination: 'draw' | 'discard' | 'exhaust' | 'hand') => {
    // 如果目标就是当前堆，不执行操作
    if (destination === pileType) return;
    
    // 直接调用 onMoveCardTo 让父组件处理状态更新
    // 不要在这里调用 onUpdateCards，因为 onMoveCardTo 内部已经处理了从源堆移除的逻辑
    onMoveCardTo(cardId, destination);
  };

  const getDestinationOptions = () => {
    const options = [];
    if (pileType !== 'draw') options.push({ value: 'draw', label: '抽牌堆', icon: <Layers className="w-4 h-4" /> });
    if (pileType !== 'discard') options.push({ value: 'discard', label: '弃牌堆', icon: <Package className="w-4 h-4" /> });
    if (pileType !== 'exhaust') options.push({ value: 'exhaust', label: '消耗堆', icon: <Flame className="w-4 h-4" /> });
    // 始终可以移动到手牌
    options.push({ value: 'hand', label: '手牌', icon: <Hand className="w-4 h-4" /> });
    return options;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className={color}>{icon}</span>
              {title} ({cards.length}张)
            </DialogTitle>
          </DialogHeader>

          {/* 操作栏 */}
          <div className="flex items-center justify-between mb-4">
            <Button onClick={() => setShowAddDialog(true)}>
              添加卡牌
            </Button>
            {cards.length > 0 && (
              <span className="text-sm text-gray-400">
                点击卡牌查看操作选项
              </span>
            )}
          </div>

          {cards.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              牌堆为空，点击"添加卡牌"按钮添加
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {cards.map(card => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={cn(
                    "relative rounded-lg bg-gradient-to-br border-2 p-3 flex flex-col h-40 cursor-pointer hover:scale-105 transition-transform",
                    getCardColor(card.color)
                  )}
                >
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center text-white text-sm font-bold">
                    {card.cost}
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

      {/* 添加卡牌弹窗 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>添加卡牌到{title}</DialogTitle>
          </DialogHeader>

          <div className="relative mb-4">
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
                暂无可用的卡牌，请检查数据库连接
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
                      {card.cost}
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
        </DialogContent>
      </Dialog>

      {/* 卡牌操作弹窗 */}
      <Dialog open={showCardActions} onOpenChange={setShowCardActions}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>卡牌操作</DialogTitle>
          </DialogHeader>

          {selectedCard && (
            <div className="space-y-4">
              {/* 卡牌信息 */}
              <div className={cn(
                "relative rounded-lg bg-gradient-to-br border-2 p-4 flex flex-col h-48",
                getCardColor(selectedCard.color)
              )}>
                <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-white text-sm font-bold">
                  {selectedCard.cost}
                </div>
                
                {selectedCard.upgraded && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">
                    +
                  </div>
                )}

                <div className="mt-8 text-center">
                  <div className="text-lg font-bold text-white">{selectedCard.name}</div>
                </div>

                <div className="flex-1 my-3 bg-black/30 rounded flex items-center justify-center">
                  <span className="text-4xl">
                    {selectedCard.type === 'attack' ? '⚔️' : selectedCard.type === 'skill' ? '🛡️' : '⚡'}
                  </span>
                </div>

                <div className="text-sm text-gray-300 text-center">
                  {selectedCard.description}
                </div>
              </div>

              {/* 移动选项 */}
              <div className="grid grid-cols-1 gap-2">
                <Label className="text-sm text-gray-400">移动到</Label>
                
                {getDestinationOptions().map(option => (
                  <Button 
                    key={option.value}
                    variant="outline" 
                    onClick={() => {
                      handleMoveCard(selectedCard.id, option.value as 'draw' | 'discard' | 'exhaust' | 'hand');
                      setShowCardActions(false);
                    }}
                    className="justify-start"
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </Button>
                ))}

                <div className="h-px bg-gray-700 my-2" />

                <Button 
                  variant="destructive" 
                  onClick={() => {
                    handleRemoveCard(selectedCard.id);
                    setShowCardActions(false);
                  }}
                  className="justify-start"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除卡牌
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
