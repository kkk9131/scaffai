import { SCAFFOLD_CONSTANTS } from './types';

const { 
  BOUNDARY_OFFSET, 
  DEFAULT_TARGET_MARGIN 
} = SCAFFOLD_CONSTANTS;

/**
 * 初期マージンを計算
 */
export function calculateInitialMargins(
  currentTotalSpan: number,
  width: number,
  leftBoundaryVal: number | null,
  rightBoundaryVal: number | null,
  targetMarginVal: number = DEFAULT_TARGET_MARGIN,
  eavesLeftForThreshold: number = 0,
  eavesRightForThreshold: number = 0,
  debugPrints: boolean = false
): [number, number] {
  
  if (debugPrints) {
    console.log(`[DEBUG] calculateInitialMargins: total_span=${currentTotalSpan}, width=${width}, L_b=${leftBoundaryVal}, R_b=${rightBoundaryVal}, target=${targetMarginVal}`);
  }
  
  let availableMarginTotal = currentTotalSpan - width;
  if (availableMarginTotal < 0) availableMarginTotal = 0;
  
  if (debugPrints) {
    console.log(`[DEBUG] calculateInitialMargins: available_margin_total=${availableMarginTotal}`);
  }
  
  let leftGap = Math.floor(availableMarginTotal / 2);
  let rightGap = availableMarginTotal - leftGap;
  
  if (debugPrints) {
    console.log(`[DEBUG] calculateInitialMargins: initial L_gap=${leftGap}, R_gap=${rightGap}`);
  }
  
  // 境界線がない場合の処理
  if (leftBoundaryVal === null && rightBoundaryVal === null) {
    const baseMarginHalf = Math.floor(availableMarginTotal / 2);
    
    if (baseMarginHalf <= targetMarginVal) {
      leftGap = rightGap = baseMarginHalf;
    } else {
      leftGap = rightGap = targetMarginVal;
      const surplus = availableMarginTotal - (targetMarginVal * 2);
      
      if (surplus > 0) {
        leftGap += Math.floor(surplus / 2);
        rightGap += surplus - Math.floor(surplus / 2);
      }
    }
    
    if (debugPrints) {
      console.log(`[DEBUG] calculateInitialMargins (no boundary): final L_gap=${leftGap}, R_gap=${rightGap}`);
    }
    
    return [leftGap, rightGap];
  }
  
  // 境界線制約の処理
  const maxAllowedLeft = leftBoundaryVal !== null 
    ? Math.max(0, leftBoundaryVal - BOUNDARY_OFFSET) 
    : Infinity;
  const maxAllowedRight = rightBoundaryVal !== null 
    ? Math.max(0, rightBoundaryVal - BOUNDARY_OFFSET) 
    : Infinity;
  
  if (debugPrints) {
    console.log(`[DEBUG] calculateInitialMargins: max_L_allow=${maxAllowedLeft}, max_R_allow=${maxAllowedRight}`);
  }
  
  leftGap = Math.max(0, Math.min(leftGap, maxAllowedLeft));
  rightGap = Math.max(0, Math.min(rightGap, maxAllowedRight));
  
  if (debugPrints) {
    console.log(`[DEBUG] calculateInitialMargins (after initial clip): L_gap=${leftGap}, R_gap=${rightGap}`);
  }
  
  // 合計調整
  if (leftGap + rightGap !== availableMarginTotal) {
    if (debugPrints) {
      console.log(`[DEBUG] calculateInitialMargins: sum L+R (${leftGap + rightGap}) != available (${availableMarginTotal}), adjusting...`);
    }
    
    if (leftGap === maxAllowedLeft && leftBoundaryVal !== null) {
      rightGap = availableMarginTotal - leftGap;
    } else if (rightGap === maxAllowedRight && rightBoundaryVal !== null) {
      leftGap = availableMarginTotal - rightGap;
    } else {
      leftGap = Math.floor(availableMarginTotal / 2);
      rightGap = availableMarginTotal - leftGap;
      
      leftGap = Math.max(0, Math.min(leftGap, maxAllowedLeft));
      rightGap = Math.max(0, Math.min(rightGap, maxAllowedRight));
      
      if (leftGap + rightGap !== availableMarginTotal) {
        if (leftGap === maxAllowedLeft && leftBoundaryVal !== null) {
          rightGap = availableMarginTotal - leftGap;
        } else {
          leftGap = availableMarginTotal - rightGap;
        }
      }
    }
    
    if (debugPrints) {
      console.log(`[DEBUG] calculateInitialMargins: Re-adjusted to L_gap=${leftGap}, R_gap=${rightGap}`);
    }
  }
  
  leftGap = Math.max(0, Math.min(leftGap, maxAllowedLeft));
  rightGap = Math.max(0, Math.min(rightGap, maxAllowedRight));
  
  if (debugPrints) {
    console.log(`[DEBUG] calculateInitialMargins (final): L_gap=${leftGap}, R_gap=${rightGap}`);
  }
  
  return [leftGap, rightGap];
}