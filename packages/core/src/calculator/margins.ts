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
  targetMarginLeftVal: number = DEFAULT_TARGET_MARGIN,
  targetMarginRightVal: number = DEFAULT_TARGET_MARGIN,
  eavesLeftForThreshold: number = 0,
  eavesRightForThreshold: number = 0,
  debugPrints: boolean = false
): [number, number] {
  
  if (debugPrints) {
    console.log(`[DEBUG] calculateInitialMargins: total_span=${currentTotalSpan}, width=${width}, L_b=${leftBoundaryVal}, R_b=${rightBoundaryVal}, target_L=${targetMarginLeftVal}, target_R=${targetMarginRightVal}`);
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
    // 左右で異なる目標離れを考慮した精密配分
    const totalTargetMargin = targetMarginLeftVal + targetMarginRightVal;
    
    if (debugPrints) {
      console.log(`[DEBUG] calculateInitialMargins: total_target=${totalTargetMargin}, available=${availableMarginTotal}`);
    }
    
    if (availableMarginTotal <= totalTargetMargin) {
      // 利用可能な余裕が目標離れの合計以下の場合、比例配分
      if (totalTargetMargin > 0) {
        const ratio = availableMarginTotal / totalTargetMargin;
        leftGap = Math.round(targetMarginLeftVal * ratio);
        rightGap = availableMarginTotal - leftGap;
      } else {
        leftGap = Math.floor(availableMarginTotal / 2);
        rightGap = availableMarginTotal - leftGap;
      }
      
      if (debugPrints) {
        console.log(`[DEBUG] calculateInitialMargins: proportional allocation (ratio=${availableMarginTotal / totalTargetMargin})`);
      }
    } else {
      // 余裕が十分にある場合、目標離れを満たしてから余剰を配分
      leftGap = targetMarginLeftVal;
      rightGap = targetMarginRightVal;
      const surplus = availableMarginTotal - totalTargetMargin;
      
      if (surplus > 0) {
        // 余剰を目標離れの比率で配分（より精密に）
        if (totalTargetMargin > 0) {
          const leftRatio = targetMarginLeftVal / totalTargetMargin;
          const additionalLeft = Math.round(surplus * leftRatio);
          leftGap += additionalLeft;
          rightGap += surplus - additionalLeft;
        } else {
          // 両方とも目標0の場合は等分
          const additionalEach = Math.floor(surplus / 2);
          leftGap += additionalEach;
          rightGap += surplus - additionalEach;
        }
      }
      
      if (debugPrints) {
        console.log(`[DEBUG] calculateInitialMargins: target satisfied, surplus=${surplus} distributed`);
      }
    }
    
    if (debugPrints) {
      console.log(`[DEBUG] calculateInitialMargins (no boundary): final L_gap=${leftGap}, R_gap=${rightGap}`);
    }
    
    return [leftGap, rightGap];
  }
  
  // 境界線制約の処理（個別目標離れを考慮）
  const maxAllowedLeft = leftBoundaryVal !== null 
    ? Math.max(0, leftBoundaryVal - BOUNDARY_OFFSET) 
    : Infinity;
  const maxAllowedRight = rightBoundaryVal !== null 
    ? Math.max(0, rightBoundaryVal - BOUNDARY_OFFSET) 
    : Infinity;
  
  if (debugPrints) {
    console.log(`[DEBUG] calculateInitialMargins: max_L_allow=${maxAllowedLeft}, max_R_allow=${maxAllowedRight}`);
  }
  
  // 個別目標離れを考慮した初期分配
  const totalTargetMargin = targetMarginLeftVal + targetMarginRightVal;
  
  if (totalTargetMargin > 0 && availableMarginTotal >= totalTargetMargin) {
    // 目標離れが達成可能な場合、まず目標値を基準に分配
    leftGap = targetMarginLeftVal;
    rightGap = targetMarginRightVal;
    
    const surplus = availableMarginTotal - totalTargetMargin;
    if (surplus > 0) {
      const leftRatio = targetMarginLeftVal / totalTargetMargin;
      const additionalLeft = Math.round(surplus * leftRatio);
      leftGap += additionalLeft;
      rightGap += surplus - additionalLeft;
    }
    
    if (debugPrints) {
      console.log(`[DEBUG] calculateInitialMargins: target-based allocation before boundary clip: L=${leftGap}, R=${rightGap}`);
    }
  } else {
    // 従来通りの等分配
    leftGap = Math.floor(availableMarginTotal / 2);
    rightGap = availableMarginTotal - leftGap;
    
    if (debugPrints) {
      console.log(`[DEBUG] calculateInitialMargins: equal allocation before boundary clip: L=${leftGap}, R=${rightGap}`);
    }
  }
  
  // 境界線制約でクリップ
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