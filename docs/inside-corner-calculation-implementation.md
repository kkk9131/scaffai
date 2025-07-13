# 入隅部分の計算機能実装ガイド

このドキュメントは、ScaffAIのWeb版作図エディターにおける入隅部分の計算機能の実装手順と内容をまとめています。

## 1. 概要

L字型などの複雑な建物形状における入隅部分の足場計算を実装し、各辺のスパン構成と離れを表示する機能です。

### 実装目標
- 入隅頂点の検出と情報表示
- 入隅頂点から伸びる2つの辺の長さ表示
- 各辺に対応する軒の出の長さ表示
- 入隅部分の特別な計算ロジック（auto_span_calculation_logic.mdに基づく）
- 全ての辺の計算結果表示（外周面は簡易計算の結果を使用）

## 2. 実装手順

### 2.1 入隅頂点の検出機能実装

#### ファイル: `apps/web/lib/calculator/insideCornerDetector.ts`
入隅頂点を検出するロジックが既に実装済み。270度の内角を持つ頂点を検出。

#### 修正箇所: `DrawingEditor.tsx`
```typescript
// 入隅検出の呼び出し
const insideCorners = detectInsideCorners(vertices);
```

### 2.2 入隅頂点から伸びる辺の長さ計算

#### 実装内容
- 入隅頂点から前辺・次辺への距離をピクセル座標から計算
- 20倍のスケールファクターでmm単位に変換

```typescript
const prevEdgeLengthPixel = Math.hypot(currVertex.x - prevVertex.x, currVertex.y - prevVertex.y);
const nextEdgeLengthPixel = Math.hypot(nextVertex.x - currVertex.x, nextVertex.y - currVertex.y);
// スケール計算: ピクセル座標を実際のmm値に変換
const prevEdgeLength = prevEdgeLengthPixel * 20;
const nextEdgeLength = nextEdgeLengthPixel * 20;
```

### 2.3 軒の出情報の取得・表示

#### 実装内容
- 入隅頂点から伸びる各辺のインデックスを計算
- `edgeEaves`配列から対応する軒の出を取得

```typescript
// 入隅頂点から伸びる辺のインデックスを計算
const prevEdgeIndex = (corner.index - 1 + vertices.length) % vertices.length;
const nextEdgeIndex = corner.index;

// 対応する軒の出を取得
const prevEave = eaves.find(e => e.edgeIndex === prevEdgeIndex);
const nextEave = eaves.find(e => e.edgeIndex === nextEdgeIndex);
```

### 2.4 型定義の拡張

#### ファイル: `apps/web/lib/calculator/types.ts`
```typescript
// AllocationResult型にinsideCorners情報を追加
insideCorners?: {
  index: number;
  position: { x: number; y: number };
  angle: number;
  prevEdgeLength: number;
  nextEdgeLength: number;
  prevEdgeIndex: number;
  nextEdgeIndex: number;
  prevEaveDistance: number;
  nextEaveDistance: number;
}[];

// 各辺の計算結果用の型を追加
edgeCalculations?: {
  edgeIndex: number;
  edgeName: string;
  direction: string;
  length: number;
  eaveDistance: number;
  spanConfig: number[];
  totalSpan: number;
  actualDistance: number;
}[];
```

### 2.5 各辺の方向判定

#### 実装内容
座標から建物の外向き法線ベクトルを計算して、正しく北・東・南・西を判定

```typescript
// 建物の外側がどちらかを判定するため、多角形の中心を計算
const centerX = vertices.reduce((sum, v) => sum + v.x, 0) / vertices.length;
const centerY = vertices.reduce((sum, v) => sum + v.y, 0) / vertices.length;

// 辺の法線ベクトル（外向き）を計算
const normalX = -dy;
const normalY = dx;

// 方向を判定
if (Math.abs(outwardNormalX) > Math.abs(outwardNormalY)) {
  direction = outwardNormalX > 0 ? '東' : '西';
} else {
  direction = outwardNormalY > 0 ? '南' : '北';
}
```

### 2.6 外周面での簡易計算結果の使用

