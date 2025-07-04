# RevenueCat課金機能 - 依存関係とセットアップ手順

## 📦 依存関係

### 既存の依存関係
現在のプロジェクトには以下の依存関係が既にインストールされています：

```json
{
  "dependencies": {
    "react-native-purchases": "^8.11.5",
    "@react-native-async-storage/async-storage": "^2.1.2",
    "expo": "~53.0.10",
    "react-native": "0.79.3"
  }
}
```

### 追加が必要な依存関係
本格的な課金機能を実装するために、以下の依存関係を追加する必要があります：

```bash
# 環境変数管理
npm install react-native-dotenv

# 暗号化とセキュリティ
npm install react-native-keychain

# 分析とトラッキング（オプション）
npm install @segment/analytics-react-native

# 開発・テスト用
npm install --save-dev jest
npm install --save-dev @testing-library/react-native
```

## 🔧 セットアップ手順

### 1. 環境変数の設定

#### 1.1 .env ファイル作成
```bash
# apps/mobile/.env.development
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=your_development_ios_key
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=your_development_android_key
EXPO_PUBLIC_REVENUECAT_ENVIRONMENT=development

# apps/mobile/.env.production
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=your_production_ios_key
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=your_production_android_key
EXPO_PUBLIC_REVENUECAT_ENVIRONMENT=production
```

#### 1.2 環境変数設定ファイル
```typescript
// apps/mobile/constants/env.ts
export const ENV = {
  REVENUECAT_IOS_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '',
  REVENUECAT_ANDROID_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || '',
  REVENUECAT_ENVIRONMENT: process.env.EXPO_PUBLIC_REVENUECAT_ENVIRONMENT || 'development',
  IS_DEVELOPMENT: process.env.EXPO_PUBLIC_REVENUECAT_ENVIRONMENT === 'development'
};
```

### 2. TypeScript型定義の追加

#### 2.1 RevenueCat型定義
```typescript
// apps/mobile/types/purchases.ts
export interface PurchasesOffering {
  identifier: string;
  serverDescription: string;
  availablePackages: PurchasesPackage[];
  metadata: Record<string, any>;
}

export interface PurchasesPackage {
  identifier: string;
  packageType: string;
  product: PurchasesProduct;
  offeringIdentifier: string;
}

export interface PurchasesProduct {
  identifier: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
  currencyCode: string;
  subscriptionPeriod?: string;
  introPrice?: PurchasesIntroPrice;
}

export interface PurchasesIntroPrice {
  price: number;
  priceString: string;
  period: string;
  cycles: number;
  periodUnit: string;
}

export interface CustomerInfo {
  originalAppUserId: string;
  allPurchaseDatesMillis: Record<string, number>;
  allExpirationDatesMillis: Record<string, number>;
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  nonSubscriptionTransactions: PurchasesTransaction[];
  firstSeenMillis: number;
  originalPurchaseDateMillis: number;
  requestDateMillis: number;
  latestExpirationDateMillis: number;
  originalApplicationVersion: string;
  managementURL: string;
  entitlements: PurchasesEntitlementInfos;
}

export interface PurchasesEntitlementInfos {
  active: Record<string, PurchasesEntitlementInfo>;
  all: Record<string, PurchasesEntitlementInfo>;
}

export interface PurchasesEntitlementInfo {
  identifier: string;
  isActive: boolean;
  willRenew: boolean;
  latestPurchaseDateMillis: number;
  originalPurchaseDateMillis: number;
  expirationDateMillis: number;
  store: string;
  productIdentifier: string;
  isSandbox: boolean;
  unsubscribeDetectedAtMillis: number;
  billingIssueDetectedAtMillis: number;
}

export interface PurchasesTransaction {
  transactionIdentifier: string;
  productIdentifier: string;
  purchaseDateMillis: number;
}

export interface PurchasesError {
  code: string;
  message: string;
  underlyingErrorMessage?: string;
}
```

### 3. 設定ファイルの更新

#### 3.1 RevenueCat設定
```typescript
// apps/mobile/constants/revenueCatConfig.ts
import { Platform } from 'react-native';
import { ENV } from './env';

export const REVENUECAT_CONFIG = {
  apiKey: {
    ios: ENV.REVENUECAT_IOS_API_KEY,
    android: ENV.REVENUECAT_ANDROID_API_KEY
  },
  enableSandbox: ENV.IS_DEVELOPMENT,
  enableDebugLogs: ENV.IS_DEVELOPMENT,
  usesStoreKit2IfAvailable: true,
  dangerouslyUseLogHandler: ENV.IS_DEVELOPMENT,
  entitlementVerificationMode: ENV.IS_DEVELOPMENT ? 'disabled' : 'informational'
};

export const getApiKey = () => {
  return Platform.OS === 'ios' 
    ? REVENUECAT_CONFIG.apiKey.ios 
    : REVENUECAT_CONFIG.apiKey.android;
};

export const isConfigured = () => {
  const apiKey = getApiKey();
  return apiKey && apiKey.length > 0;
};
```

