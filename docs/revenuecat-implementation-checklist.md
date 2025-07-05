# RevenueCat課金機能実装チェックリスト

## 📋 実装チェックリスト

このチェックリストを使用して、RevenueCat課金機能の実装を段階的に進めてください。

## 🏗️ Phase 1: 基本設定

### RevenueCatアカウント設定
- [ ] RevenueCatアカウントの作成
- [ ] プロジェクトの作成
- [ ] アプリケーションの登録
  - [ ] iOS Bundle ID: `com.scaffai.mobile`
  - [ ] Android Package Name: `com.scaffai.mobile`
- [ ] APIキーの取得
  - [ ] iOS Public API Key
  - [ ] Android Public API Key

### プロダクト設定
- [ ] プロダクトの作成
  - [ ] **Plus プラン**
    - [ ] Product ID: `scaffai_plus_monthly`
    - [ ] Display Name: `ScaffAI Plus`
    - [ ] Price: ¥4,980
    - [ ] Period: 1 Month
  - [ ] **Pro プラン**
    - [ ] Product ID: `scaffai_pro_monthly`
    - [ ] Display Name: `ScaffAI Pro`
    - [ ] Price: ¥12,800
    - [ ] Period: 1 Month
  - [ ] **Max プラン**
    - [ ] Product ID: `scaffai_max_monthly`
    - [ ] Display Name: `ScaffAI Max`
    - [ ] Price: ¥24,800
    - [ ] Period: 1 Month

### エンタイトルメント設定
- [ ] エンタイトルメントの作成
  - [ ] `scaffai_plus_features`
  - [ ] `scaffai_pro_features`
  - [ ] `scaffai_max_features`

### オファリング設定
- [ ] メインオファリングの作成
  - [ ] Offering ID: `main_offering`
  - [ ] 全プランをオファリングに追加

## 🏪 Phase 2: ストア設定

### App Store Connect設定
- [ ] App Store Connect にログイン
- [ ] In-App Purchase の設定
  - [ ] **Plus プラン**
    - [ ] Product ID: `scaffai_plus_monthly`
    - [ ] Reference Name: `ScaffAI Plus Monthly`
    - [ ] Price: ¥4,980
    - [ ] Subscription Group: `ScaffAI Subscriptions`
  - [ ] **Pro プラン**
    - [ ] Product ID: `scaffai_pro_monthly`
    - [ ] Reference Name: `ScaffAI Pro Monthly`
    - [ ] Price: ¥12,800
    - [ ] Subscription Group: `ScaffAI Subscriptions`
  - [ ] **Max プラン**
    - [ ] Product ID: `scaffai_max_monthly`
    - [ ] Reference Name: `ScaffAI Max Monthly`
    - [ ] Price: ¥24,800
    - [ ] Subscription Group: `ScaffAI Subscriptions`
- [ ] 各プランの承認申請
- [ ] テスト用アカウントの設定

### Google Play Console設定
- [ ] Google Play Console にログイン
- [ ] 定期購入の設定
  - [ ] **Plus プラン**
    - [ ] Product ID: `scaffai_plus_monthly`
    - [ ] Product Name: `ScaffAI Plus Monthly`
    - [ ] Price: ¥4,980
    - [ ] Billing Period: 1 Month
  - [ ] **Pro プラン**
    - [ ] Product ID: `scaffai_pro_monthly`
    - [ ] Product Name: `ScaffAI Pro Monthly`
    - [ ] Price: ¥12,800
    - [ ] Billing Period: 1 Month
  - [ ] **Max プラン**
    - [ ] Product ID: `scaffai_max_monthly`
    - [ ] Product Name: `ScaffAI Max Monthly`
    - [ ] Price: ¥24,800
    - [ ] Billing Period: 1 Month
- [ ] 各プランの承認申請
- [ ] テスト用アカウントの設定

## 💻 Phase 3: アプリケーション実装

### 環境変数設定
- [ ] 環境変数ファイルの作成
  - [ ] `.env.development`
  - [ ] `.env.production`
- [ ] APIキーの設定
  - [ ] `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`
  - [ ] `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`
  - [ ] `EXPO_PUBLIC_REVENUECAT_ENVIRONMENT`

### 依存関係のインストール
- [ ] 必要なパッケージのインストール
  - [ ] `react-native-dotenv`
  - [ ] `react-native-keychain`
  - [ ] 分析ライブラリ（オプション）

### 設定ファイルの作成
- [ ] 環境設定ファイル
  - [ ] `apps/mobile/constants/env.ts`
  - [ ] `apps/mobile/constants/revenueCatConfig.ts`
- [ ] 型定義ファイル
  - [ ] `apps/mobile/types/purchases.ts`
- [ ] エラーハンドリング
  - [ ] `apps/mobile/utils/purchaseErrors.ts`
- [ ] セキュリティ設定
  - [ ] `apps/mobile/utils/security.ts`

### プラットフォーム固有の設定
- [ ] **iOS設定**
  - [ ] `Info.plist` の更新
  - [ ] StoreKit設定の追加
- [ ] **Android設定**
  - [ ] `AndroidManifest.xml` の更新
  - [ ] 必要な権限の追加
  - [ ] Google Play Billing設定

