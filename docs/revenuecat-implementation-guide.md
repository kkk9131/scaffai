# RevenueCat課金機能実装ガイド

## 📋 概要

ScaffAIアプリにRevenueCatを使用した課金機能を実装するための詳細手順書です。現在のプロジェクトには既に基本的な実装が含まれており、このガイドでは本格的な課金機能を有効にするための手順を説明します。

## 🏗️ 現在の実装状況

### 既存の実装
- ✅ RevenueCatライブラリ（react-native-purchases）がインストール済み
- ✅ PurchaseContextが実装済み（開発モードで動作中）
- ✅ プラン管理画面（plan-management.tsx）が実装済み
- ✅ プラン設定ファイル（revenueCatPlans.ts）が設定済み
- ✅ 3つのプラン（Plus、Pro、Max）が定義済み

### 現在の状態
- 🔄 開発モードで動作中（実際の課金は行われない）
- 🔄 モックデータを使用してUIテストが可能
- 🔄 PurchaseContextでシミュレーション機能が実装済み

## 🚀 実装手順

### 1. RevenueCatアカウントとプロジェクトの設定

#### 1.1 RevenueCatアカウント作成
```bash
# RevenueCat Dashboard にアクセス
https://app.revenuecat.com/
```

#### 1.2 アプリケーション登録
```yaml
App設定:
  - App Name: ScaffAI Mobile
  - Bundle ID (iOS): com.scaffai.mobile
  - Package Name (Android): com.scaffai.mobile
  - Platform: iOS + Android
```

#### 1.3 プロダクト設定
```yaml
Plus プラン:
  - Product ID: scaffai_plus_monthly
  - Display Name: ScaffAI Plus
  - Price: ¥4,980
  - Subscription Period: P1M (月額)
  - Entitlement: scaffai_plus_features

Pro プラン:
  - Product ID: scaffai_pro_monthly
  - Display Name: ScaffAI Pro
  - Price: ¥12,800
  - Subscription Period: P1M (月額)
  - Entitlement: scaffai_pro_features

Max プラン:
  - Product ID: scaffai_max_monthly
  - Display Name: ScaffAI Max
  - Price: ¥24,800
  - Subscription Period: P1M (月額)
  - Entitlement: scaffai_max_features
```

#### 1.4 オファリング設定
```yaml
Main Offering:
  - Offering ID: main_offering
  - 含まれるパッケージ: 
    - scaffai_plus_monthly
    - scaffai_pro_monthly
    - scaffai_max_monthly
```

### 2. App Store Connect設定

#### 2.1 In-App Purchase製品作成
```bash
# App Store Connect にアクセス
https://appstoreconnect.apple.com/
```

#### 2.2 製品設定
```yaml
各プランの設定:
  - Product ID: RevenueCatと同じID
  - Reference Name: プラン名
  - Price: 日本円設定
  - Subscription Group: ScaffAI Subscriptions
  - Subscription Duration: 1 Month
  - Review Information: 機能説明
```

### 3. Google Play Console設定

#### 3.1 定期購入製品作成
```bash
# Google Play Console にアクセス
https://play.google.com/console/
```

#### 3.2 製品設定
```yaml
各プランの設定:
  - Product ID: RevenueCatと同じID
  - Product Name: プラン名
  - Price: 日本円設定
  - Billing Period: 1 Month
  - Free Trial: 必要に応じて設定
```

### 4. 環境変数の設定

#### 4.1 APIキー取得
```bash
# RevenueCat Dashboard → Project Settings → API Keys
# Public API Key (iOS)
# Public API Key (Android)
```

#### 4.2 環境変数設定
```typescript
// apps/mobile/constants/config.ts
export const REVENUECAT_CONFIG = {
  apiKey: {
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || 'your_ios_api_key',
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || 'your_android_api_key'
  },
  enableSandbox: __DEV__, // 開発時はサンドボックス
  enableDebugLogs: __DEV__ // 開発時のみログ出力
};
```

### 5. PurchaseContext実装の更新

#### 5.1 実際のRevenueCat SDKの初期化
```typescript
// apps/mobile/context/PurchaseContext.tsx を更新

import Purchases from 'react-native-purchases';
import { REVENUECAT_CONFIG } from '../constants/config';

const initializePurchases = async () => {
  try {
    // 実際のRevenueCat SDKを初期化
    await Purchases.setLogLevel(
      REVENUECAT_CONFIG.enableDebugLogs ? Purchases.LOG_LEVEL.DEBUG : Purchases.LOG_LEVEL.INFO
    );
    
    if (Platform.OS === 'ios') {
      await Purchases.configure({
        apiKey: REVENUECAT_CONFIG.apiKey.ios,
        usesStoreKit2IfAvailable: true
      });
    } else {
      await Purchases.configure({
        apiKey: REVENUECAT_CONFIG.apiKey.android
      });
    }
    
    setIsConfigured(true);
    await loadOfferings();
    await loadCustomerInfo();
    
  } catch (error) {
    console.error('RevenueCat initialization failed:', error);
    setIsConfigured(false);
  }
};
```