#### 3.2 エラーハンドリング設定
```typescript
// apps/mobile/utils/purchaseErrors.ts
export const PURCHASE_ERROR_CODES = {
  PURCHASE_CANCELLED: 'PURCHASE_CANCELLED',
  PURCHASE_NOT_ALLOWED: 'PURCHASE_NOT_ALLOWED',
  PURCHASE_INVALID: 'PURCHASE_INVALID',
  PRODUCT_NOT_AVAILABLE: 'PRODUCT_NOT_AVAILABLE',
  PRODUCT_ALREADY_PURCHASED: 'PRODUCT_ALREADY_PURCHASED',
  RECEIPT_ALREADY_IN_USE: 'RECEIPT_ALREADY_IN_USE',
  INVALID_RECEIPT: 'INVALID_RECEIPT',
  MISSING_RECEIPT_FILE: 'MISSING_RECEIPT_FILE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNEXPECTED_BACKEND_RESPONSE: 'UNEXPECTED_BACKEND_RESPONSE',
  INVALID_APP_USER_ID: 'INVALID_APP_USER_ID',
  OPERATION_ALREADY_IN_PROGRESS: 'OPERATION_ALREADY_IN_PROGRESS',
  UNKNOWN_BACKEND_ERROR: 'UNKNOWN_BACKEND_ERROR'
} as const;

export const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case PURCHASE_ERROR_CODES.PURCHASE_CANCELLED:
      return '購入がキャンセルされました。';
    case PURCHASE_ERROR_CODES.PURCHASE_NOT_ALLOWED:
      return 'この端末では購入が許可されていません。';
    case PURCHASE_ERROR_CODES.PRODUCT_NOT_AVAILABLE:
      return '商品が利用できません。しばらくしてから再試行してください。';
    case PURCHASE_ERROR_CODES.NETWORK_ERROR:
      return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
    case PURCHASE_ERROR_CODES.INVALID_RECEIPT:
      return 'レシートが無効です。購入履歴を確認してください。';
    case PURCHASE_ERROR_CODES.OPERATION_ALREADY_IN_PROGRESS:
      return '購入処理が既に進行中です。しばらくお待ちください。';
    default:
      return '購入処理中にエラーが発生しました。';
  }
};
```

### 4. プラットフォーム固有の設定

#### 4.1 iOS設定 (Info.plist)
```xml
<!-- apps/mobile/ios/ScaffAIMobile/Info.plist -->
<dict>
  <!-- 既存の設定 -->
  
  <!-- RevenueCat設定 -->
  <key>NSAppTransportSecurity</key>
  <dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
  </dict>
  
  <!-- StoreKit設定 -->
  <key>SKStoreProductParameterCampaignToken</key>
  <string>your_campaign_token</string>
</dict>
```

#### 4.2 Android設定 (AndroidManifest.xml)
```xml
<!-- apps/mobile/android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <!-- 既存の設定 -->
  
  <!-- RevenueCat設定 -->
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
  <uses-permission android:name="com.android.vending.BILLING" />
  
  <application>
    <!-- 既存の設定 -->
    
    <!-- Google Play Billing設定 -->
    <service
      android:name="com.revenuecat.purchases.PurchasesService"
      android:exported="false" />
  </application>
</manifest>
```

### 5. テスト環境の設定

#### 5.1 テスト用設定ファイル
```typescript
// apps/mobile/constants/testConfig.ts
export const TEST_CONFIG = {
  // テストユーザーID
  testUserIds: [
    'test_user_1',
    'test_user_2',
    'test_user_3'
  ],
  
  // テスト用プロダクトID
  testProductIds: [
    'test_scaffai_plus_monthly',
    'test_scaffai_pro_monthly',
    'test_scaffai_max_monthly'
  ],
  
  // サンドボックス設定
  sandbox: {
    enabled: true,
    forceFinishTransactions: true,
    simulateAskToBuyInSandbox: true
  }
};
```

#### 5.2 テスト用ヘルパー関数
```typescript
// apps/mobile/utils/testHelpers.ts
import { TEST_CONFIG } from '../constants/testConfig';

export const isTestMode = () => {
  return __DEV__ || TEST_CONFIG.sandbox.enabled;
};

export const getTestUserId = () => {
  if (isTestMode()) {
    return TEST_CONFIG.testUserIds[0];
  }
  return null;
};

export const getTestProductId = (planType: string) => {
  if (isTestMode()) {
    switch (planType) {
      case 'plus':
        return TEST_CONFIG.testProductIds[0];
      case 'pro':
        return TEST_CONFIG.testProductIds[1];
      case 'max':
        return TEST_CONFIG.testProductIds[2];
      default:
        return TEST_CONFIG.testProductIds[0];
    }
  }
  return null;
};
```

