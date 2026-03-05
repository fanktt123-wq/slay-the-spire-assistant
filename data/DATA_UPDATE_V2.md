# 数据更新说明 v2

## 更新时间
2026-03-03

## 重要变更

### ✓ 完全使用API数据
- 不再从本地游戏文件提取中文本地化
- 全部使用 [jhcheung/slay-the-spire-api](https://github.com/jhcheung/slay-the-spire-api) 的英文数据
- 数据更准确、更完整

### ✓ 升级版卡牌独立存在
- 之前：升级版作为基础版的属性（upgradedDescription字段）
- 现在：升级版作为独立卡牌（如 "Bash" 和 "Bash+"）
- 每个角色现在有 **150张卡牌**（75张基础版 + 75张升级版）

## 数据统计

### 卡牌 (cards.json)
| 角色 | 卡牌数量 | 说明 |
|------|---------|------|
| 战士 (Ironclad) | 150 张 | 包含75张基础版 + 75张升级版 |
| 猎手 (Silent) | 150 张 | 包含75张基础版 + 75张升级版 |
| 机器人 (Defect) | 150 张 | 包含75张基础版 + 75张升级版 |
| 观者 (Watcher) | 150 张 | 包含75张基础版 + 75张升级版 |
| 无色 (Colorless) | 107 张 | 包含基础版和升级版 |
| 诅咒 (Curse) | 14 张 | 诅咒卡牌 |
| **总计** | **721 张** | |

### 遗物 (relics.json)
| 稀有度 | 遗物数量 |
|--------|---------|
| 起始 (Starter) | 4 个 |
| 普通 (Common) | 54 个 |
| 罕见 (Uncommon) | 36 个 |
| 稀有 (Rare) | 34 个 |
| Boss | 30 个 |
| 商店 (Shop) | 20 个 |
| **总计** | **178 个** |

## 数据结构

### 卡牌数据格式
```json
{
  "id": "bash",
  "name": "Bash",
  "nameEn": "Bash",
  "cost": 2,
  "type": "攻击",
  "typeEn": "Attack",
  "rarity": "基础",
  "rarityEn": "Basic",
  "description": "Deal 8 damage.\\nApply 2 Vulnerable.",
  "upgraded": false
}
```

### 升级版卡牌示例
```json
{
  "id": "bash_upgraded",
  "name": "Bash+",
  "nameEn": "Bash+",
  "cost": 2,
  "type": "攻击",
  "typeEn": "Attack",
  "rarity": "基础",
  "rarityEn": "Basic",
  "description": "Deal 10 damage.\\nApply 3 Vulnerable.",
  "upgraded": true
}
```

## 前端改进

### 新功能
1. **升级版卡牌独立显示**
   - 升级版卡牌有独特的金色背景
   - 卡牌名称带 "+" 后缀
   - 不需要手动切换升级状态

2. **简化的交互**
   - 点击牌库中的卡牌直接添加
   - 在卡组中用 +/- 调整数量
   - 移除了升级切换按钮（因为升级版是独立卡牌）

3. **完整的卡牌类别**
   - ✓ 职业卡牌（战士/猎手/机器人/观者）
   - ✓ 无色卡牌
   - ✓ 诅咒卡牌

## 如何更新数据

如果需要重新处理数据，运行：

```bash
cd C:\Users\83851\slay-the-spire-assistant\scripts
python process_api_data.py
```

然后重启后端服务器：

```bash
cd C:\Users\83851\slay-the-spire-assistant\backend
npm start
```

## 注意事项

- 所有文本使用英文原文
- 升级版卡牌作为独立卡牌存在
- 描述中的 `\\n` 表示换行符
- 费用为 -1 表示 X 费（可变费用）

## 数据来源

- **卡牌和遗物**: [jhcheung/slay-the-spire-api](https://github.com/jhcheung/slay-the-spire-api)
- **数据文件**: `db/items.json`

---

**更新时间**: 2026-03-03
**数据版本**: v2 (API数据)
**数据完整性**: ✓ 已验证
