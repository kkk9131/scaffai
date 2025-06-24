import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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

// Storage選択
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

// ユーザープランの定義
export type UserPlan = 'free' | 'plus' | 'pro' | 'max';

export interface PlanLimits {
  calculations: number | null; // null = unlimited
  quickAllocations: number | null; // null = unlimited
  hasCalculatorFunction: boolean;
  hasCloudSync: boolean;
  hasWebAccess: boolean;
  hasCADExport: boolean;
  hasVoiceInput: boolean;
}

export interface UsageData {
  calculations: number;
  quickAllocations: number;
  monthKey: string; // 'YYYY-MM' format
  lastReset: string; // ISO date string
}

export interface UserPlanData {
  plan: UserPlan;
  subscriptionId?: string;
  expiresAt?: string; // ISO date string
  isActive: boolean;
}

// プラン別制限設定
export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free: {
    calculations: 15,
    quickAllocations: 30,
    hasCalculatorFunction: false,
    hasCloudSync: false,
    hasWebAccess: false,
    hasCADExport: false,
    hasVoiceInput: false,
  },
  plus: {
    calculations: null, // unlimited
    quickAllocations: null, // unlimited
    hasCalculatorFunction: true,
    hasCloudSync: true,
    hasWebAccess: false,
    hasCADExport: false,
    hasVoiceInput: true,
  },
  pro: {
    calculations: null, // unlimited
    quickAllocations: null, // unlimited
    hasCalculatorFunction: true,
    hasCloudSync: true,
    hasWebAccess: true,
    hasCADExport: false,
    hasVoiceInput: true,
  },
  max: {
    calculations: null, // unlimited
    quickAllocations: null, // unlimited
    hasCalculatorFunction: true,
    hasCloudSync: true,
    hasWebAccess: true,
    hasCADExport: true,
    hasVoiceInput: true,
  },
};

const STORAGE_KEYS = {
  USAGE_DATA: '@scaffai_usage_data',
  USER_PLAN: '@scaffai_user_plan',
} as const;

export class UsageManager {
  // 現在の月キーを取得
  private static getCurrentMonthKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  // 使用状況データを取得
  static async getUsageData(): Promise<UsageData> {
    try {
      const usageJson = await getStorage().getItem(STORAGE_KEYS.USAGE_DATA);
      const currentMonthKey = this.getCurrentMonthKey();
      
      if (!usageJson) {
        return {
          calculations: 0,
          quickAllocations: 0,
          monthKey: currentMonthKey,
          lastReset: new Date().toISOString(),
        };
      }

      const usage = JSON.parse(usageJson) as UsageData;
      
      // 月が変わった場合はリセット
      if (usage.monthKey !== currentMonthKey) {
        const resetUsage: UsageData = {
          calculations: 0,
          quickAllocations: 0,
          monthKey: currentMonthKey,
          lastReset: new Date().toISOString(),
        };
        await this.saveUsageData(resetUsage);
        return resetUsage;
      }

      return usage;
    } catch (error) {
      console.error('Failed to get usage data:', error);
      return {
        calculations: 0,
        quickAllocations: 0,
        monthKey: this.getCurrentMonthKey(),
        lastReset: new Date().toISOString(),
      };
    }
  }

  // 使用状況データを保存
  private static async saveUsageData(usage: UsageData): Promise<void> {
    try {
      await getStorage().setItem(STORAGE_KEYS.USAGE_DATA, JSON.stringify(usage));
    } catch (error) {
      console.error('Failed to save usage data:', error);
    }
  }

  // ユーザープランデータを取得
  static async getUserPlan(): Promise<UserPlanData> {
    try {
      const planJson = await getStorage().getItem(STORAGE_KEYS.USER_PLAN);
      
      if (!planJson) {
        return {
          plan: 'free',
          isActive: true,
        };
      }

      const planData = JSON.parse(planJson) as UserPlanData;
      
      // 期限切れチェック
      if (planData.expiresAt && new Date(planData.expiresAt) < new Date()) {
        const expiredPlan: UserPlanData = {
          plan: 'free',
          isActive: true,
        };
        await this.saveUserPlan(expiredPlan);
        return expiredPlan;
      }

      return planData;
    } catch (error) {
      console.error('Failed to get user plan:', error);
      return {
        plan: 'free',
        isActive: true,
      };
    }
  }

