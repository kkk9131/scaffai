/**
 * Web版 簡易割付計算 - 共有コアエンジンを使用
 */

import { calculateAll, type ScaffoldInputData, type ScaffoldCalculationResult } from '@scaffai/core';

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
 * 簡易割付計算のメイン関数 - 共有コアエンジンを使用
 */
export function calculateQuickAllocation(input: QuickAllocationInput): QuickAllocationResult {
  console.log('=== Web版 - 共有コアエンジン使用 ===');
  console.log('calculateQuickAllocation called with:', input);
  
  try {
    // クイック割付計算用の入力データを構築
    const scaffoldInput: ScaffoldInputData = {
      // 割付距離を建物寸法として設定（簡易計算のため）
      width_NS: input.allocationDistance,
      width_EW: input.allocationDistance,
      
      // 軒の出を全面同じ値で設定
      eaves_N: input.eaveOutput,
      eaves_E: input.eaveOutput,
      eaves_S: input.eaveOutput,
      eaves_W: input.eaveOutput,
      
      // 境界線の設定（指定がある場合）
      boundary_N: input.boundaryLine > 0 ? input.boundaryLine : null,
      boundary_E: input.boundaryLine > 0 ? input.boundaryLine : null,
      boundary_S: input.boundaryLine > 0 ? input.boundaryLine : null,
      boundary_W: input.boundaryLine > 0 ? input.boundaryLine : null,
      
      // デフォルト値
      standard_height: 10000,
      roof_shape: 'フラット',
      tie_column: false,
      railing_count: 0,
      
      // 特殊部材の設定
      use_355_NS: input.specialMaterials.material355 ? 1 : 0,
      use_300_NS: input.specialMaterials.material300 ? 1 : 0,
      use_150_NS: input.specialMaterials.material150 ? 1 : 0,
      use_355_EW: input.specialMaterials.material355 ? 1 : 0,
      use_300_EW: input.specialMaterials.material300 ? 1 : 0,
      use_150_EW: input.specialMaterials.material150 ? 1 : 0,
      
      // 目標離れの設定（指定がある場合）
      target_margin_N: input.targetDistance || null,
      target_margin_E: input.targetDistance || null,
      target_margin_S: input.targetDistance || null,
      target_margin_W: input.targetDistance || null,
    };
    
    // 共有コアエンジンで計算実行
    const coreResult: ScaffoldCalculationResult = calculateAll(scaffoldInput);
    
    // 結果を簡易計算用の形式に変換
    const spanConfig = parseSpanStructure(coreResult.ns_span_structure);
    const totalSpan = coreResult.ns_total_span;
    
    // 割付先の離れを計算（入隅・出隅による計算方法の違い）
    let resultDistance: number;
    if (input.cornerType === 'inside') {
      // 入隅: 現在の離れ + 割付距離 - 総スパン = 割付先の離れ
      resultDistance = input.currentDistance + input.allocationDistance - totalSpan;
    } else {
      // 出隅: 総スパン - (現在の離れ + 割付距離) = 割付先の離れ
      resultDistance = totalSpan - (input.currentDistance + input.allocationDistance);
    }
    
    return {
      success: true,
      resultDistance: Math.max(0, resultDistance), // 負の値は0にクリップ
      spanConfiguration: spanConfig,
      spanComposition: coreResult.ns_span_structure,
      needsCorrection: false, // コアエンジンが適切な構成を選択
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
      errorMessage: '計算中にエラーが発生しました'
    };
  }
}

/**
 * スパン構成文字列を数値配列に変換
 */
function parseSpanStructure(spanStructure: string): number[] {
  const parts: number[] = [];
  
  // "2span, 900" のような形式をパース
  const segments = spanStructure.split(',').map(s => s.trim());
  
  for (const segment of segments) {
    if (segment.includes('span')) {
      // "2span" -> 1800mm x 2個
      const count = parseInt(segment.replace('span', ''));
      for (let i = 0; i < count; i++) {
        parts.push(1800);
      }
    } else if (segment.match(/^\d+$/)) {
      // "900" -> 900mm
      parts.push(parseInt(segment));
    }
  }
  
  return parts;
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