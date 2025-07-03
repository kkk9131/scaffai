import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import { useScaffold } from './ScaffoldContext';
import { type UserPlan } from '../utils/usageManager';

// RevenueCat型定義（開発モード用）
interface PurchasesOffering {
  identifier: string;
  availablePackages: PurchasesPackage[];
}

interface CustomerInfo {
  activeSubscriptions: string[];
}

interface PurchasesPackage {
  identifier: string;
  product: {
    identifier: string;
    priceString: string;
  };
}

interface PurchasesError {
  code: string;
}

// RevenueCat APIキー（テスト用）
const REVENUECAT_API_KEY = {
  ios: 'your_ios_api_key', // 後で実際のキーに置き換え
  android: 'your_android_api_key', // 後で実際のキーに置き換え
};

interface PurchaseContextType {
  isConfigured: boolean;
  offerings: PurchasesOffering | null;
  customerInfo: CustomerInfo | null;
  isLoading: boolean;
  purchasePackage: (packageToPurchase: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  getActiveSubscription: () => UserPlan;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export const usePurchase = () => {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchase must be used within a PurchaseProvider');
  }
  return context;
};

interface PurchaseProviderProps {
  children: ReactNode;
}

export const PurchaseProvider: React.FC<PurchaseProviderProps> = ({ children }) => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { upgradePlan } = useScaffold();

  useEffect(() => {
    initializePurchases();
  }, []);

  const initializePurchases = async () => {
    try {
      console.log('🛒 [RevenueCat] Development mode - simulating initialization...');
      
      // 開発モードでは常にfalseに設定
      console.log('⚠️ [RevenueCat] Development mode - actual RevenueCat SDK not initialized');
      setIsConfigured(false);
      
      // 開発用のモックデータを設定
      setOfferings({
        identifier: 'main_offering',
        availablePackages: [
          {
            identifier: 'scaffai_plus_monthly',
            product: {
              identifier: 'scaffai_plus_monthly',
              priceString: '¥4,980'
            }
          },
          {
            identifier: 'scaffai_pro_monthly',
            product: {
              identifier: 'scaffai_pro_monthly',
              priceString: '¥12,800'
            }
          },
          {
            identifier: 'scaffai_max_monthly',
            product: {
              identifier: 'scaffai_max_monthly',
              priceString: '¥24,800'
            }
          }
        ]
      });
      
      setCustomerInfo({
        activeSubscriptions: []
      });
      
      console.log('✅ [RevenueCat] Development mode initialization complete');
    } catch (error) {
      console.error('❌ [RevenueCat] Development mode initialization failed:', error);
      setIsConfigured(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 開発モードでは使用しない（初期化で直接設定）
  const loadOfferings = async () => {
    console.log('📦 [RevenueCat] Development mode - using mock offerings');
  };

  const loadCustomerInfo = async () => {
    console.log('👤 [RevenueCat] Development mode - using mock customer info');
  };

  const getActiveSubscriptionFromCustomerInfo = (info: CustomerInfo): UserPlan | null => {
    // アクティブなサブスクリプションをチェック
    const activeSubscriptions = info.activeSubscriptions;
    
    if (activeSubscriptions.includes('scaffai_max')) return 'max';
    if (activeSubscriptions.includes('scaffai_pro')) return 'pro';
    if (activeSubscriptions.includes('scaffai_plus')) return 'plus';
    
    return null; // Freeプラン
  };

  const purchasePackage = async (packageToPurchase: PurchasesPackage): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('💳 [RevenueCat] Development mode - simulating purchase:', packageToPurchase.identifier);

      // 開発モードでは2秒の遅延をシミュレート
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // プランを直接更新（開発モードなので実際の購入はしない）
      let newPlan: UserPlan = 'free';
      if (packageToPurchase.identifier === 'scaffai_plus_monthly') newPlan = 'plus';
      if (packageToPurchase.identifier === 'scaffai_pro_monthly') newPlan = 'pro';
      if (packageToPurchase.identifier === 'scaffai_max_monthly') newPlan = 'max';
      
      await upgradePlan(newPlan);
      
      // モック顧客情報を更新
      setCustomerInfo({
        activeSubscriptions: [packageToPurchase.identifier]
      });

      console.log('✅ [RevenueCat] Development mode purchase simulation complete');
      Alert.alert(
        '購入完了（開発モード）',
        `${newPlan}プランにアップグレードしました！\n\n※開発モードのため実際の課金は発生していません。`
      );
      
      return true;
    } catch (error) {
      console.error('❌ [RevenueCat] Development mode purchase simulation failed:', error);
      Alert.alert(
        '購入エラー',
        '購入処理のシミュレーション中にエラーが発生しました。'
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('🔄 [RevenueCat] Development mode - simulating restore purchases...');

      // 開発モードでは1秒の遅延をシミュレート
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        '復元完了（開発モード）',
        '開発モードでは復元機能をシミュレーションしています。\n\n実際の環境では、過去の購入履歴が復元されます。'
      );

      console.log('✅ [RevenueCat] Development mode restore simulation complete');
      return true;
    } catch (error) {
      console.error('❌ [RevenueCat] Development mode restore simulation failed:', error);
      Alert.alert(
        '復元エラー',
        '購入復元のシミュレーション中にエラーが発生しました。'
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveSubscription = (): UserPlan => {
    if (!customerInfo) return 'free';
    return getActiveSubscriptionFromCustomerInfo(customerInfo) || 'free';
  };

  const value: PurchaseContextType = {
    isConfigured,
    offerings,
    customerInfo,
    isLoading,
    purchasePackage,
    restorePurchases,
    getActiveSubscription,
  };

  return (
    <PurchaseContext.Provider value={value}>
      {children}
    </PurchaseContext.Provider>
  );
};