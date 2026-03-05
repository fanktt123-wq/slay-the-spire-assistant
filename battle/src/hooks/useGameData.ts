import { useState, useEffect, useCallback } from 'react';
import type { Card, Potion, Enemy, Relic, Buff } from '@/types/game';
import { api, checkAPIHealth, APIError } from '@/services/api';

export interface GameDataState {
  // 数据
  cards: Card[];
  potions: Potion[];
  enemies: Enemy[];
  relics: Relic[];
  buffs: Buff[];
  
  // 状态
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  
  // 操作
  refresh: () => Promise<void>;
  clearError: () => void;
}

// 空数据状态（数据库连接失败时使用）
const emptyState = {
  cards: [],
  potions: [],
  enemies: [],
  relics: [],
  buffs: [],
};

export function useGameData(): GameDataState {
  const [data, setData] = useState({
    cards: [] as Card[],
    potions: [] as Potion[],
    enemies: [] as Enemy[],
    relics: [] as Relic[],
    buffs: [] as Buff[],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 先检查API健康状态
      const healthy = await checkAPIHealth();
      if (!healthy) {
        throw new APIError('无法连接到后端服务器 (localhost:3000)，请确保后端已启动');
      }

      // 并行获取所有数据
      const [cards, potions, enemies, relics, buffs] = await Promise.all([
        api.getCards(),
        api.getPotions(),
        api.getEnemies(),
        api.getRelics(),
        api.getBuffs(),
      ]);

      setData({ cards, potions, enemies, relics, buffs });
      setIsConnected(true);
      
      // 数据加载成功但有部分为空，可能是数据库未初始化
      if (relics.length === 0 || cards.length === 0) {
        console.warn('数据库连接成功，但部分数据为空。建议重启后端服务器以重新导入数据。');
      }
    } catch (err) {
      const message = err instanceof APIError ? err.message : '获取数据失败';
      setError(message);
      setIsConnected(false);
      // 使用空数据，不使用硬编码数据
      setData(emptyState);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    ...data,
    isLoading,
    isConnected,
    error,
    refresh: fetchData,
    clearError,
  };
}

export default useGameData;
