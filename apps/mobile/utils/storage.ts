import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalculationHistory } from '../types/history';

const STORAGE_KEYS = {
  CALCULATION_HISTORY: '@scaffai_calculation_history',
  USER_PREFERENCES: '@scaffai_user_preferences',
} as const;

export class HistoryStorage {
  static async getHistory(): Promise<CalculationHistory[]> {
    try {
      const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.CALCULATION_HISTORY);
      if (!historyJson) return [];
      
      const history = JSON.parse(historyJson) as CalculationHistory[];
      // 日付順でソート（新しい順）
      return history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to load calculation history:', error);
      return [];
    }
  }

  static async saveCalculation(calculation: CalculationHistory): Promise<void> {
    try {
      const existingHistory = await this.getHistory();
      const updatedHistory = [calculation, ...existingHistory];
      
      // 最大100件まで保持
      const limitedHistory = updatedHistory.slice(0, 100);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.CALCULATION_HISTORY,
        JSON.stringify(limitedHistory)
      );
    } catch (error) {
      console.error('Failed to save calculation:', error);
      throw error;
    }
  }

  static async deleteCalculation(id: string): Promise<void> {
    try {
      const existingHistory = await this.getHistory();
      const filteredHistory = existingHistory.filter(item => item.id !== id);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.CALCULATION_HISTORY,
        JSON.stringify(filteredHistory)
      );
    } catch (error) {
      console.error('Failed to delete calculation:', error);
      throw error;
    }
  }

  static async clearAllHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CALCULATION_HISTORY);
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