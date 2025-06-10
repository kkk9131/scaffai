import { SCAFFOLD_CONSTANTS, NORMAL_PARTS } from './types';
import { SpanCalculationResult } from './types';
import { baseWidth, selectParts } from './utils';

const { 
  BOUNDARY_OFFSET, 
  STANDARD_PART_SIZE, 
  DEFAULT_TARGET_MARGIN 
} = SCAFFOLD_CONSTANTS;

/**
 * 境界条件を考慮したスパン計算（改訂版）
 */
export function calculateSpanWithBoundaries(
  width: number,
  eaves: number,
  mandatorySpecialParts: number[],
  availableNormalPartsList: readonly number[],
  leftBoundary: number | null = null,
  rightBoundary: number | null = null,
  targetMargin: number = DEFAULT_TARGET_MARGIN,
  debugPrints: boolean = false
): SpanCalculationResult {
  
  const base = baseWidth(width);
  const sumOfMandatorySpecial = mandatorySpecialParts.reduce((sum, part) => sum + part, 0);
  
  const maxAllowedL = leftBoundary !== null 
    ? Math.max(0, leftBoundary - BOUNDARY_OFFSET) 
    : Infinity;
  const maxAllowedR = rightBoundary !== null 
    ? Math.max(0, rightBoundary - BOUNDARY_OFFSET) 
    : Infinity;
  
  const effectiveTargetL = Math.min(targetMargin, maxAllowedL);
  const effectiveTargetR = Math.min(targetMargin, maxAllowedR);
  const idealTargetTotalSpan = width + effectiveTargetL + effectiveTargetR;
  const absoluteMaxTotalSpan = width + maxAllowedL + maxAllowedR;
  
  if (debugPrints) {
    console.log(`[DEBUG CSB_Revised] ideal_target_total_span=${idealTargetTotalSpan}, absolute_max_total_span=${absoluteMaxTotalSpan}`);
    console.log(`[DEBUG CSB_Revised] mandatory_special_parts=${mandatorySpecialParts}, sum_mandatory_special=${sumOfMandatorySpecial}`);
  }
  
  // 理想的な通常部材の合計長
  const targetSumForNormalPartsIdeal = idealTargetTotalSpan - base - sumOfMandatorySpecial;
  
  if (debugPrints) {
    console.log(`[DEBUG CSB_Revised] target_sum_for_normal_parts (ideal)=${targetSumForNormalPartsIdeal}`);
  }
  
  // 建物をカバーするのに必要な最小通常部材長
  const minSumNormalForWidthCoverage = Math.max(0, width - base - sumOfMandatorySpecial);
  
  // 絶対最大スパンから計算される通常部材の上限
  const maxSumForNormalPartsAbsolute = Math.max(0, absoluteMaxTotalSpan - base - sumOfMandatorySpecial);
  
  let bestComboNormalParts: number[] = [];
  let minAbsDiffToTargetSumNormal = Infinity;
  
  // 通常部材の組み合わせを探索（0個から4個まで）
  for (let rCount = 0; rCount <= 4; rCount++) {
    const combinations = generateCombinations([...availableNormalPartsList], rCount);
    
    for (const comboNormal of combinations) {
      const currentSumNormal = comboNormal.reduce((sum, part) => sum + part, 0);
      
      // 条件1: 建物カバーに必要な最小長を満たす
      if (currentSumNormal < minSumNormalForWidthCoverage) {
        continue;
      }
      
      // 条件2: 絶対最大スパンを超えない
      if (currentSumNormal > maxSumForNormalPartsAbsolute) {
        continue;
      }
      
      // 理想値への近さで評価
      const diff = Math.abs(currentSumNormal - targetSumForNormalPartsIdeal);
      
      if (diff < minAbsDiffToTargetSumNormal) {
        minAbsDiffToTargetSumNormal = diff;
        bestComboNormalParts = [...comboNormal];
      } else if (diff === minAbsDiffToTargetSumNormal) {
        // 同じ差の場合は部材数が少ない、または1800が多い構成を優先
        if (comboNormal.length < bestComboNormalParts.length ||
            (comboNormal.length === bestComboNormalParts.length &&
             comboNormal.filter(p => p === STANDARD_PART_SIZE).length >
             bestComboNormalParts.filter(p => p === STANDARD_PART_SIZE).length)) {
          bestComboNormalParts = [...comboNormal];
        }
      }
    }
  }
  
  // フォールバック処理
  if (bestComboNormalParts.length === 0 && minSumNormalForWidthCoverage > 0) {
    if (debugPrints) {
      console.log(`[DEBUG CSB_Revised] Fallback: trying to find minimal normal parts for width coverage target ${minSumNormalForWidthCoverage}`);
    }
    
    const fallbackNormalParts = selectParts(minSumNormalForWidthCoverage, availableNormalPartsList);
    
    if (fallbackNormalParts.length > 0) {
      const fallbackSum = fallbackNormalParts.reduce((sum, part) => sum + part, 0);
      if (base + sumOfMandatorySpecial + fallbackSum <= absoluteMaxTotalSpan) {
        bestComboNormalParts = fallbackNormalParts;
        
        if (debugPrints) {
          console.log(`[DEBUG CSB_Revised] Fallback selected normal parts: ${bestComboNormalParts}`);
        }
      }
    }
  }
  
  // 最終部材構成
  const finalParts = [...mandatorySpecialParts, ...bestComboNormalParts].sort((a, b) => b - a);
  const finalTotalSpan = base + finalParts.reduce((sum, part) => sum + part, 0);
  
  if (debugPrints) {
    console.log(`[DEBUG CSB_Revised] Selected: base=${base}, final_parts=${finalParts}, final_total_span=${finalTotalSpan}`);
  }
  
  return {
    base,
    parts: finalParts,
    total_span: finalTotalSpan
  };
}

/**
 * 配列の組み合わせを生成（重複あり）
 */
function generateCombinations(arr: number[], size: number): number[][] {
  if (size === 0) return [[]];
  if (size === 1) return arr.map(item => [item]);
  
  const result: number[][] = [];
  
  function combine(current: number[], depth: number) {
    if (depth === size) {
      result.push([...current]);
      return;
    }
    
    for (const item of arr) {
      current.push(item);
      combine(current, depth + 1);
      current.pop();
    }
  }
  
  combine([], 0);
  return result;
}