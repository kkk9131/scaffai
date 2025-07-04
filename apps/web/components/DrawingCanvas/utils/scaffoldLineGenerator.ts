import type { BuildingVertex, ScaffoldLineData, AdvancedCalculationResult } from '../types/drawing';
import { getEdgeFaceDirection } from './geometryCalculator';

/**
 * 足場ライン生成ユーティリティ
 */

/**
 * 2つの点から直線の方程式を求める
 */
function getLineEquation(start: BuildingVertex, end: BuildingVertex) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  
  if (Math.abs(dx) < 0.001) {
    // 垂直線
    return { type: 'vertical' as const, x: start.x };
  } else if (Math.abs(dy) < 0.001) {
    // 水平線
    return { type: 'horizontal' as const, y: start.y };
  } else {
    // 一般的な直線 y = mx + b
    const m = dy / dx;
    const b = start.y - m * start.x;
    return { type: 'general' as const, m, b };
  }
}

/**
 * 点から直線への垂直距離で平行線を求める
 */
function getParallelLine(
  start: BuildingVertex, 
  end: BuildingVertex, 
  distance: number, 
  isOutward: boolean = true
) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length === 0) return { start, end };
  
  // 正規化された法線ベクトル（外向き）
  const normalX = dy / length;
  const normalY = -dx / length;
  
  // 外向きか内向きかで方向を調整
  const direction = isOutward ? 1 : -1;
  const offsetX = normalX * distance * direction;
  const offsetY = normalY * distance * direction;
  
  return {
    start: { 
      id: `parallel_start_${Date.now()}_${Math.random()}`,
      x: start.x + offsetX, 
      y: start.y + offsetY 
    },
    end: { 
      id: `parallel_end_${Date.now()}_${Math.random()}`,
      x: end.x + offsetX, 
      y: end.y + offsetY 
    }
  };
}

/**
 * 2つの直線の交点を求める
 */
function getLineIntersection(
  line1Start: BuildingVertex,
  line1End: BuildingVertex,
  line2Start: BuildingVertex,
  line2End: BuildingVertex
): BuildingVertex | null {
  const x1 = line1Start.x;
  const y1 = line1Start.y;
  const x2 = line1End.x;
  const y2 = line1End.y;
  const x3 = line2Start.x;
  const y3 = line2Start.y;
  const x4 = line2End.x;
  const y4 = line2End.y;
  
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  
  if (Math.abs(denom) < 0.001) {
    // 平行線
    return null;
  }
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  
  return {
    id: `intersection_${Date.now()}_${Math.random()}`,
    x: x1 + t * (x2 - x1),
    y: y1 + t * (y2 - y1)
  };
}

/**
 * スパン境界点を生成（修正版）
 * ユーザーの期待する配置に合わせて調整
 */
function generateSpanMarkers(
  edgeStart: BuildingVertex,
  edgeEnd: BuildingVertex,
  spanConfiguration: number[]
): { position: number; type: 'span-boundary' }[] {
  if (!spanConfiguration || spanConfiguration.length === 0) {
    return [];
  }
  
  // 辺の実際の長さを計算（ピクセル単位）
  const pixelLength = Math.sqrt(
    Math.pow(edgeEnd.x - edgeStart.x, 2) + Math.pow(edgeEnd.y - edgeStart.y, 2)
  );
  
  if (pixelLength === 0) {
    return [];
  }
  
  const markers: { position: number; type: 'span-boundary' }[] = [];
  
  // スパン構成は実寸法（mm）で指定されているため、
  // 現在の縮尺を考慮してピクセル長さとの比較を行う
  const totalSpanLength = spanConfiguration.reduce((sum, span) => sum + span, 0);
  
  let currentPosition = 0;
  
  for (let i = 0; i < spanConfiguration.length; i++) {
    const span = spanConfiguration[i];
    currentPosition += span;
    
    // 最後のスパンでない場合のみマーカーを配置
    if (i < spanConfiguration.length - 1) {
      const relativePosition = currentPosition / totalSpanLength;
      
      // 0-1の範囲内であることを確認
      if (relativePosition > 0 && relativePosition < 1) {
        markers.push({
          position: relativePosition,
          type: 'span-boundary'
        });
      }
    }
  }
  
  console.log(`スパンマーカー生成: 構成=${spanConfiguration}, 総長=${totalSpanLength}mm, マーカー数=${markers.length}`);
  
  return markers;
}

