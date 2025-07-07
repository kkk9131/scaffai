# ScaffAI 即時実行計画

## 🚀 Step 1: 価格設定更新（今すぐ実行）

### 優先度：🔥 最高

#### 1.1 アプリコードの価格更新

##### A. プラン設定ファイル更新
```typescript
// apps/mobile/constants/revenueCatPlans.ts
export const revenueCatPlanConfig = {
  plus: {
    productId: PRODUCT_IDS.plus,
    entitlementId: ENTITLEMENT_IDS.plus,
    displayName: 'ScaffAI Plus',
    description: 'お手軽な現場作業プラン',
    price: '¥500', // ← 変更
    period: 'P1M',
    features: [
      '無制限計算・簡易割付',
      '基本的な電卓機能',
      'ローカル保存',
      '履歴保存（30日間）'
    ]
  },
  pro: {
    productId: PRODUCT_IDS.pro,
    entitlementId: ENTITLEMENT_IDS.pro,
    displayName: 'ScaffAI Pro',
    description: '本格的な設計作業プラン',
    price: '¥4,980', // ← 変更
    period: 'P1M',
    features: [
      'Plusの全機能',
      'クラウド保存・同期',
      'Web版アクセス',
      'アプリ内作図機能',
      'プロジェクト管理',
      '無制限履歴保存'
    ]
  },
  max: {
    productId: PRODUCT_IDS.max,
    entitlementId: ENTITLEMENT_IDS.max,
    displayName: 'ScaffAI Max',
    description: 'エンタープライズプラン',
    price: '¥12,800', // ← 変更
    period: 'P1M',
    features: [
      'Proの全機能',
      'CAD連携・出力',
      'API連携',
      '優先技術サポート',
      '企業向け機能'
    ]
  }
};
```

##### B. プラン管理画面の価格表示更新
```typescript
// apps/mobile/app/(drawer)/plan-management.tsx
const planDetails = {
  plus: {
    name: 'Plus',
    price: '500円', // ← 変更
    period: '月額',
    // ...
  },
  pro: {
    name: 'Pro', 
    price: '4,980円', // ← 変更
    period: '月額',
    // ...
  },
  max: {
    name: 'Max',
    price: '12,800円', // ← 変更
    period: '月額',
    // ...
  }
};
```

#### 1.2 Plus機能制限の実装

##### A. 使用管理の更新
```typescript
// apps/mobile/utils/usageManager.ts
export const PLAN_LIMITS = {
  plus: {
    calculations: null, // 無制限
    quickAllocations: null, // 無制限
    hasCalculatorFunction: true,
    hasCloudSync: false, // ← false に変更
    hasWebAccess: false, // ← false に変更
    hasCADExport: false,
    hasVoiceInput: false, // ← false に変更（基本機能のみ）
  },
  pro: {
    calculations: null,
    quickAllocations: null,
    hasCalculatorFunction: true,
    hasCloudSync: true, // Pro以上で有効
    hasWebAccess: true, // Pro以上で有効
    hasCADExport: false,
    hasVoiceInput: true, // Pro以上で有効
  },
  // ...
};
```

##### B. クラウド同期制限の実装
```typescript
// apps/mobile/context/ScaffoldContext.tsx
const saveToCloud = useCallback(async (title?: string) => {
  try {
    // プラン制限チェックを追加
    const userPlanData = await UsageManager.getUserPlan();
    const planLimits = PLAN_LIMITS[userPlanData.plan];
    
    if (!planLimits.hasCloudSync) {
      Alert.alert(
        'プラン制限',
        'クラウド保存はProプラン以上でご利用いただけます。',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: 'プランを見る', onPress: () => router.push('/plan-management') }
        ]
      );
      return;
    }
    
    // 既存のクラウド保存処理
    // ...
  } catch (error) {
    // エラーハンドリング
  }
}, []);
```

### Step 2: RevenueCatダッシュボード更新

#### 2.1 実行手順
```yaml
作業内容:
1. RevenueCat Dashboard にログイン
2. Products セクションを開く
3. 各プロダクトの価格を更新:
   - scaffai_plus_monthly: ¥500
   - scaffai_pro_monthly: ¥4,980
   - scaffai_max_monthly: ¥12,800
4. Offerings で価格表示を確認
5. 変更を保存
```

#### 2.2 確認事項
- [ ] 全プロダクトの価格が正しく更新されている
- [ ] Current Offering に反映されている
- [ ] テスト環境で価格が正しく表示される

### Step 3: App Store Connect設定（段階的）

#### 3.1 Phase 1: Plusプランのみ作成
```yaml
作業手順:
1. App Store Connect にログイン
2. App → In-App Purchases
3. 新規作成:
   - Product ID: scaffai_plus_monthly
   - Reference Name: ScaffAI Plus Monthly
   - Price: ¥500
   - Subscription Group: ScaffAI Subscriptions
   - Subscription Duration: 1 Month
4. 審査申請
```

#### 3.2 Pro/Max製品は後回し
```yaml
理由:
- Plus機能は完成済み
- Pro/Max機能は実装が必要
- 段階的リリースでリスク軽減
```

## 🧪 テスト計画

### サンドボックステスト項目
```yaml
必須テスト:
- [ ] Plus ¥500での購入フロー
- [ ] Plus機能制限の動作確認
- [ ] クラウド同期制限の表示
- [ ] プラン比較画面の価格表示
- [ ] 購入復元機能
- [ ] エラーハンドリング
```

### テスト手順
```yaml
1. 開発環境での動作確認
2. TestFlightビルド作成
3. サンドボックスアカウントでテスト
4. 問題修正・再テスト
5. 本番リリース準備
```

## 📅 実行スケジュール

### 今日（即時）
- [ ] アプリコードの価格更新
- [ ] Plus機能制限実装
- [ ] RevenueCat価格更新
- [ ] 開発環境テスト

### 明日
- [ ] App Store Connect製品作成
- [ ] TestFlightビルド作成
- [ ] サンドボックステスト

### 今週中
- [ ] 審査申請
- [ ] 最終テスト
- [ ] リリース準備

## ⚠️ 注意事項

### 実装時の注意点
```yaml
価格表示:
- 通貨記号の統一（¥ vs 円）
- 表示桁数の確認
- 多言語対応の準備

機能制限:
- 既存ユーザーへの影響確認
- エラーメッセージの適切性
- アップセルUIの自然さ
```

### テスト時の確認事項
```yaml
購入フロー:
- 価格が正しく表示される
- 購入確認画面が適切
- 購入完了後の機能有効化

機能制限:
- Plus機能のみ利用可能
- Pro機能で適切なブロック
- アップセル案内の表示
```

## 🎯 成功指標

### Phase 1 完了条件
```yaml
技術面:
- [ ] 全ての価格表示が更新済み
- [ ] Plus機能制限が正常動作
- [ ] サンドボックステスト通過

ビジネス面:
- [ ] App Store審査通過
- [ ] Plus ¥500での購入可能
- [ ] ユーザーからの問い合わせゼロ
```

### 次フェーズ準備
```yaml
Pro機能実装:
- [ ] 技術仕様の策定
- [ ] 開発スケジュール
- [ ] 必要リソースの確保
```

---

**まずは Step 1.1 のアプリコード更新から始めましょう！**