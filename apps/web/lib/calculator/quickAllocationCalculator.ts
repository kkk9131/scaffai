/**
 * Web版 簡易割付計算 - 直接的な計算方式
 */

import { findMinSpanCombination } from './spanCombinationSearch';

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
  resultDistanceDisplay?: string;       // 離れの表示形式（補正時は「500+(150)」など）
  spanConfiguration: number[] | null;   // 足場スパン構成
  spanComposition: string | null;       // スパン構成テキスト
  spanCompositionDisplay?: string;      // スパン構成表示形式（補正時は「1800, 1800, 900+(150)」など）
  needsCorrection: boolean;             // 補正が必要かどうか
  correctionParts: number[] | null;     // 補正部材
  correctionAmount: number | null;      // 補正量
  correctionMessage?: string;           // 補正メッセージ
  errorMessage?: string;
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
 * スパン構成を補正部材を含めて表示形式でフォーマット
 */
function formatSpanCompositionWithCorrection(spanConfig: number[], correctionParts: number[] | null): string {
  if (!spanConfig || spanConfig.length === 0) {
    return '';
  }
  
  // 通常のスパン構成をソートして表示
  const sorted = [...spanConfig].sort((a, b) => b - a);
  const parts: string[] = [];
  
  // 各部材をmm単位で表示
  sorted.forEach(part => {
    parts.push(`${part}`);
  });
  
  // 補正部材がある場合は最後に追加
  if (correctionParts && correctionParts.length > 0) {
    const correctionText = correctionParts.map(part => `${part}`).join('+');
    parts.push(`+(${correctionText})`);
  }
  
  return parts.join(', ') + ' mm';
}

/**
 * 簡易割付計算のメイン関数 - 直接的な計算方式
 */
export function calculateQuickAllocation(input: QuickAllocationInput): QuickAllocationResult {
  console.log('=== Web版 - 直接計算方式 ===');
  console.log('calculateQuickAllocation called with:', input);
  
  try {
    if (input.cornerType === 'inside') {
      // 入隅の計算ロジック
      return calculateInsideCorner(input);
    } else {
      // 出隅の計算ロジック（既存のロジック）
      return calculateOutsideCorner(input);
    }
  } catch (error) {
    console.error('計算エラー:', error);
    return {
      success: false,
      resultDistance: null,
      resultDistanceDisplay: undefined,
      spanConfiguration: null,
      spanComposition: null,
      spanCompositionDisplay: undefined,
      needsCorrection: false,
      correctionParts: null,
      correctionAmount: null,
      errorMessage: '計算中にエラーが発生しました'
    };
  }
}

/**
 * 入隅の計算
 * 現在の離れ + 割付距離 - スパン構成 = 離れ（軒の出+80以上の最小値）
 */
