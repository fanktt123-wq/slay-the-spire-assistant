#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
直接使用API数据，不合并本地化
"""
import json
import sys
import io
from pathlib import Path

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

DATA_DIR = Path(r"C:\Users\83851\slay-the-spire-assistant\data")

COLOR_TO_CHARACTER = {
    "Red": "ironclad",
    "Green": "silent",
    "Blue": "defect",
    "Purple": "watcher",
    "Colorless": "colorless",
    "Curse": "curse"
}

RARITY_MAP = {
    "Basic": "基础",
    "Common": "普通",
    "Uncommon": "罕见",
    "Rare": "稀有",
    "Special": "特殊",
    "Curse": "诅咒"
}

TYPE_MAP = {
    "Attack": "攻击",
    "Skill": "技能",
    "Power": "能力",
    "Status": "状态",
    "Curse": "诅咒"
}

def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(data, filepath):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def process_cards():
    print("正在处理卡牌数据...")

    items_data = load_json(DATA_DIR / "items_raw.json")
    cards_raw = items_data["cards"]

    cards_by_character = {
        "ironclad": [],
        "silent": [],
        "defect": [],
        "watcher": [],
        "colorless": [],
        "curse": []
    }

    for card in cards_raw:
        name = card["name"]
        character = COLOR_TO_CHARACTER.get(card["color"], "colorless")

        # 判断是否是升级版
        is_upgraded = name.endswith("+")
        base_name = name[:-1] if is_upgraded else name

        # 生成ID
        card_id = base_name.lower().replace(" ", "_").replace("-", "_")
        if is_upgraded:
            card_id += "_upgraded"

        # 构建卡牌对象
        card_obj = {
            "id": card_id,
            "name": name,  # 保留原始名称（包括+号）
            "nameEn": name,
            "cost": int(card["cost"]) if card["cost"].isdigit() else -1,
            "type": TYPE_MAP.get(card["type"], card["type"]),
            "typeEn": card["type"],
            "rarity": RARITY_MAP.get(card["rarity"], card["rarity"]),
            "rarityEn": card["rarity"],
            "description": card["description"],
            "upgraded": is_upgraded
        }

        cards_by_character[character].append(card_obj)

    save_json(cards_by_character, DATA_DIR / "cards.json")
    print(f"✓ 卡牌数据已保存")

    for char, cards in cards_by_character.items():
        if cards:
            print(f"  {char}: {len(cards)} 张卡牌")

def process_relics():
    print("\n正在处理遗物数据...")

    items_data = load_json(DATA_DIR / "items_raw.json")
    relics_raw = items_data["relics"]

    relics_by_tier = {
        "starter": [],
        "common": [],
        "uncommon": [],
        "rare": [],
        "boss": [],
        "event": [],
        "shop": []
    }

    for relic in relics_raw:
        name = relic["name"]
        tier = relic["tier"].lower()

        relic_obj = {
            "id": name.lower().replace(" ", "_").replace("-", "_").replace("'", ""),
            "name": name,
            "nameEn": name,
            "rarity": relic["tier"],
            "description": relic["description"],
            "flavor": ""
        }

        # 添加角色信息（如果是起始遗物）
        if tier == "starter":
            pool = relic.get("pool", "")
            if pool:
                relic_obj["character"] = COLOR_TO_CHARACTER.get(pool, "")

        if tier in relics_by_tier:
            relics_by_tier[tier].append(relic_obj)
        else:
            relics_by_tier["common"].append(relic_obj)

    save_json(relics_by_tier, DATA_DIR / "relics.json")
    print(f"✓ 遗物数据已保存")

    for tier, relics in relics_by_tier.items():
        if relics:
            print(f"  {tier}: {len(relics)} 个遗物")

def main():
    print("=" * 60)
    print("杀戮尖塔数据处理工具（使用API数据）")
    print("=" * 60)

    try:
        process_cards()
        process_relics()
        print("\n✓ 所有数据处理完成！")
        print("\n注意：此数据使用英文原文，升级版卡牌作为独立卡牌存在")
    except Exception as e:
        print(f"\n✗ 错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
