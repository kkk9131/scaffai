import { SCAFFOLD_CONSTANTS, NORMAL_PARTS } from './types';
import { SpanCalculationResult } from './types';
import { baseWidth, selectParts } from './utils';

const { 
  BOUNDARY_OFFSET, 
  PREFERRED_MIN_MARGIN_ADDITION,
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
  targetMarginLeft: number = DEFAULT_TARGET_MARGIN,
  targetMarginRight: number = DEFAULT_TARGET_MARGIN,
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
  
  // 境界制約がない場合は目標離れを優先、ある場合は制約内での最大値を使用
  const effectiveTargetL = leftBoundary !== null ? Math.min(targetMarginLeft, maxAllowedL) : targetMarginLeft;
  const effectiveTargetR = rightBoundary !== null ? Math.min(targetMarginRight, maxAllowedR) : targetMarginRight;
  const idealTargetTotalSpan = width + effectiveTargetL + effectiveTargetR;
  const absoluteMaxTotalSpan = width + maxAllowedL + maxAllowedR;
  
  if (debugPrints) {
    console.log(`[DEBUG CSB_Revised] ideal_target_total_span=${idealTargetTotalSpan}, absolute_max_total_span=${absoluteMaxTotalSpan}`);
    console.log(`[DEBUG CSB_Revised] target_margins: L=${targetMarginLeft}, R=${targetMarginRight}, effective: L=${effectiveTargetL}, R=${effectiveTargetR}`);
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
  
  // 通常部材の組み合わせを探索（境界制約なしの場合は上限を拡張）
  const hasNoBoundary = leftBoundary === null && rightBoundary === null;
  const maxCombinations = hasNoBoundary ? 6 : 4;  // 境界制約なしなら6個まで
  
  for (let rCount = 0; rCount <= maxCombinations; rCount++) {
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
      
      if (hasNoBoundary) {
        // 境界制約なし: 理想値以上で最小の組み合わせを選択（1800優先は二次的）
        if (currentSumNormal >= targetSumForNormalPartsIdeal) {
          const bestSum = bestComboNormalParts.reduce((sum, part) => sum + part, 0);
          const current1800Count = comboNormal.filter(p => p === STANDARD_PART_SIZE).length;
          const best1800Count = bestComboNormalParts.filter(p => p === STANDARD_PART_SIZE).length;
          
          if (bestComboNormalParts.length === 0 || 
              currentSumNormal < bestSum ||
              (currentSumNormal === bestSum && current1800Count > best1800Count) ||
              (currentSumNormal === bestSum && current1800Count === best1800Count && 
               comboNormal.length < bestComboNormalParts.length)) {
            bestComboNormalParts = [...comboNormal];
          }
        }
      } else {
        // 境界制約あり: 理想値への近さで評価、1800優先
        const diff = Math.abs(currentSumNormal - targetSumForNormalPartsIdeal);
        const current1800Count = comboNormal.filter(p => p === STANDARD_PART_SIZE).length;
        const best1800Count = bestComboNormalParts.filter(p => p === STANDARD_PART_SIZE).length;
        
        if (diff < minAbsDiffToTargetSumNormal) {
          minAbsDiffToTargetSumNormal = diff;
          bestComboNormalParts = [...comboNormal];
        } else if (diff === minAbsDiffToTargetSumNormal) {
          // 同じ差の場合は1800の数、次に部材数の少なさで優先
          if (current1800Count > best1800Count ||
              (current1800Count === best1800Count && comboNormal.length < bestComboNormalParts.length)) {
            bestComboNormalParts = [...comboNormal];
          }
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
  
  // 境界制約なしで理想値に達していない場合は、理想値以上の最小組み合わせを強制選択
  if (hasNoBoundary && bestComboNormalParts.length === 0) {
    if (debugPrints) {
      console.log(`[DEBUG CSB_Revised] No valid combination found, searching for minimum above ideal: ${targetSumForNormalPartsIdeal}`);
    }
    
    // 理想値以上の最小組み合わせを直接探索
    let minValidSum = Infinity;
    let minValidCombo: number[] = [];
    
    for (let rCount = 1; rCount <= 6; rCount++) {
      const combinations = generateCombinations([...availableNormalPartsList], rCount);
      for (const combo of combinations) {
        const comboSum = combo.reduce((sum, part) => sum + part, 0);
        if (comboSum >= targetSumForNormalPartsIdeal && comboSum < minValidSum) {
          minValidSum = comboSum;
          minValidCombo = [...combo];
        }
      }
    }
    
    if (minValidCombo.length > 0) {
      bestComboNormalParts = minValidCombo;
      if (debugPrints) {
        console.log(`[DEBUG CSB_Revised] Found minimum valid combination: ${bestComboNormalParts}, sum=${minValidSum}`);
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