### 6. 分析とログ設定

#### 6.1 ログ設定
```typescript
// apps/mobile/utils/logger.ts
import { ENV } from '../constants/env';

export const Logger = {
  info: (message: string, data?: any) => {
    if (ENV.IS_DEVELOPMENT) {
      console.log(`[INFO] ${message}`, data);
    }
  },
  
  warn: (message: string, data?: any) => {
    if (ENV.IS_DEVELOPMENT) {
      console.warn(`[WARN] ${message}`, data);
    }
  },
  
  error: (message: string, error?: any) => {
    if (ENV.IS_DEVELOPMENT) {
      console.error(`[ERROR] ${message}`, error);
    }
    // 本番環境では分析サービスに送信
  },
  
  purchase: (event: string, data?: any) => {
    console.log(`[PURCHASE] ${event}`, data);
    // 分析サービスに送信
  }
};
```

#### 6.2 分析イベント設定
```typescript
// apps/mobile/utils/analytics.ts
export const ANALYTICS_EVENTS = {
  PURCHASE_STARTED: 'purchase_started',
  PURCHASE_COMPLETED: 'purchase_completed',
  PURCHASE_FAILED: 'purchase_failed',
  PURCHASE_CANCELLED: 'purchase_cancelled',
  PURCHASE_RESTORED: 'purchase_restored',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  PLAN_UPGRADED: 'plan_upgraded',
  PLAN_DOWNGRADED: 'plan_downgraded'
} as const;

export const trackPurchaseEvent = (
  event: keyof typeof ANALYTICS_EVENTS,
  data: Record<string, any>
) => {
  Logger.purchase(event, data);
  // 分析サービスに送信する処理
};
```

### 7. セキュリティ設定

#### 7.1 API キーの保護
```typescript
// apps/mobile/utils/security.ts
import * as Keychain from 'react-native-keychain';

export const SecureStorage = {
  async storeApiKey(key: string, value: string) {
    try {
      await Keychain.setInternetCredentials(key, key, value);
    } catch (error) {
      Logger.error('Failed to store API key', error);
    }
  },
  
  async getApiKey(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(key);
      if (credentials) {
        return credentials.password;
      }
    } catch (error) {
      Logger.error('Failed to retrieve API key', error);
    }
    return null;
  },
  
  async removeApiKey(key: string) {
    try {
      await Keychain.resetInternetCredentials(key);
    } catch (error) {
      Logger.error('Failed to remove API key', error);
    }
  }
};
```

#### 7.2 レシート検証
```typescript
// apps/mobile/utils/receiptValidation.ts
export const validateReceipt = async (
  receipt: string,
  productId: string
): Promise<boolean> => {
  try {
    // サーバーサイドでレシート検証を実装
    const response = await fetch('/api/validate-receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receipt,
        productId
      })
    });
    
    const result = await response.json();
    return result.isValid;
  } catch (error) {
    Logger.error('Receipt validation failed', error);
    return false;
  }
};
```

## 🚀 導入手順

### 1. 依存関係のインストール
```bash
cd apps/mobile
npm install react-native-dotenv react-native-keychain
```

### 2. 環境変数の設定
```bash
# .env.development ファイルを作成
# RevenueCat Dashboard からAPIキーを取得
# 環境変数を設定
```

### 3. 設定ファイルの更新
```bash
# 上記の設定ファイルを作成・更新
# 型定義ファイルを追加
# プラットフォーム固有の設定を更新
```

### 4. テストの実行
```bash
# 開発環境でテスト
npm run dev

# テスト用アカウントで購入フローをテスト
```

### 5. 本番環境への移行
```bash
# 本番用APIキーを設定
# App Store Connect / Play Console での設定
# 審査提出
```

## 📋 チェックリスト

### 開発環境
- [ ] 依存関係のインストール完了
- [ ] 環境変数の設定完了
- [ ] 設定ファイルの作成完了
- [ ] 型定義の追加完了
- [ ] テスト環境の設定完了

### 本番環境
- [ ] 本番用APIキーの設定完了
- [ ] セキュリティ設定の実装完了
- [ ] レシート検証の実装完了
- [ ] 分析・ログ設定の実装完了
- [ ] エラーハンドリングの実装完了

---

*この設定を完了することで、RevenueCat課金機能を安全かつ効率的に実装できます。*