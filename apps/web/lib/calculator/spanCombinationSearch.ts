// 標準部材リスト
const STANDARD_PARTS = [1800, 1500, 1200, 900, 600];

/**
 * 指定した長さ以上となる最小のスパン構成を探索
 * @param target 必要なスパン長さ（mm）
 * @param maxCount 最大本数（デフォルト10本）
 * @returns 最適なスパン構成（例: [1800, 1800, 1200]）
 */
export function findMinSpanCombination(target: number, maxCount = 10): number[] {
  let best: number[] = [];
  let minTotal = Infinity;
  for (let count = 1; count <= maxCount; count++) {
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

// 重複あり順列（再帰的に全パターン生成）
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