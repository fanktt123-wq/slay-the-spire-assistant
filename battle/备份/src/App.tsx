import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { BattleScene } from '@/components/BattleScene';
import { 
  CharacterConfigDialog, 
  EnemyConfigDialog, 
  HandConfigDialog,
  AddEnemyDialog,
} from '@/components/ConfigDialogs';
import { PileManagerDialog } from '@/components/CardActionsDialog';
import { EnemyDetailsEditor, EnemyInfoViewer } from '@/components/EnemyDetailsEditor';
import { AIDecisionPanel } from '@/components/AIDecisionPanel';
import { LLMPromptPanel } from '@/components/LLMPromptPanel';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

import { 
  RotateCcw, 
  Save, 
  Upload, 
  Brain,
  Layers,
  Package,
  Flame
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/sonner';
import type { Character, Enemy, Card, CharacterClass } from '@/types/game';

function App() {
  const {
    gameState,
    updateCharacter,
    addEnemy: addEnemyToState,
    removeEnemy,
    updateEnemy,
    updateEnemyDetails,
    setHand,
    setDrawPile,
    setDiscardPile,
    setExhaustPile,
    resetGameState,
    setFullGameState,
    addRelic,
    removeRelic,
    addPotion,
    removePotion,
    setProgress,
    setCharacterClass,
    setGold,
    setMaxPotionSlots,
    setTurn,
    moveCardFromTo,
  } = useGameState();

  const { toast } = useToast();

  // 弹窗状态
  const [characterDialogOpen, setCharacterDialogOpen] = useState(false);
  const [enemyDialogOpen, setEnemyDialogOpen] = useState(false);
  const [selectedEnemyId, setSelectedEnemyId] = useState<string | null>(null);
  const [handDialogOpen, setHandDialogOpen] = useState(false);
  const [addEnemyDialogOpen, setAddEnemyDialogOpen] = useState(false);
  const [drawPileDialogOpen, setDrawPileDialogOpen] = useState(false);
  const [discardPileDialogOpen, setDiscardPileDialogOpen] = useState(false);
  const [exhaustPileDialogOpen, setExhaustPileDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [enemyDetailsOpen, setEnemyDetailsOpen] = useState(false);
  const [enemyInfoOpen, setEnemyInfoOpen] = useState(false);

  const selectedEnemy = gameState.enemies.find(e => e.id === selectedEnemyId) || null;

  const handleSave = () => {
    const data = JSON.stringify(gameState, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sts-battle-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: '保存成功',
      description: '战斗状态已保存到文件',
    });
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setFullGameState(data);
        toast({
          title: '加载成功',
          description: '战斗状态已加载',
        });
      } catch {
        toast({
          title: '加载失败',
          description: '文件格式错误',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('确定要重置所有数据吗？')) {
      resetGameState();
      toast({
        title: '重置成功',
        description: '所有数据已重置为默认值',
      });
    }
  };

  const handleEditEnemy = (enemyId: string) => {
    setSelectedEnemyId(enemyId);
    setEnemyDialogOpen(true);
  };

  const handleViewEnemyInfo = (enemyId: string) => {
    setSelectedEnemyId(enemyId);
    setEnemyInfoOpen(true);
  };

  const handleAddEnemy = (enemy: Enemy) => {
    addEnemyToState(enemy);
    toast({
      title: '添加成功',
      description: `已添加 ${enemy.name}`,
    });
  };

  const handleUpdateEnemy = (updatedEnemy: Enemy) => {
    updateEnemy(updatedEnemy.id, updatedEnemy);
  };

  const handleDeleteEnemy = (enemyId: string) => {
    removeEnemy(enemyId);
    toast({
      title: '删除成功',
      description: '敌人已删除',
    });
  };

  const handleUpdateCharacter = (updatedCharacter: Character) => {
    updateCharacter(updatedCharacter);
  };

  const handleUpdateHand = (updatedHand: Card[]) => {
    setHand(updatedHand);
  };

  const handleChangeCharacterClass = (characterClass: CharacterClass) => {
    setCharacterClass(characterClass);
    toast({
      title: '职业切换',
      description: `已切换为 ${characterClass === 'ironclad' ? '铁甲战士' : characterClass === 'silent' ? '静默猎手' : characterClass === 'defect' ? '故障机器人' : '观者'}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* 顶部工具栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              杀戮尖塔 AI 助手
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setAiDialogOpen(true)}
              className="bg-purple-600/20 border-purple-500 hover:bg-purple-600/40"
            >
              <Brain className="w-4 h-4 mr-1" />
              AI 决策
            </Button>
            <div className="w-px h-6 bg-gray-700" />
            <Button size="sm" variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              保存
            </Button>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleLoad}
                className="hidden"
              />
              <Button size="sm" variant="outline" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-1" />
                  加载
                </span>
              </Button>
            </label>
            <Button size="sm" variant="destructive" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-1" />
              重置
            </Button>
          </div>
        </div>
      </header>

      {/* 战斗场景 */}
      <div className="pt-12 h-screen">
        <BattleScene
          gameState={gameState}
          onEditCharacter={() => setCharacterDialogOpen(true)}
          onEditEnemy={handleEditEnemy}
          onViewEnemyInfo={handleViewEnemyInfo}
          onEditHand={() => setHandDialogOpen(true)}
          onEditDrawPile={() => setDrawPileDialogOpen(true)}
          onEditDiscardPile={() => setDiscardPileDialogOpen(true)}
          onEditExhaustPile={() => setExhaustPileDialogOpen(true)}
          onAddEnemy={() => setAddEnemyDialogOpen(true)}
          onAddRelic={addRelic}
          onRemoveRelic={removeRelic}
          onAddPotion={addPotion}
          onRemovePotion={removePotion}
          onUpdateProgress={setProgress}
          onChangeCharacterClass={handleChangeCharacterClass}
          onSetGold={setGold}
          onSetMaxPotionSlots={setMaxPotionSlots}
          onSetTurn={setTurn}
          onMoveCardFromHand={(cardId, dest) => {
            moveCardFromTo(cardId, 'hand', dest);
          }}
          onRemoveCardFromHand={(cardId) => {
            setHand(gameState.deckState.hand.filter(c => c.id !== cardId));
          }}
        />
      </div>

      {/* 配置弹窗 */}
      <CharacterConfigDialog
        open={characterDialogOpen}
        onOpenChange={setCharacterDialogOpen}
        character={gameState.character}
        onUpdate={handleUpdateCharacter}
      />

      <EnemyConfigDialog
        open={enemyDialogOpen}
        onOpenChange={setEnemyDialogOpen}
        enemy={selectedEnemy}
        onUpdate={handleUpdateEnemy}
        onDelete={handleDeleteEnemy}
      />

      <HandConfigDialog
        open={handDialogOpen}
        onOpenChange={setHandDialogOpen}
        hand={gameState.deckState.hand}
        onUpdate={handleUpdateHand}
      />

      <AddEnemyDialog
        open={addEnemyDialogOpen}
        onOpenChange={setAddEnemyDialogOpen}
        onAdd={handleAddEnemy}
      />

      <PileManagerDialog
        open={drawPileDialogOpen}
        onOpenChange={setDrawPileDialogOpen}
        title="抽牌堆"
        cards={gameState.deckState.drawPile}
        icon={<Layers className="w-5 h-5" />}
        color="text-blue-400"
        pileType="draw"
        onUpdateCards={setDrawPile}
        onMoveCardTo={(cardId, dest) => {
          if (dest === 'discard') moveCardFromTo(cardId, 'draw', 'discard');
          if (dest === 'exhaust') moveCardFromTo(cardId, 'draw', 'exhaust');
        }}
      />

      <PileManagerDialog
        open={discardPileDialogOpen}
        onOpenChange={setDiscardPileDialogOpen}
        title="弃牌堆"
        cards={gameState.deckState.discardPile}
        icon={<Package className="w-5 h-5" />}
        color="text-gray-400"
        pileType="discard"
        onUpdateCards={setDiscardPile}
        onMoveCardTo={(cardId, dest) => {
          if (dest === 'draw') moveCardFromTo(cardId, 'discard', 'draw');
          if (dest === 'exhaust') moveCardFromTo(cardId, 'discard', 'exhaust');
        }}
      />

      <PileManagerDialog
        open={exhaustPileDialogOpen}
        onOpenChange={setExhaustPileDialogOpen}
        title="消耗堆"
        cards={gameState.deckState.exhaustPile}
        icon={<Flame className="w-5 h-5" />}
        color="text-orange-400"
        pileType="exhaust"
        onUpdateCards={setExhaustPile}
        onMoveCardTo={(cardId, dest) => {
          if (dest === 'draw') moveCardFromTo(cardId, 'exhaust', 'draw');
          if (dest === 'discard') moveCardFromTo(cardId, 'exhaust', 'discard');
        }}
      />

      {/* 敌人详细信息编辑器 */}
      {selectedEnemy && (
        <EnemyDetailsEditor
          enemy={selectedEnemy}
          open={enemyDetailsOpen}
          onOpenChange={setEnemyDetailsOpen}
          onSave={(enemyId, details) => {
            updateEnemyDetails(enemyId, details);
            toast({
              title: '保存成功',
              description: '怪物详细信息已更新',
            });
          }}
        />
      )}

      {/* 敌人信息查看器 */}
      {selectedEnemy && (
        <EnemyInfoViewer
          enemy={selectedEnemy}
          open={enemyInfoOpen}
          onOpenChange={setEnemyInfoOpen}
        />
      )}

      {/* AI 决策弹窗 */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              AI 战斗决策
            </DialogTitle>
          </DialogHeader>
          <AIDecisionPanel gameState={gameState} />
        </DialogContent>
      </Dialog>

      {/* LLM 提示词预览面板 - 悬浮在右下角 */}
      <div className="fixed bottom-4 right-4 z-40 w-96">
        <LLMPromptPanel gameState={gameState} />
      </div>

      <Toaster />
    </div>
  );
}

export default App;