/**
 * 足場ライン座標を生成（修正版）
 * 入隅計算の結果を正しい対象辺に適用
 */
export function generateScaffoldLine(
  buildingVertices: BuildingVertex[],
  calculationResults: AdvancedCalculationResult[],
  baseScale?: number // 基準縮尺を追加
): ScaffoldLineData {
  console.log('=== 足場ライン生成開始 ===');
  console.log('建物頂点:', buildingVertices);
  console.log('計算結果:', calculationResults);
  console.log('基準縮尺:', baseScale);
  
  if (buildingVertices.length < 3) {
    console.warn('建物頂点が不足しています');
    return {
      vertices: [],
      edges: [],
      visible: true
    };
  }
  
  // 基準縮尺が指定されていない場合のデフォルト値
  const scale = baseScale || 0.3;
  
  const scaffoldVertices: BuildingVertex[] = [];
  const scaffoldEdges: ScaffoldLineData['edges'] = [];
  
  // 各辺の足場ラインを計算
  const parallelLines: {
    edgeIndex: number;
    start: BuildingVertex;
    end: BuildingVertex;
    distance: number;
    spanConfiguration: number[];
  }[] = [];
  
  // 入隅計算結果を面ごとに整理
  const faceCalculations: { [face: string]: AdvancedCalculationResult[] } = {
    north: [],
    east: [],
    south: [],
    west: []
  };
  
  // 各辺の面方向を調べて分類
  for (let i = 0; i < buildingVertices.length; i++) {
    const currentVertex = buildingVertices[i];
    const nextVertex = buildingVertices[(i + 1) % buildingVertices.length];
    const faceDirection = getEdgeFaceDirection(currentVertex, nextVertex);
    
    const calcResult = calculationResults.find(result => result.edgeIndex === i);
    if (calcResult) {
      faceCalculations[faceDirection].push(calcResult);
    }
  }
  
  console.log('面ごとの計算結果:', faceCalculations);
  
  for (let i = 0; i < buildingVertices.length; i++) {
    const currentVertex = buildingVertices[i];
    const nextVertex = buildingVertices[(i + 1) % buildingVertices.length];
    const faceDirection = getEdgeFaceDirection(currentVertex, nextVertex);
    
    // この辺の計算結果を取得（修正版）
    let distanceMm = 150; // デフォルト
    let spanConfig: number[] = [];
    
    // 直接的な計算結果を確認
    const directResult = calculationResults.find(result => result.edgeIndex === i);
    
    if (directResult?.success) {
      // 直接の計算結果がある場合はそれを使用
      distanceMm = directResult.resultDistance || 150;
      spanConfig = directResult.spanConfiguration || [];
      console.log(`辺${i}(${faceDirection}面): 直接計算結果使用 - 離れ=${distanceMm}mm, スパン構成=`, spanConfig);
    } else {
      // 同じ面の他の計算結果を探す
      const sameFaceResults = faceCalculations[faceDirection].filter(result => result.success);
      
      if (sameFaceResults.length > 0) {
        // 同じ面の成功した計算結果を適用
        const targetResult = sameFaceResults[0]; // 最初の成功結果を使用
        distanceMm = targetResult.resultDistance || 150;
        
        // スパン構成は元の計算結果を調整して適用
        // ユーザーの要件：「総スパンから計算結果を引いたもの」
        const originalSpanConfig = targetResult.spanConfiguration || [];
        if (originalSpanConfig.length > 0) {
          const totalOriginalSpan = originalSpanConfig.reduce((sum, span) => sum + span, 0);
          
          // 現在の辺の実寸法を計算（概算）
          const pixelLength = Math.sqrt(
            Math.pow(nextVertex.x - currentVertex.x, 2) + 
            Math.pow(nextVertex.y - currentVertex.y, 2)
          );
          const edgeLengthMm = pixelLength / scale;
          
          // 残りスパン = 辺の長さ - 入隅部分
          const remainingSpan = edgeLengthMm - totalOriginalSpan;
          
          if (remainingSpan > 0) {
            // 残りスパンを適切に分割
            spanConfig = [Math.round(remainingSpan)];
            console.log(`辺${i}(${faceDirection}面): 調整されたスパン構成 - 元の構成=${originalSpanConfig}, 残り=${remainingSpan.toFixed(1)}mm`);
          } else {
            spanConfig = originalSpanConfig;
          }
        }
        
        console.log(`辺${i}(${faceDirection}面): 面内計算結果使用 - 離れ=${distanceMm}mm, 調整スパン構成=`, spanConfig);
      } else {
        console.log(`辺${i}(${faceDirection}面): デフォルト値使用 - 離れ=${distanceMm}mm`);
      }
    }
    
    // 離れ距離をmm単位からピクセル単位に変換
    const distancePixels = distanceMm * scale;
    
    console.log(`辺${i}: 最終 - 離れ距離=${distanceMm}mm (${distancePixels.toFixed(1)}px), スパン構成=`, spanConfig);
    
    // 平行線を計算（ピクセル単位の距離を使用）
    const parallelLine = getParallelLine(currentVertex, nextVertex, distancePixels, true);
    
    parallelLines.push({
      edgeIndex: i,
      start: parallelLine.start,
      end: parallelLine.end,
      distance: distanceMm, // mm単位の距離を保存
      spanConfiguration: spanConfig
    });
  }
  
  // 隣接する平行線の交点を計算して足場頂点を生成
  for (let i = 0; i < parallelLines.length; i++) {
    const currentLine = parallelLines[i];
    const nextLine = parallelLines[(i + 1) % parallelLines.length];
    
    // 交点を計算
    const intersection = getLineIntersection(
      currentLine.start,
      currentLine.end,
      nextLine.start,
      nextLine.end
    );
    
    if (intersection) {
      scaffoldVertices.push(intersection);
      console.log(`交点${i}: (${intersection.x.toFixed(1)}, ${intersection.y.toFixed(1)})`);
    } else {
      // 交点が見つからない場合は現在の線の終点を使用
      scaffoldVertices.push(currentLine.end);
      console.warn(`辺${i}と${(i + 1) % parallelLines.length}の交点が見つかりません`);
    }
  }
  
  // 足場辺を生成
  for (let i = 0; i < scaffoldVertices.length; i++) {
    const startVertex = scaffoldVertices[i];
    const endVertex = scaffoldVertices[(i + 1) % scaffoldVertices.length];
    const parallelLine = parallelLines[i];
    
    // スパンマーカーを生成
    const spanMarkers = generateSpanMarkers(
      startVertex,
      endVertex,
      parallelLine.spanConfiguration
    );
    
    scaffoldEdges.push({
      edgeIndex: i,
      startVertex,
      endVertex,
      spanConfiguration: parallelLine.spanConfiguration,
      spanMarkers
    });
    
    console.log(`足場辺${i}: スパン数=${parallelLine.spanConfiguration.length}, マーカー数=${spanMarkers.length}`);
  }
  
  console.log('=== 足場ライン生成完了 ===');
  console.log('足場頂点数:', scaffoldVertices.length);
  console.log('足場辺数:', scaffoldEdges.length);
  
  return {
    vertices: scaffoldVertices,
    edges: scaffoldEdges,
    visible: true
  };
}