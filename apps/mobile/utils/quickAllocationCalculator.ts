/**
 * 簡易割付計算ユーティリティ
 * 
 * 計算式: 現在の離れ ＋ 割付距離 － 足場スパン構成 ＝ 割付先の離れ
 * 目標: 制約を満たす中で最小の離れとなる足場スパン構成を選択
 */

export interface QuickAllocationInput {
  currentDistance: number;      // 現在の離れ (mm)
  allocationDistance: number;   // 割付距離 (mm)
  eaveOutput: number;          // 軒の出 (mm)
  boundaryLine: number;        // 境界線 (mm)
  cornerType: 'inside' | 'outside';  // 入隅・出隅
  specialMaterials: {          // 特殊部材使用
    material355: boolean;
    material300: boolean;
    material150: boolean;
  };
  targetDistance?: number;      // 目標離れ (mm) - オプショナル
}

export interface QuickAllocationResult {
  success: boolean;
  resultDistance: number | null;        // 割付先の離れ
  spanConfiguration: number[] | null;   // 足場スパン構成
  spanComposition: string | null;       // スパン構成テキスト
  needsCorrection: boolean;             // 補正が必要かどうか
  correctionParts: number[] | null;     // 補正部材
  correctionAmount: number | null;      // 補正量
  correctionMessage?: string;           // 補正メッセージ
  errorMessage?: string;
}

// 利用可能な足場部材（標準部材）
const STANDARD_PARTS = [1800, 1500, 1200, 900, 600];

// 補正部材（小さな部材）
const CORRECTION_PARTS = [300, 150];

// 制約定数
const EAVE_MARGIN_ADDITION = 80;  // 軒の出 + 80mm
const BOUNDARY_OFFSET = 60;       // 境界線 - 60mm

/**
 * 指定個数の部材組み合わせを生成
 * 特殊部材（355, 300, 150）は1種類につき1回まで使用可能
 */
function generateCombinations(parts: number[], count: number): number[][] {
  if (count === 1) {
    return parts.map(part => [part]);
  }
  
  const combinations: number[][] = [];
  const specialParts = [355, 300, 150];
  const standardParts = parts.filter(p => !specialParts.includes(p));
  const availableSpecialParts = parts.filter(p => specialParts.includes(p));
  
  // 重複を許可した組み合わせ生成（標準部材は重複可、特殊部材は1回のみ）
  function generate(current: number[], remaining: number, usedSpecialParts: Set<number>) {
    if (remaining === 0) {
      combinations.push([...current]);
      return;
    }
    
    for (const part of parts) {
      // 降順維持のため、現在の最小値以下の部材のみ追加
      if (current.length === 0 || part <= current[current.length - 1]) {
        // 特殊部材の場合は1回のみ使用可能
        if (specialParts.includes(part)) {
          if (!usedSpecialParts.has(part)) {
            current.push(part);
            usedSpecialParts.add(part);
            generate(current, remaining - 1, usedSpecialParts);
            current.pop();
            usedSpecialParts.delete(part);
          }
        } else {
          // 標準部材は重複使用可能
          current.push(part);
          generate(current, remaining - 1, usedSpecialParts);
          current.pop();
        }
      }
    }
  }
  
  generate([], count, new Set());
  return combinations;
}

/**
 * 補正部材の最適な組み合わせを選択
 * 軒の出+80mmにより近い補正量を求める
 */
