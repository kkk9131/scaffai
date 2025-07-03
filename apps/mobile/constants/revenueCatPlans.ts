import { type UserPlan } from '../utils/usageManager';

// RevenueCatで設定するプロダクトID
export const PRODUCT_IDS = {
  plus: 'scaffai_plus_monthly',
  pro: 'scaffai_pro_monthly', 
  max: 'scaffai_max_monthly'
} as const;

// RevenueCatで設定するオファリングID
export const OFFERING_IDS = {
  main: 'main_offering'
} as const;

// RevenueCatで設定するエンタイトルメントID（機能アクセス権）
export const ENTITLEMENT_IDS = {
  plus: 'scaffai_plus_features',
  pro: 'scaffai_pro_features',
  max: 'scaffai_max_features'
} as const;

// プランとプロダクトIDのマッピング
export const planToProductId: Record<Exclude<UserPlan, 'free'>, string> = {
  plus: PRODUCT_IDS.plus,
  pro: PRODUCT_IDS.pro,
  max: PRODUCT_IDS.max
};

// プロダクトIDとプランのマッピング
export const productIdToPlan: Record<string, UserPlan> = {
  [PRODUCT_IDS.plus]: 'plus',
  [PRODUCT_IDS.pro]: 'pro',
  [PRODUCT_IDS.max]: 'max'
};

// RevenueCat設定ガイド用のプラン詳細
export const revenueCatPlanConfig = {
  plus: {
    productId: PRODUCT_IDS.plus,
    entitlementId: ENTITLEMENT_IDS.plus,
    displayName: 'ScaffAI Plus',
    description: '現場作業を効率化する基本プラン',
    price: '¥4,980',
    period: 'P1M', // ISO 8601: 1ヶ月
    features: [
      '無制限計算・簡易割付',
      '電卓機能（平面・立面）',
      'クラウド保存・同期',
      '基本的な音声入力',
      '無制限履歴保存'
    ]
  },
  pro: {
    productId: PRODUCT_IDS.pro,
    entitlementId: ENTITLEMENT_IDS.pro,
    displayName: 'ScaffAI Pro',
    description: '本格的な設計作業に対応',
    price: '¥12,800',
    period: 'P1M', // ISO 8601: 1ヶ月
    features: [
      'Plusの全機能',
      'Web版アクセス',
      'アプリ内作図機能',
      'プロジェクト管理',
      '高度な計算機能'
    ]
  },
  max: {
    productId: PRODUCT_IDS.max,
    entitlementId: ENTITLEMENT_IDS.max,
    displayName: 'ScaffAI Max',
    description: '企業向け統合ソリューション',
    price: '¥24,800',
    period: 'P1M', // ISO 8601: 1ヶ月
    features: [
      'Proの全機能',
      'CAD連携・出力',
      'API連携',
      '優先技術サポート',
      '企業向け機能'
    ]
  }
};

// RevenueCat Dashboard設定手順
export const REVENUECAT_SETUP_GUIDE = `
📝 RevenueCat Dashboard設定手順:

1. 🌐 https://app.revenuecat.com/ でアカウント作成

2. 📱 アプリ登録:
   - App Name: ScaffAI Mobile
   - Bundle ID (iOS): com.scaffai.mobile  
   - Package Name (Android): com.scaffai.mobile

3. 💰 プロダクト設定:
   Plus プラン:
   - Product ID: ${PRODUCT_IDS.plus}
   - Display Name: ${revenueCatPlanConfig.plus.displayName}
   - Price: ${revenueCatPlanConfig.plus.price}
   - Subscription Period: ${revenueCatPlanConfig.plus.period}
   
   Pro プラン:
   - Product ID: ${PRODUCT_IDS.pro}
   - Display Name: ${revenueCatPlanConfig.pro.displayName}
   - Price: ${revenueCatPlanConfig.pro.price}
   - Subscription Period: ${revenueCatPlanConfig.pro.period}
   
   Max プラン:
   - Product ID: ${PRODUCT_IDS.max}
   - Display Name: ${revenueCatPlanConfig.max.displayName}
   - Price: ${revenueCatPlanConfig.max.price}
   - Subscription Period: ${revenueCatPlanConfig.max.period}

4. 🏷️ エンタイトルメント設定:
   - ${ENTITLEMENT_IDS.plus}: Plus機能アクセス
   - ${ENTITLEMENT_IDS.pro}: Pro機能アクセス  
   - ${ENTITLEMENT_IDS.max}: Max機能アクセス

5. 📦 オファリング設定:
   - Offering ID: ${OFFERING_IDS.main}
   - 全プランを含むメインオファリング

6. 🔑 APIキー取得:
   - iOS用APIキー
   - Android用APIキー
   - 環境変数またはSecrets管理に保存

7. 🍎 App Store Connect設定:
   - In-App Purchase製品を作成
   - Product IDをRevenueCatと一致させる
   - 価格設定（日本: ¥4,980, ¥12,800, ¥24,800）

8. 🤖 Google Play Console設定:
   - 定期購入製品を作成
   - Product IDをRevenueCatと一致させる  
   - 価格設定と承認申請
`;