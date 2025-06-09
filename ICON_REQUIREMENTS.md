# 📱 ScaffAI アイコン要件

## **必要なアイコンファイル**

### **基本アイコン（必須）:**
```
apps/mobile/assets/
├── icon.png          (1024x1024) - メインアイコン
├── adaptive-icon.png (1024x1024) - Android用
├── favicon.png       (64x64)     - ブラウザタブ
└── splash.png        (1284x2778) - スプラッシュ画面
```

### **PWA用アイコン（推奨）:**
```
apps/mobile/assets/icons/
├── icon-192.png      (192x192)   - PWA標準
├── icon-512.png      (512x512)   - PWA大サイズ
├── icon-144.png      (144x144)   - Android Chrome
├── icon-96.png       (96x96)     - Android Chrome小
└── apple-touch-icon.png (180x180) - iOS Safari
```

## **デザインガイドライン**

### **✅ 推奨デザイン:**
- **シンプル**: 小さなサイズでも認識可能
- **コントラスト**: 背景色に関係なく視認性良好
- **ブランド**: ScaffAI = 足場 + AI をイメージ
- **色**: 建設業界らしい色（オレンジ、青、グレーなど）

### **🎨 デザインアイデア:**
1. **足場 + AI**: 足場のシルエット + AIチップ/回路
2. **建設ツール**: ヘルメット + デジタル要素
3. **幾何学模様**: 足場の格子パターン + モダンデザイン
4. **文字ベース**: "S" + 足場要素

### **❌ 避けるべき:**
- 細かすぎるディテール
- 読めない小さな文字
- 低コントラスト
- 複雑すぎるデザイン

## **アイコン作成ツール**

### **無料ツール:**
- **Figma** (https://figma.com)
- **Canva** (https://canva.com)
- **GIMP** (https://gimp.org)

### **オンライン生成ツール:**
- **App Icon Generator** (https://appicon.co)
- **PWA Asset Generator** (https://progressier.com/pwa-icons-generator)

### **AI生成（参考）:**
- **ChatGPT DALL-E**
- **Midjourney**
- **Adobe Firefly**

## **実装手順**

### **1. アイコン準備:**
```bash
# 各サイズのPNGファイルを準備
icon-1024.png   (1024x1024)
icon-512.png    (512x512)
icon-192.png    (192x192)
icon-144.png    (144x144)
icon-96.png     (96x96)
icon-64.png     (64x64)
apple-touch-icon.png (180x180)
```

### **2. ファイル配置:**
```bash
# assetsフォルダに配置
cp new-icon-1024.png apps/mobile/assets/icon.png
cp new-icon-1024.png apps/mobile/assets/adaptive-icon.png
cp new-icon-64.png apps/mobile/assets/favicon.png

# PWA用フォルダ作成
mkdir -p apps/mobile/assets/icons/
cp new-icon-*.png apps/mobile/assets/icons/
```

### **3. 設定更新:**
```bash
# app.json、manifest.json更新
# PWA設定に新しいアイコンパス追加
```

### **4. 反映:**
```bash
# Expo export実行
npx expo export --platform web --clear

# Vercelに再デプロイ
git add . && git commit -m "🎨 新アイコン適用"
git push origin main
```

---

**新しいアイコンファイルを提供していただければ、設定を更新します！**