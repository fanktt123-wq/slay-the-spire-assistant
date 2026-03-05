# 杀戮尖塔2 自动识别方案

## 核心思路：图像模板匹配

不是识别文字，而是**对比图片** - 预先截取所有卡牌的模板，然后在截图中查找匹配。

```
预存模板                    游戏截图
+--------+                 +------------------+
|Strike  |                 |  [Strike] [Defend] |
|  图片  |    对比匹配      |                   |
+--------+  ============>  +------------------+
```

## 优势

| 特性 | OCR | 图像匹配 |
|------|-----|----------|
| 准确性 | 70-80% | 95%+ |
| 语言依赖 | 需要中文/英文训练 | 无关语言 |
| 卡牌改名 | 需要重新训练 | 不受影响 |
| 实现难度 | 中等 | 中等 |

## 系统架构

```
游戏画面 → 截图 → 区域检测 → 模板匹配 → 输出数据
                ↓
           预存卡牌模板库
           (200+张卡牌图片)
```

## 实现步骤

### 1. 卡牌模板库建设

首次使用时，需要"教"系统识别卡牌：

```javascript
// 用户手动截图每张卡牌，建立模板库
const templates = {
  'strike': await loadImage('templates/strike.png'),
  'defend': await loadImage('templates/defend.png'),
  // ... 所有卡牌
};
```

### 2. 截图监控

```javascript
// 监听截图文件夹（Steam F12截图）
import chokidar from 'chokidar';

chokidar.watch('C:/Users/.../Screenshots/*.png')
  .on('add', path => analyzeScreenshot(path));
```

### 3. 区域配置工具

让用户在游戏上画框，标定各区域位置：

```javascript
// 配置界面：半透明的覆盖层
const regions = {
  hand: { x: 100, y: 800, w: 1720, h: 200 },      // 手牌区
  enemies: { x: 400, y: 100, w: 1120, h: 400 },   // 敌人区
  player: { x: 50, y: 600, w: 300, h: 200 },      // 玩家状态
  relics: { x: 50, y: 300, w: 200, h: 200 },      // 遗物栏
};
```

### 4. 手牌识别算法

```javascript
async function recognizeHand(screenshot, templates) {
  const handRegion = crop(screenshot, regions.hand);
  const cards = [];
  
  // 在手牌区滑动窗口，寻找卡牌
  for (let x = 0; x < handRegion.width; x += 20) {
    for (const [name, template] of Object.entries(templates)) {
      const match = await compareImages(handRegion, template, x);
      if (match.similarity > 0.85) {
        cards.push({ name, x, confidence: match.similarity });
      }
    }
  }
  
  return cards;
}
```

## 关键技术

### OpenCV.js 图像匹配

```javascript
// 使用模板匹配算法
const result = cv.matchTemplate(
  screenshot,    // 大图
  cardTemplate,  // 小图（卡牌模板）
  cv.TM_CCOEFF_NORMED  // 归一化相关系数
);

// 获取匹配度最高的位置
const minMax = cv.minMaxLoc(result);
const confidence = minMax.maxVal;  // 0-1，越接近1越匹配
```

### 多分辨率适配

```javascript
// 支持不同分辨率
const RESOLUTIONS = {
  '1080p': { width: 1920, height: 1080, cardWidth: 140 },
  '1440p': { width: 2560, height: 1440, cardWidth: 187 },
  '4k':    { width: 3840, height: 2160, cardWidth: 280 },
};

// 根据截图尺寸自动缩放坐标
function scaleCoords(coords, sourceRes, targetRes) {
  return {
    x: coords.x * (targetRes.width / sourceRes.width),
    y: coords.y * (targetRes.height / sourceRes.height),
  };
}
```

## 用户操作流程

### 首次使用（5分钟配置）

1. **区域标定**
   - 打开配置工具
   - 截图一张游戏画面
   - 在图上画框标定：手牌区、敌人区、玩家区

2. **卡牌录入**
   - 遇到新卡牌时，按热键截图
   - 框选卡牌区域
   - 输入卡牌名称
   - 系统自动保存模板

### 日常使用

1. 游戏中按 **F12** 截图
2. 助手自动识别并更新数据
3. 如果识别有误，手动修正一次，系统学习

## 替代方案：像素特征

更简单的方法 - 不存整张图片，只存关键像素特征：

```javascript
// 提取卡牌左上角的费用图标作为特征
const features = {
  'strike-1': extractFeatures(cardImage, { x: 10, y: 10, w: 30, h: 30 }),
};

// 对比时只比较特征区域，速度更快
```

## 你需要我现在实现吗？

我可以先做：

1. **配置工具** - 让用户标定区域、录入卡牌模板
2. **识别引擎** - 截图监控+模板匹配
3. **数据同步** - 识别结果自动导入到战斗页面

还是你想先等等，看《杀戮尖塔2》发售后有没有其他方案？
