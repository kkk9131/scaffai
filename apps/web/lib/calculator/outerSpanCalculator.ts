// apps/web/lib/calculator/outerSpanCalculator.ts

export type OuterSpanInput = {
    buildingLength: number; // 建物長さ（mm）
    eave: number;           // 軒の出（mm）
  };
  
  export type OuterSpanResult = {
    totalSpan: number;      // 足場総スパン
    minRequiredDistance: number; // 最小離れ
    spanConfig: number[];   // スパン構成
    actualDistance: number; // 実際の離れ
  };
  
  const STANDARD_PARTS = [1800, 1500, 1200, 900, 600];
  const SAFETY_MARGIN = 80;
  
  // 指定した長さ以上となる最小のスパン構成を探索
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
  
  // 重複あり組み合わせ生成
  function generateCombinations(parts: number[], count: number): number[][] {
    if (count === 1) return parts.map(p => [p]);
    const result: number[][] = [];
    for (const p of parts) {
      for (const sub of generateCombinations(parts, count - 1)) {
        result.push([p, ...sub]);
      }
    }
    return result;
  }
  
  export function calcOuterSpan(input: OuterSpanInput): OuterSpanResult {
    const minRequiredDistance = input.eave + SAFETY_MARGIN;
    const totalSpanTarget = input.buildingLength + minRequiredDistance * 2;
    const spanConfig = findMinSpanConfig(totalSpanTarget);
    const totalSpan = spanConfig.reduce((a, b) => a + b, 0);
    const actualDistance = (totalSpan - input.buildingLength) / 2;
    return {
      totalSpan,
      minRequiredDistance,
      spanConfig,
      actualDistance,
    };
  }