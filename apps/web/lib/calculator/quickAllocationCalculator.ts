/**
 * Web版 簡易割付計算 - @scaffai/coreパッケージを使用
 */

import { calculateAll, type ScaffoldInput } from '@scaffai/core';

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
 * 簡易割付計算のメイン関数 - @scaffai/coreパッケージを使用
 */
export function calculateQuickAllocation(input: QuickAllocationInput): QuickAllocationResult {
  console.log('=== Web版 - @scaffai/core使用 ===');
  console.log('calculateQuickAllocation called with:', input);
  
  try {
    // @scaffai/coreの入力形式に変換
    const scaffoldInput: ScaffoldInput = {
      buildingDimensions: {
        // 簡易計算用のダミー値（実際の計算には使用されない）
        north: input.allocationDistance,
        south: input.allocationDistance,
        east: input.allocationDistance,
        west: input.allocationDistance
      },
      eaveOutputs: {
        north: input.eaveOutput,
        south: input.eaveOutput,
        east: input.eaveOutput,
        west: input.eaveOutput
      },
      boundaryLines: {
        north: input.boundaryLine,
        south: input.boundaryLine,
        east: input.boundaryLine,
        west: input.boundaryLine
      },
      constraints: {
        floors: 1,
        height: 2000,
        foundation: 'normal' as const,
        specialRequirements: []
      }
    };

    // @scaffai/coreで計算実行
    const result = calculateAll(scaffoldInput);
    
    if (!result.success) {
      return {
        success: false,
        resultDistance: null,
        spanConfiguration: null,
        spanComposition: null,
        needsCorrection: false,
        correctionParts: null,
        correctionAmount: null,
        errorMessage: result.error || '計算に失敗しました'
      };
    }

    // 結果から適切な面の計算結果を取得（簡易計算では北面を使用）
    const faceResult = result.data.faces.north;
    
    // 簡易割付計算の結果を算出
    let calculatedDistance: number;
    if (input.cornerType === 'inside') {
      // 入隅：現在の離れ + 割付距離 - 足場スパン構成
      calculatedDistance = input.currentDistance + input.allocationDistance - faceResult.totalSpan;
    } else {
      // 出隅：足場スパン構成 - (現在の離れ + 割付距離)
      calculatedDistance = faceResult.totalSpan - (input.currentDistance + input.allocationDistance);
    }

    return {
      success: true,
      resultDistance: calculatedDistance,
      spanConfiguration: faceResult.spanConfiguration,
      spanComposition: formatSpanComposition(faceResult.spanConfiguration),
      needsCorrection: false, // コアパッケージで制約は既に考慮済み
      correctionParts: null,
      correctionAmount: null
    };

  } catch (error) {
    console.error('計算エラー:', error);
    return {
      success: false,
      resultDistance: null,
      spanConfiguration: null,
      spanComposition: null,
      needsCorrection: false,
      correctionParts: null,
      correctionAmount: null,
      errorMessage: '計算処理中にエラーが発生しました'
    };
  }
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