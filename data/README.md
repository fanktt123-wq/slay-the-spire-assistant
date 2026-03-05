# 数据目录

本目录包含杀戮尖塔的游戏数据。

## 文件说明

- `cards.json` - 卡牌数据
- `relics.json` - 遗物数据
- `enemies.json` - 敌人数据
- `buffs.json` - Buff/Debuff 数据
- `potions.json` - 药水数据
- `concepts.json` - 概念/术语解释数据
- `game-knowledge.md` - 游戏知识库

## 数据管理

推荐使用 **数据管理界面**: http://localhost:3000/admin

功能：
- 查看和编辑所有数据
- 批量导入/导出 JSON
- 数据验证

## 数据验证

```bash
cd scripts
python validate_data.py
```

## 数据处理

如需从 API 原始数据重新处理：

```bash
cd scripts
python process_api_data.py
```

## 注意事项

- 数据在启动时自动加载到数据库
- 修改 JSON 后需要重启后端服务
- 游戏内容版权归 Mega Crit Games 所有
