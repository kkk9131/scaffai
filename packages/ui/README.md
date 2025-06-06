# @scaffai/ui

ScaffAI共通UIコンポーネントライブラリ

## 概要

`@scaffai/ui`は、ScaffAIプロジェクトで使用される共通UIコンポーネントライブラリです。WebアプリケーションとReact Nativeアプリケーションの両方で使用できるクロスプラットフォーム対応のコンポーネントを提供します。

## 特徴

- **クロスプラットフォーム**: Web（React）とNative（React Native）で同じAPIを使用
- **TypeScript完全対応**: 型安全なコンポーネント開発
- **Tailwind CSS統合**: デザインシステムに基づいたスタイリング
- **建設業界特化**: 足場計算アプリに最適化されたコンポーネント

## インストール

```bash
npm install @scaffai/ui
# または
yarn add @scaffai/ui
```

## 使用方法

```tsx
import { Button, Input, Card } from '@scaffai/ui';

function MyComponent() {
  return (
    <Card title="足場計算">
      <Input 
        label="幅（mm）"
        type="number"
        placeholder="8000"
        onChange={(value) => console.log(value)}
      />
      <Button 
        variant="solid"
        color="primary"
        onPress={() => console.log('計算実行')}
      >
        計算する
      </Button>
    </Card>
  );
}
```

## 利用可能なコンポーネント

### Button
- `variant`: 'solid' | 'outline' | 'ghost' | 'link'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `color`: 'primary' | 'secondary' | 'scaffold' | 'danger' | 'warning' | 'success'

### Input
- `type`: 'text' | 'number' | 'email' | 'password'
- バリデーション対応
- エラー表示

### Card
- `variant`: 'default' | 'outlined' | 'elevated'
- `padding`: 'sm' | 'md' | 'lg' | 'xl'
- タイトル・サブタイトル対応

## 開発

```bash
# 開発モード
npm run dev

# ビルド
npm run build

# テスト
npm run test

# リント
npm run lint
```

## カラーパレット

### Primary（メインカラー）
- primary-500: `#3b82f6` (メインブルー)
- primary-600: `#2563eb` (ボタン等)

### Scaffold（建設業界特化）
- scaffold-orange: `#f97316` (安全オレンジ)
- scaffold-steel: `#6b7280` (スチールグレー)
- scaffold-safety: `#ef4444` (安全赤)

## ライセンス

MIT