# 認証バイパス機能

開発環境での認証バイパス機能の使用方法について説明します。

## 概要

開発環境で認証をスキップして、ログインなしでアプリケーションの全機能をテストできる機能です。

## 使用方法

### 1. 環境変数の設定

`.env.local`ファイルを作成または編集し、以下の行を追加してください：

```env
NEXT_PUBLIC_DEV_BYPASS_AUTH=true
```

### 2. 開発サーバーの再起動

環境変数を変更した場合は、開発サーバーを再起動する必要があります：

```bash
npm run dev
```

### 3. 動作確認

認証バイパスが有効になると、以下のようになります：

- 認証が必要なページ（`/dashboard`, `/calculator`等）に直接アクセス可能
- ログインページ（`/login`, `/register`）はスキップされます
- プラットフォームアクセス制限も無効になります

## 無効化する方法

認証バイパスを無効にするには、以下のいずれかを行ってください：

### 方法1: 環境変数を false に設定
```env
NEXT_PUBLIC_DEV_BYPASS_AUTH=false
```

### 方法2: 環境変数を削除
`.env.local`から該当行を削除するか、コメントアウトします：
```env
# NEXT_PUBLIC_DEV_BYPASS_AUTH=true
```

## セキュリティについて

### 重要な注意点

1. **本番環境では絶対に使用しないでください**
2. この環境変数は開発環境（`NODE_ENV=development`）でのみ動作します
3. 本番ビルドでは自動的に無効化されます

### 安全な運用

- `.env.local`ファイルは`.gitignore`に含まれているため、誤ってリポジトリにコミットされることはありません
- `.env.example`では`NEXT_PUBLIC_DEV_BYPASS_AUTH=false`がデフォルト値として設定されています

## 対象コンポーネント

以下のコンポーネントで認証バイパスが実装されています：

1. **AuthContext** (`contexts/AuthContext.tsx`)
   - `canAccessPlatform()` - プラットフォームアクセス制御
   - `useRequireAuth()` - 認証必須フック

2. **ProtectedRoute** (`components/ProtectedRoute.tsx`)
   - 認証が必要なページの保護機能

3. **PlatformAccessGuard** (`components/PlatformAccessGuard.tsx`)
   - プラットフォーム課金制御の回避

## トラブルシューティング

### 環境変数が効かない場合

1. 開発サーバーを再起動してください
2. `.env.local`ファイルの場所が正しいか確認してください（`apps/web/.env.local`）
3. 環境変数名のスペルが正しいか確認してください

### 一部のページで認証が求められる場合

全ての認証制御箇所で実装されているか確認してください。新しく追加された認証制御がある場合は、同様の実装を追加する必要があります。

## 実装の詳細

認証バイパスは以下の条件でのみ動作します：

```typescript
const bypassAuth = process.env.NODE_ENV === 'development' && 
                  process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true'
```

これにより、開発環境かつ明示的にフラグが設定された場合にのみ有効になります。