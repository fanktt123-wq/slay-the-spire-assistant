# OCR 自动识别方案

## 原理

1. **截图** - 用户按 F12 或其他键截图
2. **区域划分** - 根据游戏 UI 布局，将屏幕划分为不同区域
3. **文字识别** - 对每个区域进行 OCR
4. **数据映射** - 将识别结果映射到游戏数据结构

## 游戏画面区域划分（1920x1080 分辨率）

```
+--------------------------------------------------+
|  敌人1 (左上)   |   敌人2 (中上)   |  敌人3 (右上) |
|  600,100       |   960,100       |  1320,100    |
|  宽:300        |   宽:300        |  宽:300      |
+--------------------------------------------------+
|                                                  |
|                                                  |
|              角色状态 (左下)                      |
|              100, 800                           |
+--------------------------------------------------+
|  手牌区域 (底部)                                  |
|  Y: 900-1000                                    |
|  每张卡牌宽度约 150px                            |
+--------------------------------------------------+
```

## 具体区域坐标（需要根据实际游戏调整）

| 区域 | 坐标 (x, y) | 尺寸 (w, h) | 说明 |
|------|-------------|-------------|------|
| 手牌1 | 400, 920 | 140, 200 | 从左到右 |
| 手牌2 | 560, 920 | 140, 200 | |
| 手牌3 | 720, 920 | 140, 200 | |
| 手牌4 | 880, 920 | 140, 200 | |
| 手牌5 | 1040, 920 | 140, 200 | |
| 敌人1 HP | 600, 150 | 200, 50 | 敌人血条 |
| 敌人1 意图 | 600, 200 | 200, 50 | 攻击/防御 |
| 角色 HP | 100, 850 | 150, 40 | |
| 角色能量 | 100, 900 | 100, 40 | |
| 遗物栏 | 50, 700 | 200, 100 | 左侧遗物 |

## 实现步骤

### 1. 安装依赖

```bash
cd mod-bridge
npm install tesseract.js sharp
```

### 2. 区域识别脚本

```javascript
import Tesseract from 'tesseract.js';
import sharp from 'sharp';

// 定义识别区域
const REGIONS = {
  hand: [
    { name: 'card1', x: 400, y: 920, w: 140, h: 200 },
    { name: 'card2', x: 560, y: 920, w: 140, h: 200 },
    { name: 'card3', x: 720, y: 920, w: 140, h: 200 },
    { name: 'card4', x: 880, y: 920, w: 140, h: 200 },
    { name: 'card5', x: 1040, y: 920, w: 140, h: 200 },
  ],
  enemies: [
    { name: 'enemy1', x: 600, y: 100, w: 300, h: 400 },
    { name: 'enemy2', x: 960, y: 100, w: 300, h: 400 },
    { name: 'enemy3', x: 1320, y: 100, w: 300, h: 400 },
  ],
  player: { name: 'player', x: 50, y: 800, w: 300, h: 200 },
};

async function recognizeRegion(imagePath, region) {
  // 裁剪指定区域
  const buffer = await sharp(imagePath)
    .extract({ left: region.x, top: region.y, width: region.w, height: region.h })
    .toBuffer();
  
  // OCR 识别
  const result = await Tesseract.recognize(buffer, 'eng');
  return {
    region: region.name,
    text: result.data.text,
    confidence: result.data.confidence,
  };
}

async function analyzeScreenshot(imagePath) {
  const results = {
    hand: [],
    enemies: [],
    player: null,
  };
  
  // 识别手牌
  for (const card of REGIONS.hand) {
    const result = await recognizeRegion(imagePath, card);
    if (result.text.trim()) {
      results.hand.push(result);
    }
  }
  
  // 识别敌人
  for (const enemy of REGIONS.enemies) {
    const result = await recognizeRegion(imagePath, enemy);
    if (result.text.includes('HP') || result.text.includes('Intent')) {
      results.enemies.push(result);
    }
  }
  
  return results;
}
```

## 问题与局限性

### 1. 分辨率问题
- 不同分辨率下坐标不同
- 需要支持 1080p、1440p、4K 等不同分辨率

### 2. 卡牌识别难点
- 卡牌名称可能在图片中间
- 费用数字在左上角
- 描述文字较小，识别率低

### 3. 更好的方案：图像识别
不只是 OCR，可以用 **模板匹配**：
- 预先截取所有卡牌的图片
- 用 OpenCV 匹配截图中的卡牌
- 准确率比 OCR 高很多

## 推荐方案

如果只是想要快速导入，建议：

1. **简单 OCR**：只识别卡牌名称（忽略费用和描述）
2. **手动校准**：识别后显示列表，让用户确认/修改
3. **快捷键**：按 F12 截图自动导入

需要我实现这个方案吗？
