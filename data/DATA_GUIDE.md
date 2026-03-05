# 数据扩展指南

## 概述

项目数据存储在 SQLite 数据库中，可以通过以下方式管理：
1. **数据管理界面** (推荐): http://localhost:3000/admin
2. **管理 API**: 使用 `/api/admin/*` 端点
3. **JSON 导入**: 从 JSON 文件批量导入

## 数据管理界面

访问 http://localhost:3000/admin 可以管理：
- 角色
- 卡牌
- 遗物
- Buff/Debuff
- 敌人
- 药水

## 卡牌数据格式

```json
{
  "id": "卡牌唯一ID",
  "name": "中文名称",
  "name_en": "英文名称",
  "character_id": "角色ID",
  "cost": 能量消耗,
  "type": "类型",
  "type_en": "英文类型",
  "rarity": "稀有度",
  "rarity_en": "英文稀有度",
  "description": "卡牌描述",
  "upgraded": 0,
  "meta": {}
}
```

### 角色ID
- `ironclad`: 战士
- `silent`: 猎手
- `defect`: 机器人
- `watcher`: 观者
- `colorless`: 无色
- `curse`: 诅咒

### 卡牌类型
- `Attack`: 攻击
- `Skill`: 技能
- `Power`: 能力
- `Status`: 状态
- `Curse`: 诅咒

## 遗物数据格式

```json
{
  "id": "遗物唯一ID",
  "name": "中文名称",
  "name_en": "英文名称",
  "rarity": "稀有度",
  "description": "遗物效果",
  "flavor": "风味文本",
  "character_id": "角色ID(可选)",
  "meta": {}
}
```

## 从 JSON 导入

### 步骤
1. 准备符合格式的 JSON 文件
2. 访问 http://localhost:3000/admin
3. 点击"从 JSON 导入"
4. 选择文件并上传

### 导入格式示例

**卡牌导入**:
```json
{
  "ironclad": [
    {
      "id": "strike",
      "name": "打击",
      "name_en": "Strike",
      "cost": 1,
      "type": "攻击",
      "type_en": "Attack",
      "rarity": "基础",
      "rarity_en": "Basic",
      "description": "造成 6 点伤害"
    }
  ]
}
```

## 游戏知识库

文件位置: `data/game-knowledge.md`

可以添加：
- 构筑策略
- 敌人信息
- 事件选择建议
- 遗物组合推荐

修改后需要重启后端服务生效。

## 数据来源

1. **Slay the Spire Wiki**: https://slay-the-spire.fandom.com/
2. **Steam 社区**: 游戏指南和讨论
3. **API 数据**: jhcheung/slay-the-spire-api