function calculateInsideCorner(input: QuickAllocationInput): QuickAllocationResult {
  console.log('=== 入隅計算開始 ===');
  console.log('入力:', input);
  
  const minRequiredDistance = input.eaveOutput + 80; // 最小離れ制約
  const maxAllowedDistance = input.boundaryLine > 0 ? input.boundaryLine - 60 : Infinity; // 境界線制約
  
  console.log('制約条件:', {
    minRequiredDistance,
    maxAllowedDistance
  });
  
  // 特殊部材の処理
  const specialParts: number[] = [];
  if (input.specialMaterials.material355) specialParts.push(355);
  if (input.specialMaterials.material300) specialParts.push(300);
  if (input.specialMaterials.material150) specialParts.push(150);
  
  const specialPartsSum = specialParts.reduce((sum, part) => sum + part, 0);
  console.log('特殊部材:', specialParts, 'sum:', specialPartsSum);
  
  // 目標離れを決定（境界線制約を考慮）
  let targetDistance = input.targetDistance || minRequiredDistance;
  if (input.boundaryLine > 0 && targetDistance > maxAllowedDistance) {
    targetDistance = maxAllowedDistance; // 境界線制約に合わせる
  }
  
  console.log('目標離れ:', targetDistance);
  
  // 目標スパン = 現在の離れ + 割付距離 - 目標離れ
  const targetSpan = input.currentDistance + input.allocationDistance - targetDistance;
  const normalTargetSpan = targetSpan - specialPartsSum;
  
  console.log('目標スパン:', targetSpan, 'normal目標スパン:', normalTargetSpan);
  
  // 通常部材の最適な組み合わせを探索
  let normalParts = findMinSpanCombination(normalTargetSpan);
  
  // スパン構成を構築
  let spanConfiguration = [...specialParts, ...normalParts];
  let totalSpan = spanConfiguration.reduce((sum, part) => sum + part, 0);
  
  console.log('スパン構成:', spanConfiguration, 'total:', totalSpan);
  
  // 実際の離れを計算
  let resultDistance = input.currentDistance + input.allocationDistance - totalSpan;
  
  console.log('計算結果の離れ:', resultDistance);
  
  // 補正部材の処理
  let correctionParts: number[] | null = null;
  let correctionAmount: number | null = null;
  let needsCorrection = false;
  let correctionMessage: string | undefined = undefined;
  let resultDistanceDisplay: string | undefined = undefined;
  
  // 境界線制約チェック
  if (input.boundaryLine > 0 && resultDistance > maxAllowedDistance) {
    console.log('境界線制約違反 - 離れが大きすぎる');
    // 境界線を超える場合、スパンを増やして離れを減らす
    const excess = resultDistance - maxAllowedDistance;
    const additionalParts = findMinSpanCombination(excess);
    spanConfiguration = [...spanConfiguration, ...additionalParts];
    totalSpan = spanConfiguration.reduce((sum, part) => sum + part, 0);
    resultDistance = input.currentDistance + input.allocationDistance - totalSpan;
    console.log('境界線制約対応後:', { spanConfiguration, totalSpan, resultDistance });
  }
  
  // 最小離れ制約チェック（軒の出+80mm）
  if (resultDistance < minRequiredDistance) {
    console.log('最小離れ制約違反 - 補正部材が必要');
    needsCorrection = true;
    const shortage = minRequiredDistance - resultDistance;
    const originalResultDistance = resultDistance; // 補正前の離れを保存（補正直前）
    
    // 補正部材の選択（150, 300, 355, 600, 900, 1200, 1500, 1800から最小のものを選択）
    const correctionOptions = [150, 300, 355, 600, 900, 1200, 1500, 1800];
    for (const part of correctionOptions) {
      if (part >= shortage) {
        correctionParts = [part];
        correctionAmount = part;
        // 補正後の離れを再計算（補正部材は離れを増やす）
        resultDistance = resultDistance + part;
        break;
      }
    }
    
    // 適切な補正部材が見つからない場合は複数の組み合わせを探索
    if (!correctionParts) {
      correctionParts = findMinSpanCombination(shortage);
      correctionAmount = correctionParts.reduce((sum, part) => sum + part, 0);
      resultDistance = resultDistance + correctionAmount;
    }
    
    // 補正時の表示形式を作成: 「500+(150)」のような形式
    if (correctionParts && correctionParts.length > 0) {
      resultDistanceDisplay = `${originalResultDistance}+(${correctionParts.join('+')})`;  
    }
    
    correctionMessage = `軒の出+80mm制約により補正部材(${correctionParts?.join('mm, ')}mm)を追加しました`;
    console.log('補正部材追加:', { correctionParts, correctionAmount, resultDistance, resultDistanceDisplay });
  }
  
  console.log('=== 入隅計算完了 ===');
  console.log('最終結果:', {
    resultDistance,
    spanConfiguration,
    needsCorrection,
    correctionParts
  });
  
  return {
    success: true,
    resultDistance: Math.max(0, resultDistance),
    resultDistanceDisplay: resultDistanceDisplay,
    spanConfiguration: spanConfiguration,
    spanComposition: formatSpanComposition(spanConfiguration),
    spanCompositionDisplay: formatSpanCompositionWithCorrection(spanConfiguration, correctionParts),
    needsCorrection: needsCorrection,
    correctionParts: correctionParts,
    correctionAmount: correctionAmount,
    correctionMessage: correctionMessage
  };
}

/**
 * 出隅の計算（既存のロジック）
 */
function calculateOutsideCorner(input: QuickAllocationInput): QuickAllocationResult {
  // 目標スパン長を計算
  // 基本: 割付距離 + 現在の離れ + 軒の出 * 2
  const targetSpan = input.allocationDistance + input.currentDistance + (input.eaveOutput * 2);
  
  // 特殊部材の処理
  const specialParts: number[] = [];
  if (input.specialMaterials.material355) specialParts.push(355);
  if (input.specialMaterials.material300) specialParts.push(300);
  if (input.specialMaterials.material150) specialParts.push(150);
  
  const specialPartsSum = specialParts.reduce((sum, part) => sum + part, 0);
  const normalTargetSpan = targetSpan - specialPartsSum;
  
  // 通常部材の最適な組み合わせを探索
  const normalParts = findMinSpanCombination(normalTargetSpan);
  
  // 最終的なスパン構成
  const spanConfiguration = [...specialParts, ...normalParts];
  const totalSpan = spanConfiguration.reduce((sum, part) => sum + part, 0);
  
  // 出隅: 総スパン - (現在の離れ + 割付距離) = 割付先の離れ
  const resultDistance = totalSpan - (input.currentDistance + input.allocationDistance);
  
  return {
    success: true,
    resultDistance: Math.max(0, resultDistance),
    resultDistanceDisplay: undefined, // 出隅は補正なし
    spanConfiguration: spanConfiguration,
    spanComposition: formatSpanComposition(spanConfiguration),
    spanCompositionDisplay: formatSpanCompositionWithCorrection(spanConfiguration, null),
    needsCorrection: false,
    correctionParts: null,
    correctionAmount: null
  };
}


/**
 * 計算結果の詳細情報を取得
 */
export function getCalculationDetails(input: QuickAllocationInput, result: QuickAllocationResult) {
  if (!result.success) {
    return null;
  }
  
  const totalSpan = result.spanConfiguration?.reduce((sum, part) => sum + part, 0) || 0;
  const formula = input.cornerType === 'inside' 
    ? `${input.currentDistance} + ${input.allocationDistance} - ${totalSpan} = ${result.resultDistance}`
    : `${totalSpan} - (${input.currentDistance} + ${input.allocationDistance}) = ${result.resultDistance}`;
  
  return {
    calculation: {
      formula,
      steps: [
        `現在の離れ: ${input.currentDistance}mm`,
        `割付距離: ${input.allocationDistance}mm`,
        `足場スパン構成: ${result.spanComposition}`,
        `計算結果: ${result.resultDistance}mm`
      ]
    }
  };
}