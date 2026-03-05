import type { Card } from '@/types/game';
import { CARD_COLOR_STYLES, CARD_TYPE_ICONS } from '@/types/game';
import { cn } from '@/lib/utils';

interface CardItemProps {
  card: Card;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

export function CardItem({ 
  card, 
  onClick, 
  selected = false, 
  disabled = false,
  compact = false 
}: CardItemProps) {
  const colorStyle = CARD_COLOR_STYLES[card.color];
  
  if (compact) {
    return (
      <div
        onClick={!disabled ? onClick : undefined}
        className={cn(
          'relative rounded-md border-2 p-2 cursor-pointer transition-all',
          colorStyle,
          selected && 'ring-2 ring-yellow-400 scale-105',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'hover:scale-105 hover:shadow-lg'
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white">{card.cost}⚡</span>
          <span className="text-lg">{CARD_TYPE_ICONS[card.type]}</span>
        </div>
        <div className="text-xs text-white font-medium truncate mt-1">
          {card.name}{card.upgraded ? '+' : ''}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={cn(
        'relative rounded-lg border-2 p-3 cursor-pointer transition-all w-36 h-48 flex flex-col',
        colorStyle,
        selected && 'ring-2 ring-yellow-400 scale-105',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'hover:scale-105 hover:shadow-xl'
      )}
    >
      {/* 费用 */}
      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-white font-bold shadow-lg">
        {card.cost}
      </div>
      
      {/* 升级标记 */}
      {card.upgraded && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-500 border-2 border-yellow-300 flex items-center justify-center text-white text-xs font-bold shadow-lg">
          +
        </div>
      )}
      
      {/* 类型图标 */}
      <div className="absolute top-2 right-2 text-2xl">
        {CARD_TYPE_ICONS[card.type]}
      </div>
      
      {/* 卡牌名称 */}
      <div className="mt-4 text-center">
        <h3 className="text-sm font-bold text-white leading-tight">
          {card.name}
        </h3>
      </div>
      
      {/* 卡牌图片区域（占位） */}
      <div className="flex-1 my-2 bg-black/30 rounded flex items-center justify-center">
        <span className="text-4xl">{CARD_TYPE_ICONS[card.type]}</span>
      </div>
      
      {/* 卡牌描述 */}
      <div className="text-xs text-gray-200 text-center leading-snug">
        {card.description}
      </div>
      
      {/* 稀有度指示 */}
      <div className={cn(
        'absolute bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full',
        card.rarity === 'basic' && 'bg-gray-400',
        card.rarity === 'common' && 'bg-gray-300',
        card.rarity === 'uncommon' && 'bg-blue-400',
        card.rarity === 'rare' && 'bg-yellow-400',
        card.rarity === 'special' && 'bg-purple-400',
      )} />
    </div>
  );
}