#### 重要な修正
外周面の計算では`calcOuterSpan`を個別に実行するのではなく、簡易計算の結果を使用

```typescript
// 簡易計算の結果を使用
if (tempDirection === '北' || tempDirection === '南') {
  edgeResult = {
    spanConfig: northSouthResult.spanConfig,    // 北面・南面は南北方向の計算結果を使用
    totalSpan: northSouthResult.totalSpan,
    actualDistance: Math.round(northSouthResult.actualDistance),
    minRequiredDistance: northSouthResult.minRequiredDistance
  };
} else {
  edgeResult = {
    spanConfig: eastWestResult.spanConfig,      // 東面・西面は東西方向の計算結果を使用
    totalSpan: eastWestResult.totalSpan,
    actualDistance: Math.round(eastWestResult.actualDistance),
    minRequiredDistance: eastWestResult.minRequiredDistance
  };
}
```

### 2.7 入隅部分の特別な計算ロジック

#### auto_span_calculation_logic.mdに基づいた計算
```typescript
// 辺2-3のスパン構成を決定
// 離れ(辺3-4) = 離れ(北面外周) + 長さ(辺2-3) - [辺2-3のスパン構成]
// 離れ(辺3-4) >= 軒の出+80 となるように辺2-3のスパンを決める
const eave3_4 = eaves.find(e => e.edgeIndex === nextEdgeIndex)?.distance ?? 1000;
const minDistance3_4 = eave3_4 + 80;
const targetDistance3_4 = northDistance + prevEdge.length;
const spanConfig2_3 = findOptimalSpanForInsideCorner(targetDistance3_4, minDistance3_4);

// 辺3-4のスパンを計算（辺2-3の離れ計算に必要）
// 離れ(辺2-3) = 離れ(東面外周) + 長さ(辺3-4) - [辺3-4のスパン構成]
const eave2_3 = eaves.find(e => e.edgeIndex === prevEdgeIndex)?.distance ?? 1000;
const minDistance2_3 = eave2_3 + 80;
const targetDistance2_3 = eastDistance + nextEdge.length;
const spanConfig3_4 = findOptimalSpanForInsideCorner(targetDistance2_3, minDistance2_3);
```

#### 入隅用スパン最適化関数
```typescript
const findOptimalSpanForInsideCorner = (targetDistance: number, minDistance: number): number[] => {
  // targetDistance - [スパン合計] >= minDistance
  // つまり、[スパン合計] <= targetDistance - minDistance
  const maxSpanTotal = targetDistance - minDistance;
  
  const STANDARD_PARTS = [1800, 1500, 1200, 900, 600];
  let bestConfig: number[] = [];
  let bestTotal = 0;
  
  // 最大スパン合計以下で最大の組み合わせを探す
  for (let count = 1; count <= 10; count++) {
    const combos = generateCombinations(STANDARD_PARTS, count);
    for (const combo of combos) {
      const total = combo.reduce((a, b) => a + b, 0);
      if (total <= maxSpanTotal && total > bestTotal) {
        bestTotal = total;
        bestConfig = combo;
      }
    }
    if (bestConfig.length > 0 && count > 3) break;
  }
  
  return bestConfig.length > 0 ? bestConfig : [900];
};
```

### 2.8 UI表示の実装

#### 入隅頂点情報の表示
```typescript
{allocationResult.insideCorners && allocationResult.insideCorners.length > 0 && (
  <div className="mb-2">
    <div className="font-semibold text-green-700 dark:text-green-300">入隅頂点の辺情報</div>
    <ul className="list-disc ml-5">
      {allocationResult.insideCorners.map((corner: any, i: number) => (
        <li key={i} className="mb-1">
          <div>頂点{corner.index + 1}（{Math.round(corner.position.x)}, {Math.round(corner.position.y)}）</div>
          <div className="text-xs text-gray-600 dark:text-gray-400 ml-2">
            前辺長: {corner.prevEdgeLength}mm, 次辺長: {corner.nextEdgeLength}mm, 内角: {corner.angle.toFixed(1)}°
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 ml-2">
            前辺軒の出: {corner.prevEaveDistance}mm, 次辺軒の出: {corner.nextEaveDistance}mm
          </div>
        </li>
      ))}
    </ul>
  </div>
)}
```

