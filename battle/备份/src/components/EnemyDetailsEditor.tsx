import { useState, useEffect } from 'react';
import type { Enemy, EnemyDetails } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Info } from 'lucide-react';

interface EnemyDetailsEditorProps {
  enemy: Enemy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (enemyId: string, details: EnemyDetails) => void;
}

export function EnemyDetailsEditor({ 
  enemy, 
  open, 
  onOpenChange, 
  onSave 
}: EnemyDetailsEditorProps) {
  const [details, setDetails] = useState<EnemyDetails>({
    description: '',
    behavior: '',
    specialMechanics: '',
    recommendedStrategy: '',
  });

  useEffect(() => {
    if (enemy) {
      setDetails(enemy.details);
    }
  }, [enemy]);

  if (!enemy) return null;

  const handleSave = () => {
    onSave(enemy.id, details);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            {enemy.name} - 详细信息
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-4">
            {/* 怪物描述 */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                怪物描述
              </Label>
              <Textarea
                placeholder="描述这个怪物的外观、特点等..."
                value={details.description}
                onChange={(e) => setDetails(prev => ({ ...prev, description: e.target.value }))}
                className="min-h-[80px] bg-gray-900 border-gray-700"
              />
            </div>

            {/* 行为模式 */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                行为模式
              </Label>
              <Textarea
                placeholder="描述怪物的攻击模式、意图规律等...&#10;例如：第1回合总是攻击，第2回合防御..."
                value={details.behavior}
                onChange={(e) => setDetails(prev => ({ ...prev, behavior: e.target.value }))}
                className="min-h-[100px] bg-gray-900 border-gray-700"
              />
            </div>

            {/* 特殊机制 */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <span className="text-lg">⚙️</span>
                特殊机制
              </Label>
              <Textarea
                placeholder="描述怪物的特殊能力、Buff/Debuff效果等...&#10;例如：生命值低于50%时会分裂..."
                value={details.specialMechanics}
                onChange={(e) => setDetails(prev => ({ ...prev, specialMechanics: e.target.value }))}
                className="min-h-[100px] bg-gray-900 border-gray-700"
              />
            </div>

            {/* 推荐策略 */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                推荐策略
              </Label>
              <Textarea
                placeholder="描述应对这个怪物的策略建议...&#10;例如：优先使用高伤害牌快速击杀..."
                value={details.recommendedStrategy}
                onChange={(e) => setDetails(prev => ({ ...prev, recommendedStrategy: e.target.value }))}
                className="min-h-[100px] bg-gray-900 border-gray-700"
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 怪物信息查看弹窗
interface EnemyInfoViewerProps {
  enemy: Enemy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnemyInfoViewer({ enemy, open, onOpenChange }: EnemyInfoViewerProps) {
  if (!enemy) return null;

  const hasDetails = enemy.details.description || 
                     enemy.details.behavior || 
                     enemy.details.specialMechanics || 
                     enemy.details.recommendedStrategy;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">
              {enemy.type === 'boss' ? '👹' : enemy.type === 'elite' ? '💀' : '👾'}
            </span>
            {enemy.name}
            <span className="text-sm text-gray-400">
              ({enemy.type === 'boss' ? 'Boss' : enemy.type === 'elite' ? '精英' : '普通'})
            </span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-4">
            {!hasDetails ? (
              <div className="text-center text-gray-500 py-8">
                暂无详细信息，点击怪物进行编辑
              </div>
            ) : (
              <>
                {enemy.details.description && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-blue-400 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      怪物描述
                    </h4>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-900/50 p-3 rounded">
                      {enemy.details.description}
                    </p>
                  </div>
                )}

                {enemy.details.behavior && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-green-400 flex items-center gap-2">
                      <span>🎯</span>
                      行为模式
                    </h4>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-900/50 p-3 rounded">
                      {enemy.details.behavior}
                    </p>
                  </div>
                )}

                {enemy.details.specialMechanics && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-yellow-400 flex items-center gap-2">
                      <span>⚙️</span>
                      特殊机制
                    </h4>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-900/50 p-3 rounded">
                      {enemy.details.specialMechanics}
                    </p>
                  </div>
                )}

                {enemy.details.recommendedStrategy && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-purple-400 flex items-center gap-2">
                      <span>💡</span>
                      推荐策略
                    </h4>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-900/50 p-3 rounded">
                      {enemy.details.recommendedStrategy}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
