/**
 * 簡易計算結果からマーカー位置を計算するユーティリティ
 */

import type { QuickAllocationResult } from '@/lib/calculator/quickAllocationCalculator';

export interface SpanMarkerPosition {
  position: number;  // 位置 (mm)
  index: number;     // マーカーのインデックス
  isStart: boolean;  // 開始点かどうか
  isEnd: boolean;    // 終了点かどうか
}

export interface SpanMarkerData {
  totalDistance: number;           // 総距離
  markerPositions: SpanMarkerPosition[];  // マーカー位置配列
  spanComposition: string;         // スパン構成テキスト
  spanConfiguration: number[];     // スパン構成配列
}

/**
 * スパン構成テキストを解析して配列に変換
 * 例: "5span + 1200mm" -> [1800, 1800, 1800, 1800, 1800, 1200]
 */
export function parseSpanComposition(spanComposition: string): number[] {
  if (!spanComposition) return [];
  
  const spans: number[] = [];
  const parts = spanComposition.split(' + ').map(part => part.trim());
  
  for (const part of parts) {
    if (part.includes('span')) {
      // "5span" -> 1800mm × 5
      const spanCount = parseInt(part.replace('span', ''));
      for (let i = 0; i < spanCount; i++) {
        spans.push(1800);
      }
    } else if (part.includes('mm')) {
      // "1200mm" -> 1200
      const value = parseInt(part.replace('mm', ''));
      spans.push(value);
    }
  }
  
  return spans;
}

/**
 * スパン構成からマーカー位置を計算
 * @param spanConfiguration スパン構成配列 [1800, 1800, 1800, 1800, 1800, 1200]
 * @returns マーカー位置データ
 */
export function calculateMarkerPositions(spanConfiguration: number[]): SpanMarkerPosition[] {
  if (!spanConfiguration || spanConfiguration.length === 0) {
    return [];
  }
  
  const positions: SpanMarkerPosition[] = [];
  let currentPosition = 0;
  
  // 開始点 (0)
  positions.push({
    position: 0,
    index: 0,
    isStart: true,
    isEnd: false
  });
  
  // 各スパンの終端位置を計算
  spanConfiguration.forEach((span, index) => {
    currentPosition += span;
    positions.push({
      position: currentPosition,
      index: index + 1,
      isStart: false,
      isEnd: index === spanConfiguration.length - 1
    });
  });
  
  return positions;
}

/**
 * 簡易計算結果からマーカーデータを生成
 * @param result 簡易計算結果
 * @returns マーカーデータ
 */
export function generateSpanMarkerData(result: QuickAllocationResult): SpanMarkerData | null {
  if (!result.success || !result.spanConfiguration || !result.spanComposition) {
    return null;
  }
  
  const spanConfiguration = result.spanConfiguration;
  const markerPositions = calculateMarkerPositions(spanConfiguration);
  const totalDistance = spanConfiguration.reduce((sum, span) => sum + span, 0);
  
  return {
    totalDistance,
    markerPositions,
    spanComposition: result.spanComposition,
    spanConfiguration
  };
}

/**
 * マーカー位置をキャンバス座標に変換
 * @param markerData マーカーデータ
 * @param startX 開始X座標
 * @param startY 開始Y座標
 * @param endX 終了X座標
 * @param endY 終了Y座標
 * @param scale スケール（mm/px）
 * @returns キャンバス座標のマーカー位置
 */
export function convertToCanvasCoordinates(
  markerData: SpanMarkerData,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  scale: number
): Array<{ x: number; y: number; index: number; isStart: boolean; isEnd: boolean }> {
  const lineLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  const lineLengthMm = lineLength * scale;
  
  // 実際の長さとマーカー総距離の比率を計算
  const ratio = lineLength / markerData.totalDistance;
  
  return markerData.markerPositions.map(marker => {
    // 線上での位置比率を計算
    const positionRatio = marker.position / markerData.totalDistance;
    
    // キャンバス座標を計算
    const x = startX + (endX - startX) * positionRatio;
    const y = startY + (endY - startY) * positionRatio;
    
    return {
      x,
      y,
      index: marker.index,
      isStart: marker.isStart,
      isEnd: marker.isEnd
    };
  });
}

/**
 * テスト用のサンプルデータ
 */
export const sampleSpanMarkerData = {
  "5span,1200": {
    spanComposition: "5span + 1200mm",
    spanConfiguration: [1800, 1800, 1800, 1800, 1800, 1200],
    expectedPositions: [0, 1800, 3600, 5400, 7200, 9000, 10200]
  },
  "3span,900": {
    spanComposition: "3span + 900mm",
    spanConfiguration: [1800, 1800, 1800, 900],
    expectedPositions: [0, 1800, 3600, 5400, 6300]
  },
  "2span,1500+600": {
    spanComposition: "2span + 1500mm + 600mm",
    spanConfiguration: [1800, 1800, 1500, 600],
    expectedPositions: [0, 1800, 3600, 5100, 5700]
  }
};