#### 5.2 実際の購入処理実装
```typescript
const purchasePackage = async (packageToPurchase: PurchasesPackage): Promise<boolean> => {
  try {
    setIsLoading(true);
    
    // 実際の購入処理
    const { purchaserInfo } = await Purchases.purchasePackage(packageToPurchase);
    
    // アクティブなサブスクリプションをチェック
    const activePlan = getActiveSubscriptionFromCustomerInfo(purchaserInfo);
    if (activePlan) {
      await upgradePlan(activePlan);
    }
    
    setCustomerInfo(purchaserInfo);
    return true;
    
  } catch (error) {
    console.error('Purchase failed:', error);
    return false;
  } finally {
    setIsLoading(false);
  }
};
```

### 6. エラーハンドリングの実装

#### 6.1 購入エラーの処理
```typescript
const handlePurchaseError = (error: any) => {
  if (error.code === 'PURCHASE_CANCELLED') {
    Alert.alert('購入キャンセル', '購入がキャンセルされました。');
  } else if (error.code === 'PURCHASE_NOT_ALLOWED') {
    Alert.alert('購入不可', 'この端末では購入が許可されていません。');
  } else if (error.code === 'PRODUCT_NOT_AVAILABLE') {
    Alert.alert('商品不可', '商品が利用できません。しばらくしてから再試行してください。');
  } else {
    Alert.alert('購入エラー', '購入処理中にエラーが発生しました。');
  }
};
```

#### 6.2 復元処理の実装
```typescript
const restorePurchases = async (): Promise<boolean> => {
  try {
    setIsLoading(true);
    
    const customerInfo = await Purchases.restorePurchases();
    const activePlan = getActiveSubscriptionFromCustomerInfo(customerInfo);
    
    if (activePlan) {
      await upgradePlan(activePlan);
      Alert.alert('復元完了', `${activePlan}プランが復元されました。`);
    } else {
      Alert.alert('復元完了', '復元可能な購入履歴は見つかりませんでした。');
    }
    
    setCustomerInfo(customerInfo);
    return true;
    
  } catch (error) {
    console.error('Restore failed:', error);
    Alert.alert('復元エラー', '購入履歴の復元に失敗しました。');
    return false;
  } finally {
    setIsLoading(false);
  }
};
```

### 7. テストと検証

#### 7.1 サンドボックステスト
```bash
# iOS Simulator/Device でテスト
# テストアカウントを使用
# 実際の課金は発生しない

# Android Emulator/Device でテスト
# Internal testing track を使用
# テストアカウントを設定
```

#### 7.2 テストケース
```yaml
テスト項目:
  - 各プランの購入フロー
  - 購入キャンセル処理
  - 購入復元機能
  - エラーハンドリング
  - プラン変更処理
  - サブスクリプション更新
  - 解約処理
```

### 8. 本番環境への移行

#### 8.1 本番APIキーの設定
```bash
# Production API Keys を環境変数に設定
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=prod_ios_key
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=prod_android_key
```

#### 8.2 App Store/Play Store 審査
```yaml
審査準備:
  - スクリーンショット更新
  - アプリ説明文更新
  - 課金機能の説明追加
  - プライバシーポリシー更新
  - 利用規約更新
```

## 🔧 設定ファイル

### RevenueCat設定
```typescript
// apps/mobile/constants/revenueCatPlans.ts
// 既存のファイルに追加設定

export const REVENUECAT_WEBHOOK_CONFIG = {
  endpoint: 'https://your-api.com/webhooks/revenuecat',
  events: [
    'INITIAL_PURCHASE',
    'RENEWAL',
    'CANCELLATION',
    'REFUND'
  ]
};
```

### 環境別設定
```typescript
// apps/mobile/constants/config.ts
export const CONFIG = {
  development: {
    revenueCat: {
      enableSandbox: true,
      enableDebugLogs: true,
      apiKey: {
        ios: 'your_dev_ios_key',
        android: 'your_dev_android_key'
      }
    }
  },
  production: {
    revenueCat: {
      enableSandbox: false,
      enableDebugLogs: false,
      apiKey: {
        ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
        android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
      }
    }
  }
};
```

## 📊 分析とモニタリング

### RevenueCat Analytics
```yaml
追跡メトリクス:
  - 購入コンバージョン率
  - 月間売上
  - プラン別売上
  - 解約率
  - LTV（顧客生涯価値）
```

### カスタムイベント追跡
```typescript
// 購入イベントの記録
const trackPurchaseEvent = (plan: UserPlan, price: number) => {
  // Analytics service に送信
  Analytics.track('subscription_purchase', {
    plan,
    price,
    timestamp: new Date().toISOString()
  });
};
```

## 🚨 注意事項

### セキュリティ
- ✅ APIキーを環境変数で管理
- ✅ サーバーサイドでの検証を実装
- ✅ レシート検証の実装
- ✅ 不正な購入の防止

### ユーザーエクスペリエンス
- ✅ 購入フローの最適化
- ✅ エラーメッセージの日本語化
- ✅ 購入復元機能の提供
- ✅ 解約プロセスの明確化

### 法的要件
- ✅ 利用規約の更新
- ✅ プライバシーポリシーの更新
- ✅ 特定商取引法に基づく表示
- ✅ 解約・返金ポリシーの明示

## 🎯 次のステップ

1. RevenueCatアカウントの設定
2. App Store Connect/Play Consoleの設定
3. 環境変数の設定
4. 実装の更新
5. テストの実施
6. 本番環境への移行

---

*このガイドに従って実装することで、ScaffAIアプリに本格的な課金機能を追加できます。*