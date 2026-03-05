import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb, RotateCcw } from 'lucide-react';

interface CommonKnowledgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onSave: (value: string) => void;
}

// 默认常识内容
const DEFAULT_COMMON_KNOWLEDGE = `【游戏常识】

1. 格挡机制：
   - 格挡会在下回合开始时清零
   - 格挡可以抵消受到的伤害

2. 能量机制：
   - 每回合开始时会重置为最大能量
   - 未使用的能量不会保留到下回合

3. 抽牌机制：
   - 每回合开始时抽取固定数量的卡牌（通常是5张）
   - 当抽牌堆为空时，会将弃牌堆洗入抽牌堆

4. 回合结束：
   - 手牌会被移入弃牌堆（除非有特殊效果保留）
   - 敌人的意图会执行

5. Buff/Debuff：
   - 大部分Buff会在回合结束时减少层数
   - 一些Debuff如易伤、脆弱会逐层减少`;

export function CommonKnowledgeDialog({
  open,
  onOpenChange,
  value,
  onSave,
}: CommonKnowledgeDialogProps) {
  const [editValue, setEditValue] = useState(value);

  // 当弹窗打开时，同步当前值
  useEffect(() => {
    if (open) {
      setEditValue(value);
    }
  }, [open, value]);

  const handleSave = () => {
    onSave(editValue.trim());
    onOpenChange(false);
  };

  const handleReset = () => {
    if (confirm('确定要恢复默认常识内容吗？')) {
      setEditValue(DEFAULT_COMMON_KNOWLEDGE);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-100">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            编辑常识区域
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-slate-400 mb-3">
            在这里添加你希望 LLM 了解的杀戮尖塔游戏常识。这些内容将被添加到提示词中，帮助 AI 更好地理解游戏规则。
          </p>

          <ScrollArea className="h-64">
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="输入游戏常识，例如：格挡下回合会消失..."
              className="min-h-[240px] bg-slate-800/50 border-slate-600 text-slate-200 resize-none focus:border-yellow-500/50"
            />
          </ScrollArea>

          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
            <span>提示：可以编辑内容以适应不同的 Mod 或特殊规则</span>
            <span className="ml-auto">{editValue.length} 字符</span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            恢复默认
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 从 localStorage 加载常识内容
export function loadCommonKnowledge(): string {
  const saved = localStorage.getItem('sts-battle-common-knowledge');
  return saved || DEFAULT_COMMON_KNOWLEDGE;
}

// 保存常识内容到 localStorage
export function saveCommonKnowledge(value: string): void {
  localStorage.setItem('sts-battle-common-knowledge', value);
}