### PurchaseContext の更新
- [ ] 実際のRevenueCat SDK初期化
  - [ ] `Purchases.configure()` の実装
  - [ ] APIキーの設定
  - [ ] StoreKit2対応
- [ ] 購入処理の実装
  - [ ] `purchasePackage()` の実装
  - [ ] エラーハンドリング
  - [ ] 成功時の処理
- [ ] 復元処理の実装
  - [ ] `restorePurchases()` の実装
  - [ ] 過去の購入履歴の取得
- [ ] 顧客情報の管理
  - [ ] `CustomerInfo` の取得
  - [ ] アクティブなサブスクリプションの確認

## 🔧 Phase 4: 機能実装

### 購入フロー
- [ ] プラン選択UI
  - [ ] プラン比較表示
  - [ ] 価格・機能表示
  - [ ] 購入ボタン
- [ ] 購入処理
  - [ ] 購入確認ダイアログ
  - [ ] 購入実行
  - [ ] 結果表示
- [ ] エラーハンドリング
  - [ ] 購入キャンセル
  - [ ] ネットワークエラー
  - [ ] 決済エラー

### 復元機能
- [ ] 購入復元ボタン
- [ ] 復元処理の実装
- [ ] 復元結果の表示

### 使用制限の実装
- [ ] プラン別機能制限
- [ ] 使用回数の管理
- [ ] 制限超過時の処理

### プラン管理
- [ ] 現在のプラン表示
- [ ] 使用状況の表示
- [ ] プラン変更機能

## 🧪 Phase 5: テストと検証

### サンドボックステスト
- [ ] テスト環境の設定
  - [ ] iOS Simulator でのテスト
  - [ ] Android Emulator でのテスト
- [ ] テストケース
  - [ ] 各プランの購入テスト
  - [ ] 購入キャンセルテスト
  - [ ] 復元機能テスト
  - [ ] エラーハンドリングテスト

### 実機テスト
- [ ] iOS実機テスト
  - [ ] TestFlight配信
  - [ ] テスト用アカウントでの購入
- [ ] Android実機テスト
  - [ ] Internal Testing配信
  - [ ] テスト用アカウントでの購入

### 機能テスト
- [ ] 購入フローの完全テスト
- [ ] 各プランの機能制限テスト
- [ ] 使用回数制限のテスト
- [ ] プラン変更のテスト

## 📊 Phase 6: 分析と監視

### 分析設定
- [ ] 購入イベントの追跡
- [ ] 分析ダッシュボードの設定
- [ ] KPIの設定

### ログ設定
- [ ] 購入ログの実装
- [ ] エラーログの実装
- [ ] 分析ログの実装

### 監視設定
- [ ] 購入失敗率の監視
- [ ] 解約率の監視
- [ ] 収益の監視

## 🔒 Phase 7: セキュリティ

### データ保護
- [ ] APIキーの暗号化
- [ ] レシート検証の実装
- [ ] 不正購入の防止

### プライバシー
- [ ] プライバシーポリシーの更新
- [ ] 利用規約の更新
- [ ] データ処理の透明性

## 🚀 Phase 8: 本番環境移行

### 本番環境設定
- [ ] 本番用APIキーの設定
- [ ] 本番用環境変数の設定
- [ ] 本番用ビルドの作成

### App Store提出
- [ ] App Store審査用ビルド
- [ ] スクリーンショット更新
- [ ] アプリ説明文更新
- [ ] 課金機能の説明追加

### Play Store提出
- [ ] Play Store審査用ビルド
- [ ] ストアリスティング更新
- [ ] 課金機能の説明追加

### 法的要件
- [ ] 特定商取引法に基づく表示
- [ ] 解約・返金ポリシー
- [ ] 利用規約の更新

## 📈 Phase 9: 運用・保守

### 監視・分析
- [ ] 購入データの分析
- [ ] ユーザーフィードバックの収集
- [ ] 機能改善の計画

### サポート
- [ ] 購入トラブルの対応
- [ ] 解約手続きの案内
- [ ] 技術サポートの体制

### 更新・改善
- [ ] 新機能の追加
- [ ] 価格設定の見直し
- [ ] ユーザビリティの改善

## 🔄 継続的改善

### A/Bテスト
- [ ] 価格設定のテスト
- [ ] UIデザインのテスト
- [ ] 機能説明のテスト

### データ分析
- [ ] 購入コンバージョン率の分析
- [ ] 解約理由の分析
- [ ] LTV（顧客生涯価値）の分析

### 機能拡張
- [ ] 新しいプランの追加
- [ ] 無料トライアル期間の設定
- [ ] 紹介キャンペーンの実装

---

## 📋 実装優先順位

### 🔥 高優先度（Phase 1-3）
すぐに着手すべき項目
- RevenueCatアカウント設定
- ストア設定
- 基本的なアプリケーション実装

### 🟡 中優先度（Phase 4-6）
実装後に対応すべき項目
- 詳細機能実装
- テストと検証
- 分析設定

### 🔵 低優先度（Phase 7-9）
安定稼働後に対応すべき項目
- セキュリティ強化
- 運用・保守
- 継続的改善

---

*このチェックリストに沿って実装を進めることで、安全で効率的な課金機能を実現できます。*