  // ユーザープランデータを保存
  static async saveUserPlan(planData: UserPlanData): Promise<void> {
    try {
      await getStorage().setItem(STORAGE_KEYS.USER_PLAN, JSON.stringify(planData));
    } catch (error) {
      console.error('Failed to save user plan:', error);
    }
  }

  // 計算実行回数をインクリメント
  static async incrementCalculations(): Promise<boolean> {
    try {
      const usage = await this.getUsageData();
      const planData = await this.getUserPlan();
      const limits = PLAN_LIMITS[planData.plan];

      // 制限チェック
      if (limits.calculations !== null && usage.calculations >= limits.calculations) {
        return false; // 制限に達している
      }

      // 使用回数をインクリメント
      usage.calculations += 1;
      await this.saveUsageData(usage);
      
      console.log(`📊 Calculations incremented: ${usage.calculations}/${limits.calculations || '∞'}`);
      return true;
    } catch (error) {
      console.error('Failed to increment calculations:', error);
      return false;
    }
  }

  // 簡易割付回数をインクリメント
  static async incrementQuickAllocations(): Promise<boolean> {
    try {
      const usage = await this.getUsageData();
      const planData = await this.getUserPlan();
      const limits = PLAN_LIMITS[planData.plan];

      // 制限チェック
      if (limits.quickAllocations !== null && usage.quickAllocations >= limits.quickAllocations) {
        return false; // 制限に達している
      }

      // 使用回数をインクリメント
      usage.quickAllocations += 1;
      await this.saveUsageData(usage);
      
      console.log(`📊 Quick allocations incremented: ${usage.quickAllocations}/${limits.quickAllocations || '∞'}`);
      return true;
    } catch (error) {
      console.error('Failed to increment quick allocations:', error);
      return false;
    }
  }

  // 残り使用回数を取得
  static async getRemainingUsage(): Promise<{
    calculations: number | null;
    quickAllocations: number | null;
  }> {
    try {
      const usage = await this.getUsageData();
      const planData = await this.getUserPlan();
      const limits = PLAN_LIMITS[planData.plan];

      return {
        calculations: limits.calculations !== null 
          ? Math.max(0, limits.calculations - usage.calculations)
          : null,
        quickAllocations: limits.quickAllocations !== null 
          ? Math.max(0, limits.quickAllocations - usage.quickAllocations)
          : null,
      };
    } catch (error) {
      console.error('Failed to get remaining usage:', error);
      return {
        calculations: 0,
        quickAllocations: 0,
      };
    }
  }

  // 機能が利用可能かチェック
  static async canUseFeature(feature: keyof PlanLimits): Promise<boolean> {
    try {
      const planData = await this.getUserPlan();
      const limits = PLAN_LIMITS[planData.plan];
      
      if (feature === 'calculations' || feature === 'quickAllocations') {
        const usage = await this.getUsageData();
        const limit = limits[feature] as number | null;
        
        if (limit === null) return true; // unlimited
        
        const used = feature === 'calculations' ? usage.calculations : usage.quickAllocations;
        return used < limit;
      }
      
      return limits[feature] as boolean;
    } catch (error) {
      console.error('Failed to check feature availability:', error);
      return false;
    }
  }

  // 使用状況のリセット（テスト用）
  static async resetUsage(): Promise<void> {
    try {
      const resetUsage: UsageData = {
        calculations: 0,
        quickAllocations: 0,
        monthKey: this.getCurrentMonthKey(),
        lastReset: new Date().toISOString(),
      };
      await this.saveUsageData(resetUsage);
      console.log('📊 Usage data reset');
    } catch (error) {
      console.error('Failed to reset usage:', error);
    }
  }

  // プランをアップグレード（テスト用）
  static async upgradePlan(newPlan: UserPlan, subscriptionId?: string, expiresAt?: string): Promise<void> {
    try {
      const planData: UserPlanData = {
        plan: newPlan,
        subscriptionId,
        expiresAt,
        isActive: true,
      };
      await this.saveUserPlan(planData);
      console.log(`📈 Plan upgraded to: ${newPlan}`);
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
    }
  }
}