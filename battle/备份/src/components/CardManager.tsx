import { useState } from 'react';
import type { Card } from '@/types/game';
import { PRESET_CARDS } from '@/types/game';
import { CardItem } from './CardItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Plus, Trash2, Hand, Layers, Package, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardManagerProps {
  deck: Card[];
  hand: Card[];
  drawPile: Card[];
  discardPile: Card[];
  exhaustPile: Card[];
  onSetDeck: (cards: Card[]) => void;
  onSetHand: (cards: Card[]) => void;
  onSetDrawPile: (cards: Card[]) => void;
  onSetDiscardPile: (cards: Card[]) => void;
  onSetExhaustPile: (cards: Card[]) => void;
}

type CardPile = 'deck' | 'hand' | 'drawPile' | 'discardPile' | 'exhaustPile';

export function CardManager({
  deck,
  hand,
  drawPile,
  discardPile,
  exhaustPile,
  onSetDeck,
  onSetHand,
  onSetDrawPile,
  onSetDiscardPile,
  onSetExhaustPile,
}: CardManagerProps) {
  const [activeTab, setActiveTab] = useState<CardPile>('hand');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getCurrentPile = () => {
    switch (activeTab) {
      case 'deck': return deck;
      case 'hand': return hand;
      case 'drawPile': return drawPile;
      case 'discardPile': return discardPile;
      case 'exhaustPile': return exhaustPile;
    }
  };

  const getPileSetter = () => {
    switch (activeTab) {
      case 'deck': return onSetDeck;
      case 'hand': return onSetHand;
      case 'drawPile': return onSetDrawPile;
      case 'discardPile': return onSetDiscardPile;
      case 'exhaustPile': return onSetExhaustPile;
    }
  };

  const addCard = (card: Card) => {
    const setter = getPileSetter();
    const currentPile = getCurrentPile();
    const newCard = { ...card, id: `${card.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
    setter([...currentPile, newCard]);
  };

  const removeCard = (cardId: string) => {
    const setter = getPileSetter();
    const currentPile = getCurrentPile();
    setter(currentPile.filter(c => c.id !== cardId));
    if (selectedCard === cardId) setSelectedCard(null);
  };

  const clearPile = () => {
    const setter = getPileSetter();
    setter([]);
    setSelectedCard(null);
  };

  const moveCard = (from: CardPile, to: CardPile, cardId: string) => {
    const sourcePile = (() => {
      switch (from) {
        case 'deck': return deck;
        case 'hand': return hand;
        case 'drawPile': return drawPile;
        case 'discardPile': return discardPile;
        case 'exhaustPile': return exhaustPile;
      }
    })();

    const targetPile = (() => {
      switch (to) {
        case 'deck': return deck;
        case 'hand': return hand;
        case 'drawPile': return drawPile;
        case 'discardPile': return discardPile;
        case 'exhaustPile': return exhaustPile;
      }
    })();

    const card = sourcePile.find(c => c.id === cardId);
    if (!card) return;

    // 从源移除
    const sourceSetter = (() => {
      switch (from) {
        case 'deck': return onSetDeck;
        case 'hand': return onSetHand;
        case 'drawPile': return onSetDrawPile;
        case 'discardPile': return onSetDiscardPile;
        case 'exhaustPile': return onSetExhaustPile;
      }
    })();
    sourceSetter(sourcePile.filter(c => c.id !== cardId));

    // 添加到目标
    const targetSetter = (() => {
      switch (to) {
        case 'deck': return onSetDeck;
        case 'hand': return onSetHand;
        case 'drawPile': return onSetDrawPile;
        case 'discardPile': return onSetDiscardPile;
        case 'exhaustPile': return onSetExhaustPile;
      }
    })();
    targetSetter([...targetPile, card]);
  };

  const filteredPresetCards = PRESET_CARDS.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs: { id: CardPile; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'hand', label: '手牌', icon: <Hand className="w-4 h-4" />, count: hand.length },
    { id: 'drawPile', label: '抽牌堆', icon: <Layers className="w-4 h-4" />, count: drawPile.length },
    { id: 'discardPile', label: '弃牌堆', icon: <Package className="w-4 h-4" />, count: discardPile.length },
    { id: 'exhaustPile', label: '消耗堆', icon: <Flame className="w-4 h-4" />, count: exhaustPile.length },
    { id: 'deck', label: '完整卡组', icon: <Package className="w-4 h-4" />, count: deck.length },
  ];

  return (
    <div className="space-y-4">
      {/* 标签页 */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <Badge variant={activeTab === tab.id ? 'secondary' : 'outline'} className="ml-1">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* 当前牌堆显示 */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">
            {tabs.find(t => t.id === activeTab)?.label}
          </h3>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  添加卡牌
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>添加卡牌到{tabs.find(t => t.id === activeTab)?.label}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="搜索卡牌..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <ScrollArea className="h-96">
                    <div className="grid grid-cols-3 gap-3">
                      {filteredPresetCards.map(card => (
                        <div
                          key={card.id}
                          onClick={() => addCard(card)}
                          className="cursor-pointer"
                        >
                          <CardItem card={card} compact />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="destructive" onClick={clearPile}>
              <Trash2 className="w-4 h-4 mr-1" />
              清空
            </Button>
          </div>
        </div>

        <ScrollArea className="h-64">
          <div className="flex flex-wrap gap-3">
            {getCurrentPile().length === 0 ? (
              <div className="w-full h-32 flex items-center justify-center text-gray-500">
                暂无卡牌，点击"添加卡牌"按钮添加
              </div>
            ) : (
              getCurrentPile().map(card => (
                <div key={card.id} className="relative group">
                  <div
                    onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}
                  >
                    <CardItem 
                      card={card} 
                      compact 
                      selected={selectedCard === card.id}
                    />
                  </div>
                  
                  {/* 操作按钮 */}
                  {selectedCard === card.id && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                      {activeTab !== 'hand' && (
                        <Button
                          size="icon"
                          variant="secondary"
                          className="w-6 h-6"
                          onClick={() => moveCard(activeTab, 'hand', card.id)}
                        >
                          <Hand className="w-3 h-3" />
                        </Button>
                      )}
                      {activeTab !== 'discardPile' && (
                        <Button
                          size="icon"
                          variant="secondary"
                          className="w-6 h-6"
                          onClick={() => moveCard(activeTab, 'discardPile', card.id)}
                        >
                          <Package className="w-3 h-3" />
                        </Button>
                      )}
                      {activeTab !== 'exhaustPile' && (
                        <Button
                          size="icon"
                          variant="secondary"
                          className="w-6 h-6"
                          onClick={() => moveCard(activeTab, 'exhaustPile', card.id)}
                        >
                          <Flame className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="destructive"
                        className="w-6 h-6"
                        onClick={() => removeCard(card.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