#### 各辺の計算結果表示
```typescript
{allocationResult.edgeCalculations && allocationResult.edgeCalculations.length > 0 && (
  <div className="mb-2">
    <div className="font-semibold text-purple-700 dark:text-purple-300">各辺の計算結果</div>
    <ul className="list-disc ml-5">
      {allocationResult.edgeCalculations.map((edge: any, i: number) => {
        // スパン構成文字列を作成（test.mdの形式に合わせる）
        let spanText = '';
        if (edge.spanConfig.length === 1) {
          spanText = `${edge.spanConfig[0]}`;
        } else {
          // 複数スパンの場合の表示ロジック
        }
        
        return (
          <li key={i} className="mb-1">
            <div className="font-medium text-sm">辺{edge.edgeName} ({edge.direction}面, {edge.length}mm)</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 ml-2">
              スパン構成: {spanText}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 ml-2">
              離れ: {edge.actualDistance}mm
            </div>
          </li>
        );
      })}
    </ul>
  </div>
)}
```

## 3. 重要なポイント

### 3.1 計算結果の方向対応
- **東西方向の計算** → **東面・西面**の離れとスパン構成
- **南北方向の計算** → **北面・南面**の離れとスパン構成

### 3.2 入隅計算の相互依存性
入隅の2つの辺は相互に依存しているため、以下の順序で計算：
1. 辺2-3のスパンを決定（辺3-4の離れ制約から）
2. 辺3-4のスパンを決定（辺2-3の離れ制約から）
3. 各辺の最終的な離れを計算

### 3.3 安全基準の確保
各辺で `軒の出 + 80mm` 以上の離れを確保するスパン構成を自動選択

### 3.4 スケール変換
ピクセル座標からmm単位への変換には20倍のスケールファクターを使用

## 4. テスト・検証

### 4.1 期待値（test.mdベース）
```
建物形状: L字型（6頂点）
辺の長さ:
  1-2: 2500mm
  2-3: 1000mm  ← 入隅の辺
  3-4: 2500mm  ← 入隅の辺
  4-5: 9000mm
  5-6: 5000mm
  6-1: 10000mm

軒の出: 各1000mm

期待される計算結果:
  辺2-3: スパン構成900mm, 離れ1250mm
  辺3-4: スパン構成1span,600(2400), 離れ1200mm
```

### 4.2 検証項目
- [ ] 入隅頂点が正しく検出される（頂点3のみ）
- [ ] 辺の長さが正確に表示される（1000mm, 2500mm）
- [ ] 軒の出が正しく取得・表示される
- [ ] 入隅の計算結果が期待値と一致する
- [ ] 外周面が簡易計算の結果を使用している
- [ ] UI表示が適切にフォーマットされている

## 5. 関連ファイル

### 5.1 主要実装ファイル
- `apps/web/components/DrawingCanvas/DrawingEditor.tsx`
- `apps/web/lib/calculator/types.ts`
- `apps/web/lib/calculator/insideCornerDetector.ts`
- `apps/web/lib/calculator/outerSpanCalculator.ts`

### 5.2 参考ドキュメント
- `docs/auto_span_calculation_logic.md`
- `docs/test.md`

## 6. 今後の拡張可能性

### 6.1 複数入隅への対応
現在はL字型（1つの入隅）に対応。将来的にはコの字型などの複数入隅にも対応可能

### 6.2 特殊部材の使用
現在は標準部材（1800, 1500, 1200, 900, 600）のみ使用。必要に応じて150mmなどの特殊部材も追加可能

### 6.3 境界線制約への対応
隣地境界線などの物理的制約がある場合の計算ロジック追加

---

*この実装ガイドは、入隅部分の計算機能の完全な実装手順を提供します。新しいプロジェクトや機能拡張の際の参考として活用してください。*