function selectCorrectionParts(shortfall: number): number[] {
  console.log('補正部材選択開始:', shortfall);
  const availableParts = [900, 600, 355, 300, 150]; // 補正用部材（大きい順）
  let bestParts: number[] = [];
  let bestDifference = Infinity;
  
  // 単一部材での解決を優先
  for (const part of availableParts) {
    if (part >= shortfall) {
      const difference = part - shortfall;
      if (difference < bestDifference) {
        bestDifference = difference;
        bestParts = [part];
        console.log('単一部材候補:', [part], 'total:', part, '過剰分:', difference);
      }
    }
  }
  
  // 単一部材で解決できない場合は組み合わせを試行
  if (bestParts.length === 0) {
    const smallParts = [355, 300, 150]; // 組み合わせ用部材
    for (let count = 2; count <= 3; count++) {
      const combinations = generateCombinations(smallParts, count);
      
      for (const combo of combinations) {
        const total = combo.reduce((sum, part) => sum + part, 0);
        if (total >= shortfall) {
          const difference = total - shortfall;
          if (difference < bestDifference) {
            bestDifference = difference;
            bestParts = combo;
            console.log('組み合わせ候補:', combo, 'total:', total, '過剰分:', difference);
          }
        }
      }
    }
  }
  
  console.log('選択された補正部材:', bestParts);
  return bestParts;
}

/**
 * スパン構成をテキスト形式でフォーマット
 */
function formatSpanComposition(spanConfig: number[]): string {
  if (!spanConfig || spanConfig.length === 0) {
    return '';
  }
  
  // 部材をサイズ順（降順）でソート
  const sorted = [...spanConfig].sort((a, b) => b - a);
  
  // 1800mmの数をカウント
  const span1800Count = sorted.filter(part => part === 1800).length;
  const otherParts = sorted.filter(part => part !== 1800);
  
  const parts: string[] = [];
  
  // 1800mmがある場合は "Nspan" 形式
  if (span1800Count > 0) {
    parts.push(`${span1800Count}span`);
  }
  
  // その他の部材
  otherParts.forEach(part => {
    parts.push(`${part}mm`);
  });
  
  return parts.join(' + ');
}

/**
 * 簡易割付計算のメイン関数
 */
