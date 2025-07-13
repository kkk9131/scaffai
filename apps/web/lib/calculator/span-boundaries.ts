// スパン境界計算モジュール

import { SCAFFOLD_CONSTANTS, NORMAL_PARTS } from './types';
import type { SpanCalculationResult } from './types';

/**
 * 境界線を考慮したスパン計算
 */
export function calculateSpanWithBoundaries(
  widthVal: number,
  eavesForSpanCalc: number,
  mandatorySpecialParts: number[],
  partsMasterList: readonly number[],
  boundaryLeftVal: number | null,
  boundaryRightVal: number | null,
  effectiveTargetMarginLeft: number,
  effectiveTargetMarginRight: number,
  debug: boolean = false
): SpanCalculationResult {
  
  if (debug) {
    console.log(`[DEBUG span-boundaries] 入力:`, {
      widthVal,
      eavesForSpanCalc,
      mandatorySpecialParts,
      boundaryLeftVal,
      boundaryRightVal,
      effectiveTargetMarginLeft,
      effectiveTargetMarginRight
    });
  }

  // 基本スパン計算
  const minRequiredSpan = widthVal + effectiveTargetMarginLeft + effectiveTargetMarginRight;
  
  // 標準部材（1800mm）の基本数量を計算
  const baseCount = Math.floor(minRequiredSpan / SCAFFOLD_CONSTANTS.STANDARD_PART_SIZE);
  const remainder = minRequiredSpan % SCAFFOLD_CONSTANTS.STANDARD_PART_SIZE;
  
  // 追加部材が必要な場合
  const additionalParts: number[] = [...mandatorySpecialParts];
  
  if (remainder > 0) {
    // 余りをカバーする最適な部材を選択
    const bestFit = partsMasterList.find(part => part >= remainder) || partsMasterList[partsMasterList.length - 1];
    additionalParts.push(bestFit);
  }
  
  const totalSpan = baseCount * SCAFFOLD_CONSTANTS.STANDARD_PART_SIZE + 
                   additionalParts.reduce((sum, part) => sum + part, 0);

  if (debug) {
    console.log(`[DEBUG span-boundaries] 計算結果:`, {
      baseCount,
      remainder,
      additionalParts,
      totalSpan
    });
  }

  return {
    base: baseCount * SCAFFOLD_CONSTANTS.STANDARD_PART_SIZE,
    parts: additionalParts,
    total_span: totalSpan
  };
}