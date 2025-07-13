// 離れ計算モジュール

import { SCAFFOLD_CONSTANTS } from './types';

/**
 * 初期離れを計算
 */
export function calculateInitialMargins(
  totalSpan: number,
  widthVal: number,
  boundaryLeftVal: number | null,
  boundaryRightVal: number | null,
  effectiveTargetMarginLeft: number,
  effectiveTargetMarginRight: number,
  eavesLeftVal: number,
  eavesRightVal: number,
  debug: boolean = false
): [number, number] {
  
  if (debug) {
    console.log(`[DEBUG margins] 入力:`, {
      totalSpan,
      widthVal,
      boundaryLeftVal,
      boundaryRightVal,
      effectiveTargetMarginLeft,
      effectiveTargetMarginRight,
      eavesLeftVal,
      eavesRightVal
    });
  }

  const totalMarginSpace = Math.max(0, totalSpan - widthVal);
  
  // 境界線制約を考慮した最大離れ
  const maxAllowedLeft = boundaryLeftVal !== null 
    ? Math.max(0, boundaryLeftVal - SCAFFOLD_CONSTANTS.BOUNDARY_OFFSET) 
    : Infinity;
  const maxAllowedRight = boundaryRightVal !== null 
    ? Math.max(0, boundaryRightVal - SCAFFOLD_CONSTANTS.BOUNDARY_OFFSET) 
    : Infinity;

  // 目標離れに基づく初期分配
  const targetRatio = effectiveTargetMarginLeft / (effectiveTargetMarginLeft + effectiveTargetMarginRight);
  
  let leftMargin = totalMarginSpace * targetRatio;
  let rightMargin = totalMarginSpace - leftMargin;
  
  // 境界線制約を適用
  leftMargin = Math.min(leftMargin, maxAllowedLeft);
  rightMargin = Math.min(rightMargin, maxAllowedRight);
  
  // 合計が一致するように調整
  const actualTotal = leftMargin + rightMargin;
  if (actualTotal < totalMarginSpace) {
    const deficit = totalMarginSpace - actualTotal;
    
    if (leftMargin < maxAllowedLeft) {
      const additionalLeft = Math.min(deficit, maxAllowedLeft - leftMargin);
      leftMargin += additionalLeft;
      rightMargin += deficit - additionalLeft;
    } else if (rightMargin < maxAllowedRight) {
      rightMargin += deficit;
    }
  }

  if (debug) {
    console.log(`[DEBUG margins] 結果:`, {
      leftMargin,
      rightMargin,
      totalMarginSpace,
      maxAllowedLeft,
      maxAllowedRight
    });
  }

  return [leftMargin, rightMargin];
}