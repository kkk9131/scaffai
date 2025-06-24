import { SCAFFOLD_CONSTANTS, NORMAL_PARTS } from './types';
import { SpanCalculationResult } from './types';
import { baseWidth, selectParts } from './utils';
import { calculateInitialMargins } from './margins';

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
  targetMarginLeft: number = DEFAULT_TARGET_MARGIN,
  targetMarginRight: number = DEFAULT_TARGET_MARGIN,
  debugPrints: boolean = true
): SpanCalculationResult {
  
  // 🔥 強制的にデバッグ有効化
  const forceDebug = true;
  
  const base = baseWidth(width);
  const sumOfMandatorySpecial = mandatorySpecialParts.reduce((sum, part) => sum + part, 0);
  
  const maxAllowedL = leftBoundary !== null 
    ? Math.max(0, leftBoundary - BOUNDARY_OFFSET) 
    : Infinity;
  const maxAllowedR = rightBoundary !== null 
    ? Math.max(0, rightBoundary - BOUNDARY_OFFSET) 
    : Infinity;
  
  // 複数のスパンターゲットを試す（個別目標離れ最適化）
  const minPossibleSpan = width + 400; // 最小スパン（軒の出+80 x 2）
  const maxPossibleSpan = width + maxAllowedL + maxAllowedR; // 絶対最大スパン
  
  // 目標スパンの候補を生成（より細かく探索）
  const idealTargetTotalSpan = width + targetMarginLeft + targetMarginRight;
  const spanCandidates = [
    idealTargetTotalSpan - 900, // より小さめ
    idealTargetTotalSpan - 600,
    idealTargetTotalSpan - 300,
    idealTargetTotalSpan - 150, // 細かい調整
    idealTargetTotalSpan,       // 目標値
    idealTargetTotalSpan + 150, // 細かい調整  
    idealTargetTotalSpan + 300,
    idealTargetTotalSpan + 600,
    idealTargetTotalSpan + 900  // より大きめ
  ].filter(span => span >= minPossibleSpan && span <= maxPossibleSpan);
  
  if (forceDebug || debugPrints) {
    console.log(`🎯 [CSB] ===== SPAN OPTIMIZATION START =====`);
    console.log(`🎯 [CSB] Width: ${width}, Target L: ${targetMarginLeft}, Target R: ${targetMarginRight}`);
    console.log(`🎯 [CSB] Ideal total span: ${idealTargetTotalSpan}`);
    console.log(`🎯 [CSB] Span candidates: ${spanCandidates}`);
    console.log(`🎯 [CSB] Mandatory special parts: ${mandatorySpecialParts}, sum: ${sumOfMandatorySpecial}`);
  }
  
  // 各スパン候補に対して最適な部材組み合わせを探索
  let bestOverallCombo: number[] = [];
  let bestOverallScore = Infinity;
  let bestOverallTotalSpan = 0;
  
  // 建物をカバーするのに必要な最小通常部材長
  const minSumNormalForWidthCoverage = Math.max(0, width - base - sumOfMandatorySpecial);
  
  for (const targetSpan of spanCandidates) {
    const targetSumForNormalParts = targetSpan - base - sumOfMandatorySpecial;
    
    if (forceDebug || debugPrints) {
      console.log(`[DEBUG CSB_Revised] Testing target_span=${targetSpan}, target_normal_parts_sum=${targetSumForNormalParts}`);
    }
    
    // この目標スパンに最も近い部材組み合わせを探索
    let bestComboForThisSpan: number[] = [];
    let minDiffForThisSpan = Infinity;
    
    // 通常部材の組み合わせを探索（0個から最大5個まで）
    const maxCombinations = 5;
  
    for (let rCount = 0; rCount <= maxCombinations; rCount++) {
      const combinations = rCount === 0 ? [[]] : generateCombinations([...availableNormalPartsList], rCount);
      
      for (const comboNormal of combinations) {
        const currentSumNormal = comboNormal.reduce((sum, part) => sum + part, 0);
        
        // 条件1: 建物カバーに必要な最小長を満たす
        if (currentSumNormal < minSumNormalForWidthCoverage) {
          continue;
        }
        
        // 目標との差を計算
        const diff = Math.abs(currentSumNormal - targetSumForNormalParts);
        
        if (diff < minDiffForThisSpan) {
          minDiffForThisSpan = diff;
          bestComboForThisSpan = [...comboNormal];
        } else if (diff === minDiffForThisSpan) {
          // 同じ差の場合は1800の数、次に部材数の少なさで優先
          const current1800Count = comboNormal.filter(p => p === STANDARD_PART_SIZE).length;
          const best1800Count = bestComboForThisSpan.filter(p => p === STANDARD_PART_SIZE).length;
          
          if (current1800Count > best1800Count ||
              (current1800Count === best1800Count && comboNormal.length < bestComboForThisSpan.length)) {
            bestComboForThisSpan = [...comboNormal];
          }
        }
      }
    }
    
    // この目標スパンでの最適組み合わせが見つかった場合、実際の離れを計算して評価
    if (bestComboForThisSpan.length >= 0) { // 0個の場合も含める
      const actualTotalSpan = base + sumOfMandatorySpecial + bestComboForThisSpan.reduce((s, p) => s + p, 0);
      
      // 実際の離れを計算
      const [actualMarginLeft, actualMarginRight] = calculateInitialMargins(
        actualTotalSpan,
        width,
        leftBoundary,
        rightBoundary,
        targetMarginLeft,
        targetMarginRight,
        0, 0, false
      );
      
      // 目標離れとの距離を計算（これが最終的な評価基準）
      // より厳密な評価：目標値に近いほど良いスコア
      const leftDiff = Math.abs(actualMarginLeft - targetMarginLeft);
      const rightDiff = Math.abs(actualMarginRight - targetMarginRight);
      const marginScore = leftDiff + rightDiff;
      
      // 両方とも目標以上を満たしている場合はボーナス
      const bothMeetTarget = (actualMarginLeft >= (targetMarginLeft - 50)) && (actualMarginRight >= (targetMarginRight - 50));
      const finalScore = bothMeetTarget ? marginScore * 0.8 : marginScore;
      
      if (forceDebug || debugPrints) {
        console.log(`🎯 [CSB] Target span: ${targetSpan} | Combo: [${bestComboForThisSpan}] | Actual: ${actualTotalSpan}`);
        console.log(`🎯 [CSB] Margins L: ${actualMarginLeft} (target: ${targetMarginLeft}) | R: ${actualMarginRight} (target: ${targetMarginRight})`);
        console.log(`🎯 [CSB] Score: ${marginScore} | Final score: ${finalScore} | Both meet target: ${bothMeetTarget}`);
      }
      
      // 全体の最優秀を更新
      if (finalScore < bestOverallScore) {
        bestOverallScore = finalScore;
        bestOverallCombo = [...bestComboForThisSpan];
        bestOverallTotalSpan = actualTotalSpan;
        
        if (forceDebug || debugPrints) {
          console.log(`🎯 [CSB] ⭐ NEW BEST: Final score=${finalScore} | Span=${actualTotalSpan} | Combo=[${bestOverallCombo}]`);
        }
      }
    }
  }
  
  // フォールバック処理（全体最優秀が見つからなかった場合）
  if (bestOverallScore === Infinity && minSumNormalForWidthCoverage > 0) {
    if (forceDebug || debugPrints) {
      console.log(`[DEBUG CSB_Revised] Fallback: trying to find minimal normal parts for width coverage target ${minSumNormalForWidthCoverage}`);
    }
    
    const fallbackNormalParts = selectParts(minSumNormalForWidthCoverage, availableNormalPartsList);
    
    if (fallbackNormalParts.length > 0) {
      bestOverallCombo = fallbackNormalParts;
      bestOverallTotalSpan = base + sumOfMandatorySpecial + fallbackNormalParts.reduce((s, p) => s + p, 0);
      
      if (forceDebug || debugPrints) {
        console.log(`[DEBUG CSB_Revised] Fallback selected normal parts: ${bestOverallCombo}`);
      }
    }
  } else if (bestOverallScore === Infinity) {
    // 通常部材が不要で、基本部材と特殊部材のみで足りる場合
    bestOverallTotalSpan = base + sumOfMandatorySpecial;
    bestOverallCombo = [];
    
    if (forceDebug || debugPrints) {
      console.log(`[DEBUG CSB_Revised] No normal parts needed, using base + mandatory special only`);
    }
  }
  
  // 最終部材構成
  const finalParts = [...mandatorySpecialParts, ...bestOverallCombo].sort((a, b) => b - a);
  const finalTotalSpan = bestOverallTotalSpan || base + finalParts.reduce((sum, part) => sum + part, 0);
  
  if (forceDebug || debugPrints) {
    console.log(`🎯 [CSB] ===== FINAL RESULT =====`);
    console.log(`🎯 [CSB] Base: ${base} | Final parts: [${finalParts}] | Total span: ${finalTotalSpan}`);
    console.log(`🎯 [CSB] Best overall score: ${bestOverallScore}`);
    console.log(`🎯 [CSB] ===== SPAN OPTIMIZATION END =====`);
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