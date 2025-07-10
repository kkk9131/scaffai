import { Vertex, InsideCorner } from './insideCornerDetector';

export type InsideCornerSpanInput = {
  insideCorner: InsideCorner;
  prevEdgeLength: number; // 入隅の前の辺の長さ
  nextEdgeLength: number; // 入隅の次の辺の長さ
  minDistance: number;    // 最小離れ（外周基準）
};

export type InsideCornerSpanResult = {
  index: number;
  position: Vertex;
  spanConfig: number[];
  actualDistance: number;
};

const STANDARD_PARTS = [1800, 1500, 1200, 900, 600];
const SAFETY_MARGIN = 80;

/**
 * 指定した長さ以上となる最小のスパン構成を探索
 */
function findMinSpanConfig(target: number): number[] {
  let best: number[] = [];
  let minTotal = Infinity;
  for (let count = 1; count <= 10; count++) {
    const combos = generateCombinations(STANDARD_PARTS, count);
    for (const combo of combos) {
      const sum = combo.reduce((a, b) => a + b, 0);
      if (sum >= target && sum < minTotal) {
        minTotal = sum;
        best = combo;
      }
    }
    if (best.length > 0) break;
  }
  return best;
}

// 組み合わせ生成（重複あり順列）
function generateCombinations(arr: number[], length: number): number[][] {
  if (length === 1) return arr.map(v => [v]);
  const result: number[][] = [];
  for (const v of arr) {
    for (const sub of generateCombinations(arr, length - 1)) {
      result.push([v, ...sub]);
    }
  }
  return result;
}

/**
 * 入隅ごとの離れ・スパン構成計算
 */
export function calcInsideCornerSpan(input: InsideCornerSpanInput): InsideCornerSpanResult {
  // 例：入隅の離れ = minDistance + 垂直辺長 - スパン合計
  const target = input.minDistance + input.nextEdgeLength;
  const spanConfig = findMinSpanConfig(target);
  const actualDistance = spanConfig.reduce((a, b) => a + b, 0) - input.nextEdgeLength;
  return {
    index: input.insideCorner.index,
    position: input.insideCorner.position,
    spanConfig,
    actualDistance,
  };
}