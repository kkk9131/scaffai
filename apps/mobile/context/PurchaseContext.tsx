import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo, LOG_LEVEL } from 'react-native-purchases';
import { useScaffold } from './ScaffoldContext';
import { type UserPlan } from '../utils/usageManager';
import { REVENUECAT_CONFIG, getApiKey, isConfigured as isRevenueCatConfigured } from '../constants/revenueCatConfig';
import { OFFERING_IDS, productIdToPlan } from '../constants/revenueCatPlans';

// RevenueCat型定義は react-native-purchases からインポート

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
      console.log('🛒 [RevenueCat] Initializing SDK...');
      
      // RevenueCat SDK初期化チェック
      if (!isRevenueCatConfigured()) {
        console.log('⚠️ [RevenueCat] API key not configured, using development mode');
        setIsConfigured(false);
        await setupMockData();
        return;
      }
      
      // ログレベル設定
      if (REVENUECAT_CONFIG.enableDebugLogs) {
        await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }
      
      // RevenueCat SDK設定
      await Purchases.configure({
        apiKey: getApiKey(),
        usesStoreKit2IfAvailable: REVENUECAT_CONFIG.usesStoreKit2IfAvailable
      });
      
      console.log('✅ [RevenueCat] SDK initialized successfully');
      setIsConfigured(true);
      
      // オファリングと顧客情報を取得
      await loadOfferings();
      await loadCustomerInfo();
      
    } catch (error) {
      console.error('❌ [RevenueCat] Initialization failed:', error);
      setIsConfigured(false);
      await setupMockData();
    } finally {
      setIsLoading(false);
    }
  };
  
  // モックデータ設定（開発モード用）
  const setupMockData = async () => {
    console.log('🛒 [RevenueCat] Setting up mock data for development...');
    
    setOfferings({
      identifier: 'main_offering',
      availablePackages: [
        {
          identifier: 'scaffai_plus_monthly',
          product: {
            identifier: 'scaffai_plus_monthly',
            priceString: '¥4,980'
          }
        } as PurchasesPackage,
        {
          identifier: 'scaffai_pro_monthly',
          product: {
            identifier: 'scaffai_pro_monthly',
            priceString: '¥12,800'
          }
        } as PurchasesPackage,
        {
          identifier: 'scaffai_max_monthly',
          product: {
            identifier: 'scaffai_max_monthly',
            priceString: '¥24,800'
          }
        } as PurchasesPackage
      ]
    } as PurchasesOffering);
    
    setCustomerInfo({
      activeSubscriptions: []
    } as CustomerInfo);
  };
  
  // オファリング読み込み
  const loadOfferings = async () => {
    try {
      console.log('📦 [RevenueCat] Loading offerings...');
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current) {
        setOfferings(offerings.current);
        console.log('✅ [RevenueCat] Offerings loaded successfully');
      } else {
        console.log('⚠️ [RevenueCat] No current offering found');
      }
    } catch (error) {
      console.error('❌ [RevenueCat] Failed to load offerings:', error);
    }
  };
  
  // 顧客情報読み込み
  const loadCustomerInfo = async () => {
    try {
      console.log('👤 [RevenueCat] Loading customer info...');
      const customerInfo = await Purchases.getCustomerInfo();
      setCustomerInfo(customerInfo);
      console.log('✅ [RevenueCat] Customer info loaded successfully');
    } catch (error) {
      console.error('❌ [RevenueCat] Failed to load customer info:', error);
    }
  };


  const getActiveSubscriptionFromCustomerInfo = (info: CustomerInfo): UserPlan | null => {
    // エンタイトルメントをチェック
    const entitlements = info.entitlements.active;
    
    if (entitlements['scaffai_max_features']) return 'max';
    if (entitlements['scaffai_pro_features']) return 'pro';
    if (entitlements['scaffai_plus_features']) return 'plus';
    
    // アクティブなサブスクリプションもチェック（バックアップ）
    for (const productId of info.activeSubscriptions) {
      if (productIdToPlan[productId]) {
        return productIdToPlan[productId];
      }
    }
    
    return null; // Freeプラン
  };

  const purchasePackage = async (packageToPurchase: PurchasesPackage): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('💳 [RevenueCat] Starting purchase:', packageToPurchase.identifier);

      if (!isConfigured) {
        // 開発モードのシミュレーション
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        let newPlan: UserPlan = 'free';
        if (packageToPurchase.identifier === 'scaffai_plus_monthly') newPlan = 'plus';
        if (packageToPurchase.identifier === 'scaffai_pro_monthly') newPlan = 'pro';
        if (packageToPurchase.identifier === 'scaffai_max_monthly') newPlan = 'max';
        
        await upgradePlan(newPlan);
        
        setCustomerInfo({
          activeSubscriptions: [packageToPurchase.identifier]
        } as CustomerInfo);

        Alert.alert(
          '購入完了（開発モード）',
          `${newPlan}プランにアップグレードしました！\n\n※開発モードのため実際の課金は発生していません。`
        );
        
        return true;
      }
      
      // 実際のRevenueCat購入処理
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      // 顧客情報を更新
      setCustomerInfo(customerInfo);
      
      // アクティブなプランをチェックしてアップグレード
      const activePlan = getActiveSubscriptionFromCustomerInfo(customerInfo);
      if (activePlan) {
        await upgradePlan(activePlan);
      }
      
      console.log('✅ [RevenueCat] Purchase completed successfully');
      Alert.alert(
        '購入完了',
        `購入が正常に完了しました！`
      );
      
      return true;
    } catch (error: any) {
      console.error('❌ [RevenueCat] Purchase failed:', error);
      
      // エラーハンドリング
      let errorMessage = '購入処理中にエラーが発生しました。';
      
      if (error.code === 'PURCHASE_CANCELLED') {
        errorMessage = '購入がキャンセルされました。';
      } else if (error.code === 'PURCHASE_NOT_ALLOWED') {
        errorMessage = 'この端末では購入が許可されていません。';
      } else if (error.code === 'PRODUCT_NOT_AVAILABLE') {
        errorMessage = '商品が利用できません。しばらくしてから再試行してください。';
      }
      
      Alert.alert('購入エラー', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('🔄 [RevenueCat] Restoring purchases...');

      if (!isConfigured) {
        // 開発モードのシミュレーション
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        Alert.alert(
          '復元完了（開発モード）',
          '開発モードでは復元機能をシミュレーションしています。\n\n実際の環境では、過去の購入履歴が復元されます。'
        );
        
        return true;
      }
      
      // 実際のRevenueCat復元処理
      const customerInfo = await Purchases.restorePurchases();
      
      // 顧客情報を更新
      setCustomerInfo(customerInfo);
      
      // アクティブなプランをチェックしてアップグレード
      const activePlan = getActiveSubscriptionFromCustomerInfo(customerInfo);
      if (activePlan) {
        await upgradePlan(activePlan);
        Alert.alert(
          '復元完了',
          `${activePlan}プランが復元されました。`
        );
      } else {
        Alert.alert(
          '復元完了',
          '復元可能な購入履歴は見つかりませんでした。'
        );
      }
      
      console.log('✅ [RevenueCat] Restore completed successfully');
      return true;
    } catch (error) {
      console.error('❌ [RevenueCat] Restore failed:', error);
      Alert.alert(
        '復元エラー',
        '購入履歴の復元に失敗しました。'
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