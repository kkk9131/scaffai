import { FaceDimensionResult, SCAFFOLD_CONSTANTS, NORMAL_PARTS } from './types';
import { calculateSpanWithBoundaries } from './span-boundaries';
import { calculateInitialMargins } from './margins';
import { formatSpanParts } from './utils';

const { 
  BOUNDARY_OFFSET, 
  EAVES_MARGIN_THRESHOLD_ADDITION, 
  STANDARD_PART_SIZE, 
  DEFAULT_TARGET_MARGIN 
} = SCAFFOLD_CONSTANTS;

/**
 * 面の寸法を計算（南北方向または東西方向）
 */
export function calculateFaceDimensions(
  widthVal: number,
  eavesLeftVal: number,
  eavesRightVal: number,
  boundaryLeftVal: number | null,
  boundaryRightVal: number | null,
  use150Val: number,
  use300Val: number,
  use355Val: number,
  partsMasterList: readonly number[],
  targetMarginLeftVal: number | null = DEFAULT_TARGET_MARGIN,
  targetMarginRightVal: number | null = DEFAULT_TARGET_MARGIN,
  faceName: string = "UnknownFace"
): FaceDimensionResult {
  
  const debugPrints = true; // デバッグ出力の制御
  
  if (debugPrints) {
    console.log(`\n--- Calculating for ${faceName} ---`);
    console.log(`[DEBUG ${faceName}] Inputs: width=${widthVal}, eaves_L=${eavesLeftVal}, eaves_R=${eavesRightVal}, bound_L=${boundaryLeftVal}, bound_R=${boundaryRightVal}, target_margin_L=${targetMarginLeftVal}, target_margin_R=${targetMarginRightVal}`);
  }
  
  const eavesForSpanCalc = Math.max(eavesLeftVal, eavesRightVal);
  
  // 左右個別の目標離れの決定（nullの場合は軒の出+80の最小離れのみ）
  const effectiveTargetMarginLeft = targetMarginLeftVal !== null 
    ? targetMarginLeftVal 
    : eavesLeftVal + EAVES_MARGIN_THRESHOLD_ADDITION;
  
  const effectiveTargetMarginRight = targetMarginRightVal !== null 
    ? targetMarginRightVal 
    : eavesRightVal + EAVES_MARGIN_THRESHOLD_ADDITION;
  
  if (debugPrints) {
    console.log(`[DEBUG ${faceName}] Target margins: L=${targetMarginLeftVal} -> effective: ${effectiveTargetMarginLeft}, R=${targetMarginRightVal} -> effective: ${effectiveTargetMarginRight}`);
  }
  
  // 1. ユーザー指定の必須特殊部材リストを作成
  const mandatorySpecialParts: number[] = [];
  const specialParts = [
    { size: 150, count: use150Val },
    { size: 300, count: use300Val },
    { size: 355, count: use355Val }
  ];
  
  for (const { size, count } of specialParts) {
    for (let i = 0; i < count; i++) {
      mandatorySpecialParts.push(size);
    }
  }
  
  // 2. 最適な総スパンと部材構成を計算
  const { base: baseVal, parts: partsVal, total_span: totalVal } = calculateSpanWithBoundaries(
    widthVal,
    eavesForSpanCalc,
    mandatorySpecialParts,
    partsMasterList,
    boundaryLeftVal,
    boundaryRightVal,
    effectiveTargetMarginLeft,
    effectiveTargetMarginRight,
    debugPrints
  );
  
  if (debugPrints) {
    console.log(`[DEBUG ${faceName}] calculateSpanWithBoundaries returned: base=${baseVal}, parts=${partsVal}, total_span=${totalVal}`);
  }
  
  // 3. 確定した総スパンを元に離れを計算・分配
  const [leftMarginInitial, rightMarginInitial] = calculateInitialMargins(
    totalVal,
    widthVal,
    boundaryLeftVal,
    boundaryRightVal,
    effectiveTargetMarginLeft,
    effectiveTargetMarginRight,
    eavesLeftVal,
    eavesRightVal,
    debugPrints
  );
  
  if (debugPrints) {
    console.log(`[DEBUG ${faceName}] calculateInitialMargins returned: L_margin=${leftMarginInitial}, R_margin=${rightMarginInitial}`);
  }
  
  const thresholdLeft = eavesLeftVal + EAVES_MARGIN_THRESHOLD_ADDITION;
  const thresholdRight = eavesRightVal + EAVES_MARGIN_THRESHOLD_ADDITION;
  const currentTotalMarginSpace = Math.max(0, totalVal - widthVal);
  
  const maxAllowedLeft = boundaryLeftVal !== null 
    ? Math.max(0, boundaryLeftVal - BOUNDARY_OFFSET) 
    : Infinity;
  const maxAllowedRight = boundaryRightVal !== null 
    ? Math.max(0, boundaryRightVal - BOUNDARY_OFFSET) 
    : Infinity;
  
  if (debugPrints) {
    console.log(`[DEBUG ${faceName}] thresholds: L=${thresholdLeft}, R=${thresholdRight} | max_allowed: L=${maxAllowedLeft}, R=${maxAllowedRight} | total_margin_space=${currentTotalMarginSpace}`);
  }
  
  // 初期クリッピングと合計調整
  let leftMargin = Math.max(0, Math.min(leftMarginInitial, maxAllowedLeft));
  let rightMargin = Math.max(0, Math.min(rightMarginInitial, maxAllowedRight));
  
  // 合計調整
  if (leftMargin + rightMargin !== currentTotalMarginSpace) {
    if (leftMargin === maxAllowedLeft && boundaryLeftVal !== null) {
      rightMargin = currentTotalMarginSpace - leftMargin;
    } else if (rightMargin === maxAllowedRight && boundaryRightVal !== null) {
      leftMargin = currentTotalMarginSpace - rightMargin;
    } else {
      leftMargin = Math.floor(currentTotalMarginSpace / 2);
      rightMargin = currentTotalMarginSpace - leftMargin;
    }
  }
  
  leftMargin = Math.max(0, Math.min(leftMargin, maxAllowedLeft));
  rightMargin = Math.max(0, Math.min(currentTotalMarginSpace - leftMargin, maxAllowedRight));
  leftMargin = Math.max(0, Math.min(currentTotalMarginSpace - rightMargin, maxAllowedLeft));
  
  if (debugPrints) {
    console.log(`[DEBUG ${faceName}] After initial clip & adjust: L_margin=${leftMargin}, R_margin=${rightMargin}`);
  }
  
  let needsCorrectionFlag = !(leftMargin >= thresholdLeft && rightMargin >= thresholdRight);
  
  if (debugPrints) {
    console.log(`[DEBUG ${faceName}] Initial margins ${needsCorrectionFlag ? 'DO NOT' : 'DO'} meet both thresholds. needs_correction=${needsCorrectionFlag}`);
  }
  
  // 両側境界線がある場合の優先分配ロジック
  if (needsCorrectionFlag && boundaryLeftVal !== null && boundaryRightVal !== null) {
    if (debugPrints) {
      console.log(`[DEBUG ${faceName}] Trying distribution for double boundary.`);
    }
    
    let bestLm = leftMargin;
    let bestRm = rightMargin;
    let bothThresholdsMetByCandidate = false;
    
    // 試行1: 右側優先
    if (maxAllowedRight >= thresholdRight) {
      const testR1a = maxAllowedRight;
      const testL1a = currentTotalMarginSpace - testR1a;
      
      if (testL1a >= 0 && testL1a <= maxAllowedLeft && testL1a >= thresholdLeft) {
        if (!bothThresholdsMetByCandidate) {
          bestLm = testL1a;
          bestRm = testR1a;
          bothThresholdsMetByCandidate = true;
        }
        if (debugPrints) {
          console.log(`[DEBUG ${faceName}] Option DB R-1a (both meet): L=${testL1a}, R=${testR1a}`);
        }
      }
      
      if (!bothThresholdsMetByCandidate) {
        const testR1b = thresholdRight;
        const testL1b = currentTotalMarginSpace - testR1b;
        
        if (testL1b >= 0 && testL1b <= maxAllowedLeft) {
          if (testL1b >= thresholdLeft) {
            bestLm = testL1b;
            bestRm = testR1b;
            bothThresholdsMetByCandidate = true;
          } else if (!(bestLm >= thresholdLeft && bestRm >= thresholdRight)) {
            bestLm = testL1b;
            bestRm = testR1b;
          }
          if (debugPrints) {
            console.log(`[DEBUG ${faceName}] Option DB R-1b (L ${testL1b >= thresholdLeft ? '>=' : '<'} thresh): L=${testL1b}, R=${testR1b}`);
          }
        }
      }
    }
    
    // 試行2: 左側優先
    if (!bothThresholdsMetByCandidate && maxAllowedLeft >= thresholdLeft) {
      const testL2a = maxAllowedLeft;
      const testR2a = currentTotalMarginSpace - testL2a;
      
      if (testR2a >= 0 && testR2a <= maxAllowedRight && testR2a >= thresholdRight) {
        if (!bothThresholdsMetByCandidate) {
          bestLm = testL2a;
          bestRm = testR2a;
          bothThresholdsMetByCandidate = true;
        }
        if (debugPrints) {
          console.log(`[DEBUG ${faceName}] Option DB L-2a (both meet): L=${testL2a}, R=${testR2a}`);
        }
      }
      
      if (!bothThresholdsMetByCandidate) {
        const testL2b = thresholdLeft;
        const testR2b = currentTotalMarginSpace - testL2b;
        
        if (testR2b >= 0 && testR2b <= maxAllowedRight) {
          if (testR2b >= thresholdRight) {
            bestLm = testL2b;
            bestRm = testR2b;
            bothThresholdsMetByCandidate = true;
          } else if (!(bestLm >= thresholdLeft && bestRm >= thresholdRight)) {
            if (!(bestLm >= thresholdLeft) || testR2b > bestRm) {
              bestLm = testL2b;
              bestRm = testR2b;
            }
          }
          if (debugPrints) {
            console.log(`[DEBUG ${faceName}] Option DB L-2b (R ${testR2b >= thresholdRight ? '>=' : '<'} thresh): L=${testL2b}, R=${testR2b}`);
          }
        }
      }
    }
    
    leftMargin = bestLm;
    rightMargin = bestRm;
    
    if (bothThresholdsMetByCandidate) {
      needsCorrectionFlag = false;
    }
    
    if (debugPrints && !needsCorrectionFlag) {
      console.log(`[DEBUG ${faceName}] Solved by double boundary distribution. needs_correction=false`);
    }
  } else if (needsCorrectionFlag) {
    if (debugPrints) {
      console.log(`[DEBUG ${faceName}] Trying distribution for single/no boundary.`);
    }
    
    if (boundaryLeftVal !== null && boundaryRightVal === null) {
      // 左のみ境界
      leftMargin = maxAllowedLeft >= thresholdLeft ? thresholdLeft : maxAllowedLeft;
      rightMargin = Math.max(0, currentTotalMarginSpace - leftMargin);
    } else if (boundaryLeftVal === null && boundaryRightVal !== null) {
      // 右のみ境界
      rightMargin = maxAllowedRight >= thresholdRight ? thresholdRight : maxAllowedRight;
      leftMargin = Math.max(0, currentTotalMarginSpace - rightMargin);
    }
  }
  
  // 最終調整
  leftMargin = Math.max(0, Math.min(leftMargin, maxAllowedLeft));
  rightMargin = Math.max(0, Math.min(rightMargin, maxAllowedRight));
  
  if (leftMargin + rightMargin !== currentTotalMarginSpace && currentTotalMarginSpace >= 0) {
    if (leftMargin === maxAllowedLeft && boundaryLeftVal !== null) {
      rightMargin = currentTotalMarginSpace - leftMargin;
    } else {
      leftMargin = currentTotalMarginSpace - rightMargin;
    }
  }
  
  leftMargin = Math.max(0, Math.min(leftMargin, maxAllowedLeft));
  rightMargin = Math.max(0, Math.min(rightMargin, maxAllowedRight));
  
  if (debugPrints) {
    console.log(`[DEBUG ${faceName}] After all distribution attempts: L_margin=${leftMargin}, R_margin=${rightMargin}`);
  }
  
  // 最終チェック
  needsCorrectionFlag = !(leftMargin >= thresholdLeft && rightMargin >= thresholdRight);
  
  if (debugPrints) {
    console.log(`[DEBUG ${faceName}] Final check: ${needsCorrectionFlag ? 'At least one threshold NOT met' : 'Both thresholds met'}. needs_correction=${needsCorrectionFlag}`);
  }
  
  const originalLeftMargin = leftMargin;
  const originalRightMargin = rightMargin;
  
  // 補正部材の計算
  let correctionPartVal: number | null = null;
  let corrValForLeftNoteStr: number | null = null;
  let corrValForRightNoteStr: number | null = null;
  
  if (needsCorrectionFlag) {
    const candidates = [150, 300, 355, 600, 900];
    
    if (originalLeftMargin < thresholdLeft) {
      for (const pCorr of candidates) {
        if (originalLeftMargin + pCorr >= thresholdLeft) {
          corrValForLeftNoteStr = pCorr;
          break;
        }
      }
      if (corrValForLeftNoteStr === null && candidates.length > 0) {
        corrValForLeftNoteStr = candidates[candidates.length - 1] || null;
      }
    }
    
    if (originalRightMargin < thresholdRight) {
      for (const pCorr of candidates) {
        if (originalRightMargin + pCorr >= thresholdRight) {
          corrValForRightNoteStr = pCorr;
          break;
        }
      }
      if (corrValForRightNoteStr === null && candidates.length > 0) {
        corrValForRightNoteStr = candidates[candidates.length - 1] || null;
      }
    }
    
    if (corrValForLeftNoteStr && corrValForRightNoteStr) {
      correctionPartVal = Math.max(corrValForLeftNoteStr, corrValForRightNoteStr);
    } else if (corrValForLeftNoteStr) {
      correctionPartVal = corrValForLeftNoteStr;
    } else if (corrValForRightNoteStr) {
      correctionPartVal = corrValForRightNoteStr;
    }
    
    if (debugPrints) {
      console.log(`[DEBUG ${faceName}] Needs correction. L_corr_note=${corrValForLeftNoteStr}, R_corr_note=${corrValForRightNoteStr}, span_text_corr_val=${correctionPartVal}`);
    }
  }
  
  // スパン構成テキストの生成
  const basePartsForFormat = Array(Math.floor(baseVal / STANDARD_PART_SIZE)).fill(STANDARD_PART_SIZE);
  const combinedPartsForFormat = [...basePartsForFormat, ...partsVal];
  let spanPartsText = formatSpanParts(combinedPartsForFormat);
  
  // 離れ注記の生成
  let leftNoteStr = `${originalLeftMargin} mm`;
  if (originalLeftMargin < thresholdLeft && corrValForLeftNoteStr !== null) {
    leftNoteStr += `(+${corrValForLeftNoteStr})`;
  }
  
  let rightNoteStr = `${originalRightMargin} mm`;
  if (originalRightMargin < thresholdRight && corrValForRightNoteStr !== null) {
    rightNoteStr += `(+${corrValForRightNoteStr})`;
  }
  
  // スパン構成テキストの補正表示
  if (needsCorrectionFlag && correctionPartVal !== null) {
    const prefixStr = (originalLeftMargin < thresholdLeft && corrValForLeftNoteStr === correctionPartVal) 
      ? `(+${correctionPartVal})` : "";
    const suffixStr = (originalRightMargin < thresholdRight && corrValForRightNoteStr === correctionPartVal) 
      ? `(+${correctionPartVal})` : "";
    
    const currentSpanElements = spanPartsText.split(', ');
    
    if (prefixStr && suffixStr && prefixStr === suffixStr) {
      spanPartsText = `${prefixStr}, ${spanPartsText}, ${correctionPartVal}${suffixStr}`;
    } else if (prefixStr) {
      spanPartsText = `${prefixStr}, ${spanPartsText}`;
    } else if (suffixStr) {
      const lastElement = currentSpanElements[currentSpanElements.length - 1];
      if (currentSpanElements.length > 0 && lastElement && /^\d+$/.test(lastElement.replace('span', ''))) {
        currentSpanElements[currentSpanElements.length - 1] = `${lastElement}${suffixStr}`;
        spanPartsText = currentSpanElements.join(', ');
      } else {
        spanPartsText = `${spanPartsText}, ${correctionPartVal}${suffixStr}`;
      }
    }
  }
  
  if (debugPrints) {
    console.log(`[DEBUG ${faceName}] Final Notes: L='${leftNoteStr}', R='${rightNoteStr}' | Span Text='${spanPartsText}'`);
    console.log(`--- End Calculating for ${faceName} ---\n`);
  }
  
  return {
    total_span: totalVal,
    span_parts_text: spanPartsText,
    left_margin: originalLeftMargin,
    right_margin: originalRightMargin,
    left_note: leftNoteStr,
    right_note: rightNoteStr
  };
}