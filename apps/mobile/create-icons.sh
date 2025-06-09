#!/bin/bash
# ScaffAI アイコン生成スクリプト

# 使用方法: ./create-icons.sh source-icon.png

if [ "$#" -ne 1 ]; then
    echo "使用方法: $0 <source-icon.png>"
    echo "source-icon.png は 1024x1024 サイズである必要があります"
    exit 1
fi

SOURCE_ICON="$1"

if [ ! -f "$SOURCE_ICON" ]; then
    echo "エラー: ファイル $SOURCE_ICON が見つかりません"
    exit 1
fi

echo "🎨 ScaffAI アイコン生成中..."

# 基本アイコン
echo "📱 基本アイコン生成中..."
convert "$SOURCE_ICON" -resize 1024x1024 "assets/icon.png"
convert "$SOURCE_ICON" -resize 1024x1024 "assets/adaptive-icon.png"
convert "$SOURCE_ICON" -resize 64x64 "assets/favicon.png"

# PWA用アイコンディレクトリ作成
mkdir -p "assets/icons"

# PWA用各サイズ
echo "🌐 PWA用アイコン生成中..."
convert "$SOURCE_ICON" -resize 512x512 "assets/icons/icon-512.png"
convert "$SOURCE_ICON" -resize 192x192 "assets/icons/icon-192.png"
convert "$SOURCE_ICON" -resize 144x144 "assets/icons/icon-144.png"
convert "$SOURCE_ICON" -resize 96x96 "assets/icons/icon-96.png"
convert "$SOURCE_ICON" -resize 180x180 "assets/icons/apple-touch-icon.png"

echo "✅ アイコン生成完了！"
echo ""
echo "📂 生成されたファイル:"
echo "  - assets/icon.png (1024x1024)"
echo "  - assets/adaptive-icon.png (1024x1024)" 
echo "  - assets/favicon.png (64x64)"
echo "  - assets/icons/icon-512.png (512x512)"
echo "  - assets/icons/icon-192.png (192x192)"
echo "  - assets/icons/icon-144.png (144x144)"
echo "  - assets/icons/icon-96.png (96x96)"
echo "  - assets/icons/apple-touch-icon.png (180x180)"
echo ""
echo "🚀 次のステップ:"
echo "  1. npx expo export --platform web --clear"
echo "  2. git add . && git commit -m '🎨 新アイコン適用'"
echo "  3. git push origin main"