export function calculateQuickAllocation(input: QuickAllocationInput): QuickAllocationResult {
  console.log('=== UPDATED CODE VERSION 2.0 ===');
  console.log('calculateQuickAllocation called with:', input);
  
  const {
    currentDistance,
    allocationDistance,
    eaveOutput,
    boundaryLine,
    cornerType,
    specialMaterials,
    targetDistance
  } = input;
  
  // 入力値検証
  if (currentDistance < 0 || allocationDistance <= 0 || eaveOutput < 0 || boundaryLine < 0) {
    console.log('入力値検証エラー');
    return {
      success: false,
      resultDistance: null,
      spanConfiguration: null,
      spanComposition: null,
      needsCorrection: false,
      correctionParts: null,
      correctionAmount: null,
      errorMessage: '入力値が無効です'
    };
  }
  
  // 制約値を計算
  const minRequired = eaveOutput + EAVE_MARGIN_ADDITION;  // 軒の出制限
  const maxAllowed = boundaryLine > 0 ? boundaryLine - BOUNDARY_OFFSET : Infinity;  // 境界線制限（境界線がない場合は無制限）
  
  console.log('制約値:', { minRequired, maxAllowed, hasBoundaryLine: boundaryLine > 0 });
  
  // 軒の出制約は常に有効（境界線制限が小さくても補正部材で対応）
  const ignoreMininumConstraint = false;
  
  // 利用可能な部材リストを作成
  let availableParts = [...STANDARD_PARTS];
  
  // 選択された特殊部材を収集
  const selectedSpecialParts: number[] = [];
  if (specialMaterials.material355) {
    availableParts.push(355);
    selectedSpecialParts.push(355);
  }
  if (specialMaterials.material300) {
    availableParts.push(300);
    selectedSpecialParts.push(300);
  }
  if (specialMaterials.material150) {
    availableParts.push(150);
    selectedSpecialParts.push(150);
  }
  
  availableParts = availableParts.sort((a, b) => b - a); // 降順ソート
  
  console.log('選択された特殊部材:', selectedSpecialParts);
  console.log('利用可能な部材:', availableParts);
  
  let bestResult: number | null = null;
  let bestSpanConfig: number[] | null = null;
  
  // 1-7個の部材組み合わせを試行
  console.log('組み合わせ探索開始');
  for (let count = 1; count <= 7; count++) {
    console.log(`${count}個組み合わせ生成開始、利用可能部材:`, availableParts);
    const combinations = generateCombinations(availableParts, count);
    console.log(`${count}個組み合わせ数:`, combinations.length);
    
    if (count === 5) {
      console.log('5個組み合わせの最初の10個:', combinations.slice(0, 10));
    }
    
    for (const combo of combinations) {
      // 特殊部材が選択されている場合、その部材を含む構成のみを評価
      if (selectedSpecialParts.length > 0) {
        const containsAllSelectedParts = selectedSpecialParts.every(specialPart => 
          combo.includes(specialPart)
        );
        if (!containsAllSelectedParts) {
          continue; // 選択された特殊部材を含まない組み合わせはスキップ
        }
        console.log('特殊部材を含む組み合わせ:', combo, 'スパン計:', combo.reduce((sum, part) => sum + part, 0));
      }
      
      const totalSpan = combo.reduce((sum, part) => sum + part, 0);
      let result;
      
      // 計算式の切り替え
      if (cornerType === 'inside') {
        // 入隅：現在の離れ + 割付距離 - 足場スパン構成
        result = currentDistance + allocationDistance - totalSpan;
      } else {
        // 出隅：足場スパン構成 - (現在の離れ + 割付距離)
        const baseValue = currentDistance + allocationDistance;
        // 出隅では基準値より大きなスパン構成のみを候補とする
        if (totalSpan <= baseValue) {
          continue; // 基準値以下のスパン構成はスキップ
        }
        result = totalSpan - baseValue;
      }
      
      console.log(`組み合わせ ${combo} -> スパン計: ${totalSpan}, 結果: ${result}, 境界制限: ${maxAllowed}, 角部: ${cornerType}`);
      
      // 境界線制限内かチェック（境界線がある場合のみ）
      if (boundaryLine === 0 || result <= maxAllowed) {
        console.log('候補として採用:', combo, 'result:', result);
        
        // 選択ロジック（入隅・出隅共通）
        // 目標離れが指定されている場合は目標離れに最も近い構成を選択
        if (targetDistance !== undefined) {
          if (result >= minRequired) {
            const currentDiff = Math.abs(targetDistance - result);
            const bestDiff = bestResult !== null ? Math.abs(targetDistance - bestResult) : Infinity;
            
            if (bestResult === null || currentDiff < bestDiff) {
              bestResult = result;
              bestSpanConfig = combo;
              console.log(`目標離れモード - ベスト更新: 目標${targetDistance}mm, 実際${result}mm, 差${currentDiff}mm, 構成:`, bestSpanConfig);
            }
            // 同じ差の場合は部材数が少ない方を優先
            else if (currentDiff === bestDiff && combo.length < (bestSpanConfig?.length || Infinity)) {
              bestSpanConfig = combo;
              console.log('同じ目標差でより少ない部材数:', bestSpanConfig);
            }
          }
        }
        // 境界線がない場合、または境界線-60 > 軒の出+80の場合：軒の出+80に近づける（最小の離れ）
        else if (boundaryLine === 0 || maxAllowed > minRequired) {
          if (result >= minRequired) {
            if (bestResult === null || result < bestResult) {
              bestResult = result;
              bestSpanConfig = combo;
              console.log(`${cornerType}モード - 軒の出制限 - ベスト更新:`, bestResult, bestSpanConfig, '離れ:', result);
            }
            // 同じ離れの場合は部材数が少ない方を優先
            else if (result === bestResult && combo.length < (bestSpanConfig?.length || Infinity)) {
              bestSpanConfig = combo;
              console.log('同じ離れでより少ない部材数:', bestSpanConfig);
            }
          }
        }
        // 境界線-60 ≤ 軒の出+80の場合：境界線-60に近づける（境界線制限に最も近い離れ）、軒の出制限は補正で対応
        else if (targetDistance === undefined && boundaryLine > 0) {
          // 境界線制限により近い値を優先（境界線制限との差が小さい方）
          const currentDiff = Math.abs(maxAllowed - result);
          const bestDiff = bestResult !== null ? Math.abs(maxAllowed - bestResult) : Infinity;
          
          if (bestResult === null || currentDiff < bestDiff) {
            bestResult = result;
            bestSpanConfig = combo;
            console.log(`${cornerType}モード - 境界線制限 - ベスト更新:`, bestResult, bestSpanConfig, '離れ:', result, `境界線制限${maxAllowed}mmとの差:${currentDiff}mm`);
          }
          // 同じ差の場合は部材数が少ない方を優先
          else if (currentDiff === bestDiff && combo.length < (bestSpanConfig?.length || Infinity)) {
            bestSpanConfig = combo;
            console.log('同じ差でより少ない部材数:', bestSpanConfig);
          }
        }
      }
    }
  }
  
  console.log('最終ベスト:', { bestResult, bestSpanConfig });
  
  // 結果が見つからない場合
  if (bestResult === null || bestSpanConfig === null) {
    return {
      success: false,
      resultDistance: null,
      spanConfiguration: null,
      spanComposition: null,
      needsCorrection: false,
      correctionParts: null,
      correctionAmount: null,
      errorMessage: '制約条件を満たす足場スパン構成が見つかりません'
    };
  }
  
  // 補正が必要かどうかをチェック（軒の出制約を無視していない場合のみ）
  const needsCorrection = !ignoreMininumConstraint && bestResult < minRequired;
  let correctionMessage = '';
  let correctionParts: number[] = [];
  let correctionAmount: number | null = null;
  
  if (needsCorrection) {
    const shortfall = minRequired - bestResult;
    correctionParts = selectCorrectionParts(shortfall);
    
    if (correctionParts.length > 0) {
      correctionAmount = correctionParts.reduce((sum, part) => sum + part, 0);
      // 補正は表示のみで、実際の離れは変更しない
      console.log('補正部材選択:', correctionParts, '補正量:', correctionAmount);
      correctionMessage = '';
    } else {
      correctionMessage = `軒の出制限（${minRequired}mm）をクリアするため、${shortfall}mm以上の補正が必要です`;
    }
  }
  
  // 補正部材が選択できた場合はneedsCorrectio​nをfalseにする
  const showCorrectionMessage = needsCorrection && correctionParts.length === 0;
  
  return {
    success: true,
    resultDistance: bestResult,
    spanConfiguration: bestSpanConfig,
    spanComposition: formatSpanComposition(bestSpanConfig),
    needsCorrection: showCorrectionMessage,
    correctionParts: correctionParts.length > 0 ? correctionParts : null,
    correctionAmount,
    correctionMessage: showCorrectionMessage ? correctionMessage : undefined
  };
}

/**
 * 計算結果の詳細情報を取得
 */
export function getCalculationDetails(input: QuickAllocationInput, result: QuickAllocationResult) {
  if (!result.success) {
    return null;
  }
  
  const minRequired = input.eaveOutput + EAVE_MARGIN_ADDITION;
  const maxAllowed = input.boundaryLine - BOUNDARY_OFFSET;
  
  return {
    constraints: {
      minRequired,
      maxAllowed,
      eaveLimit: `軒の出 + ${EAVE_MARGIN_ADDITION}mm = ${minRequired}mm`,
      boundaryLimit: `境界線 - ${BOUNDARY_OFFSET}mm = ${maxAllowed}mm`
    },
    calculation: {
      formula: `${input.currentDistance} + ${input.allocationDistance} - ${result.spanConfiguration?.reduce((sum, part) => sum + part, 0)} = ${result.resultDistance}`,
      steps: [
        `現在の離れ: ${input.currentDistance}mm`,
        `割付距離: ${input.allocationDistance}mm`,
        `足場スパン構成: ${result.spanComposition}`,
        `計算結果: ${result.resultDistance}mm`
      ]
    }
  };
}