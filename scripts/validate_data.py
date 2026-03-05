#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
验证杀戮尖塔数据的完整性和质量
"""
import json
import sys
import io
from pathlib import Path

# 设置输出编码
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DATA_DIR = Path(r"C:\Users\83851\slay-the-spire-assistant\data")

def validate_cards():
    """验证卡牌数据"""
    print("\n=== 验证卡牌数据 ===")

    with open(DATA_DIR / "cards.json", 'r', encoding='utf-8') as f:
        cards_data = json.load(f)

    total_cards = 0
    issues = []

    for character, cards in cards_data.items():
        print(f"\n{character}: {len(cards)} 张卡牌")
        total_cards += len(cards)

        # 检查每张卡牌
        for card in cards[:3]:  # 只显示前3张作为示例
            # 检查必需字段
            required_fields = ['id', 'name', 'nameEn', 'cost', 'type', 'rarity', 'description']
            missing = [f for f in required_fields if f not in card]

            if missing:
                issues.append(f"  ✗ {card.get('nameEn', 'Unknown')} 缺少字段: {missing}")
            else:
                print(f"  ✓ {card['name']} ({card['nameEn']}) - {card['type']} - {card['cost']}费")

    print(f"\n总计: {total_cards} 张卡牌")

    if issues:
        print("\n发现问题:")
        for issue in issues:
            print(issue)
    else:
        print("\n✓ 所有卡牌数据验证通过！")

def validate_relics():
    """验证遗物数据"""
    print("\n=== 验证遗物数据 ===")

    with open(DATA_DIR / "relics.json", 'r', encoding='utf-8') as f:
        relics_data = json.load(f)

    total_relics = 0
    issues = []

    for tier, relics in relics_data.items():
        if not relics:
            continue

        print(f"\n{tier}: {len(relics)} 个遗物")
        total_relics += len(relics)

        # 检查每个遗物
        for relic in relics[:3]:  # 只显示前3个作为示例
            # 检查必需字段
            required_fields = ['id', 'name', 'nameEn', 'rarity', 'description']
            missing = [f for f in required_fields if f not in relic]

            if missing:
                issues.append(f"  ✗ {relic.get('nameEn', 'Unknown')} 缺少字段: {missing}")
            else:
                print(f"  ✓ {relic['name']} ({relic['nameEn']})")

    print(f"\n总计: {total_relics} 个遗物")

    if issues:
        print("\n发现问题:")
        for issue in issues:
            print(issue)
    else:
        print("\n✓ 所有遗物数据验证通过！")

def main():
    print("=" * 60)
    print("杀戮尖塔数据验证工具")
    print("=" * 60)

    try:
        validate_cards()
        validate_relics()
        print("\n" + "=" * 60)
        print("✓ 数据验证完成！")
        print("=" * 60)
    except Exception as e:
        print(f"\n✗ 验证失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
