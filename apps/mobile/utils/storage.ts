import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { CalculationHistory } from '../types/history';

// Web用のlocalStorageアダプター
const webStorage = {
  getItem: (key: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return Promise.resolve(window.localStorage.getItem(key));
      }
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
    return Promise.resolve(null);
  },
  setItem: (key: string, value: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('localStorage setItem failed:', error);
    }
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('localStorage removeItem failed:', error);
    }
    return Promise.resolve();
  },
};

// より安全なストレージ選択（遅延初期化）
let storage: any = null;

const getStorage = () => {
  if (storage) return storage;
  
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      storage = webStorage;
    } else {
      storage = AsyncStorage;
    }
  } catch (error) {
    console.warn('Storage detection failed, falling back to AsyncStorage:', error);
    storage = AsyncStorage;
  }
  
  return storage;
};

const STORAGE_KEYS = {
  CALCULATION_HISTORY: '@scaffai_calculation_history',
  USER_PREFERENCES: '@scaffai_user_preferences',
  CALCULATION_STATS: '@scaffai_calculation_stats',
} as const;

// 計算統計の型定義
export type CalculationStats = {
  totalCalculations: number;
  calculationsByMonth: { [key: string]: number }; // 'YYYY-MM' format
  lastCalculation?: string; // ISO date string
};

// 計算統計を管理するクラス
export class CalculationStatsStorage {
  static async getStats(): Promise<CalculationStats> {
    try {
      const statsJson = await getStorage().getItem(STORAGE_KEYS.CALCULATION_STATS);
      if (!statsJson) {
        return {
          totalCalculations: 0,
          calculationsByMonth: {},
        };
      }
      return JSON.parse(statsJson);
    } catch (error) {
      console.error('Failed to get calculation stats:', error);
      return {
        totalCalculations: 0,
        calculationsByMonth: {},
      };
    }
  }

  static async incrementCalculation(): Promise<void> {
    try {
      const stats = await this.getStats();
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      stats.totalCalculations += 1;
      stats.calculationsByMonth[monthKey] = (stats.calculationsByMonth[monthKey] || 0) + 1;
      stats.lastCalculation = now.toISOString();
      
      await getStorage().setItem(STORAGE_KEYS.CALCULATION_STATS, JSON.stringify(stats));
      console.log('📊 Calculation stats updated:', stats);
    } catch (error) {
      console.error('Failed to increment calculation stats:', error);
    }
  }

  static async getThisMonthCalculations(): Promise<number> {
    try {
      const stats = await this.getStats();
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return stats.calculationsByMonth[monthKey] || 0;
    } catch (error) {
      console.error('Failed to get this month calculations:', error);
      return 0;
    }
  }
}

export class HistoryStorage {
  static async getHistory(): Promise<CalculationHistory[]> {
    try {
      console.log('📥 HistoryStorage.getHistory called, key:', STORAGE_KEYS.CALCULATION_HISTORY);
      const historyJson = await getStorage().getItem(STORAGE_KEYS.CALCULATION_HISTORY);
      console.log('📦 Raw storage data:', historyJson ? 'EXISTS' : 'NULL', historyJson?.length || 0, 'chars');
      
      if (!historyJson) {
        console.log('📭 No history data found, returning empty array');
        return [];
      }
      
      const history = JSON.parse(historyJson) as CalculationHistory[];
      console.log('📋 Parsed history:', history.length, 'items');
      console.log('📋 History IDs:', history.map(item => item.id));
      
      // 日付順でソート（新しい順）
      const sorted = history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      console.log('📋 Sorted history:', sorted.length, 'items');
      return sorted;
    } catch (error) {
      console.error('Failed to load calculation history:', error);
      return [];
    }
  }

  static async saveCalculation(calculation: CalculationHistory): Promise<void> {
    try {
      console.log('💾 HistoryStorage.saveCalculation called with ID:', calculation.id);
      const existingHistory = await this.getHistory();
      console.log('📊 Existing history count:', existingHistory.length);
      
      const updatedHistory = [calculation, ...existingHistory];
      console.log('📊 Updated history count:', updatedHistory.length);
      
      // 最大100件まで保持
      const limitedHistory = updatedHistory.slice(0, 100);
      console.log('📊 Limited history count:', limitedHistory.length);
      
      console.log('💾 Saving to storage with key:', STORAGE_KEYS.CALCULATION_HISTORY);
      await getStorage().setItem(
        STORAGE_KEYS.CALCULATION_HISTORY,
        JSON.stringify(limitedHistory)
      );
      console.log('✅ Successfully saved to storage');
    } catch (error) {
      console.error('❌ Failed to save calculation:', error);
      throw error;
    }
  }

  static async deleteCalculation(id: string): Promise<void> {
    try {
      console.log('🗑️ HistoryStorage.deleteCalculation called with ID:', id, typeof id);
      const existingHistory = await this.getHistory();
      console.log('📊 Existing history before deletion:', existingHistory.length, 'items');
      
      // 全てのIDをログ出力
      console.log('📋 All existing IDs:', existingHistory.map(item => ({ id: item.id, type: typeof item.id })));
      console.log('🎯 Looking for item with ID:', id, typeof id);
      
      const targetItem = existingHistory.find(item => {
        const match = item.id === id;
        console.log(`🔍 Comparing "${item.id}" (${typeof item.id}) === "${id}" (${typeof id}): ${match}`);
        return match;
      });
      console.log('🎯 Found target item:', !!targetItem, targetItem ? targetItem.id : 'NONE');
      
      if (!targetItem) {
        console.log('❌ Target item not found! Available IDs:', existingHistory.map(item => item.id));
        throw new Error(`Item with ID "${id}" not found in history`);
      }
      
      const filteredHistory = existingHistory.filter(item => item.id !== id);
      console.log('✂️ Filtered history after deletion:', filteredHistory.length, 'items (removed:', existingHistory.length - filteredHistory.length, ')');
      
      await getStorage().setItem(
        STORAGE_KEYS.CALCULATION_HISTORY,
        JSON.stringify(filteredHistory)
      );
      
      console.log('💾 Successfully saved filtered history to storage');
    } catch (error) {
      console.error('❌ Failed to delete calculation:', error);
      throw error;
    }
  }

  static async clearAllHistory(): Promise<void> {
    try {
      await getStorage().removeItem(STORAGE_KEYS.CALCULATION_HISTORY);
    } catch (error) {
      console.error('Failed to clear history:', error);
      throw error;
    }
  }

  static generateId(): string {
    return `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static getFrameSizeText(inputData: any): string {
    const ns = inputData.frameWidth?.northSouth || 0;
    const ew = inputData.frameWidth?.eastWest || 0;
    return `${ns}×${ew}mm`;
  }
}