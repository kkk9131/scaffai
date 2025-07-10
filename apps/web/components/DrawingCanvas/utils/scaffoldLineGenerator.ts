import type { BuildingVertex, ScaffoldLineData, AdvancedCalculationResult } from '../types/drawing';
import type { QuickAllocationResult } from '@/lib/calculator/quickAllocationCalculator';

/**
 * 足場ライン生成ユーティリティ
 */

/**
 * 高度計算結果のスパン構成文字列を数値配列に変換
 * 例: "6span, 1500" -> [1800, 1800, 1800, 1800, 1800, 1800, 1500]
 */
function parseAdvancedSpanConfiguration(spanConfigString: string | number[]): number[] {
  // 既に配列の場合はそのまま返す
  if (Array.isArray(spanConfigString)) {
    return spanConfigString;
  }
  
  if (typeof spanConfigString !== 'string') {
    return [];
  }
  
  console.log('高度計算スパン構成解析:', spanConfigString);
  
  const spans: number[] = [];
  const parts = spanConfigString.split(',').map(part => part.trim());
  
  for (const part of parts) {
    if (part.includes('span')) {
      // "6span" -> 1800mm × 6
      const spanCount = parseInt(part.replace('span', ''));
      for (let i = 0; i < spanCount; i++) {
        spans.push(1800);
      }
    } else {
      // "1500" -> 1500mm
      const value = parseInt(part);
      if (!isNaN(value)) {
        spans.push(value);
      }
    }
  }
  
  console.log('解析結果:', spans);
  return spans;
}

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
 * 簡易計算結果から足場ラインにマーカーを追加
 */
export function generateScaffoldLineWithQuickAllocation(
  buildingVertices: BuildingVertex[],
  quickAllocationResults: QuickAllocationResult[],
  baseScale?: number
): ScaffoldLineData {
  console.log('=== 簡易計算結果を使用した足場ライン生成開始 ===');
  console.log('建物頂点:', buildingVertices);
  console.log('簡易計算結果:', quickAllocationResults);
  console.log('基準縮尺:', baseScale);
  
  // 簡易計算結果の内容を詳細ログ
  quickAllocationResults.forEach((result, index) => {
    console.log(`簡易計算結果[${index}]:`, {
      success: result.success,
      spanConfiguration: result.spanConfiguration,
      spanComposition: result.spanComposition,
      resultDistance: result.resultDistance
    });
  });
  
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
  
  for (let i = 0; i < buildingVertices.length; i++) {
    const currentVertex = buildingVertices[i];
    const nextVertex = buildingVertices[(i + 1) % buildingVertices.length];
    
    // 簡易計算結果から最初の成功した結果を使用（全辺で同じ計算結果を適用）
    const quickResult = quickAllocationResults.find(result => 
      result.success && result.spanConfiguration && result.spanConfiguration.length > 0
    );
    
    const distanceMm = quickResult?.resultDistance || 150; // デフォルト150mm
    const spanConfig = quickResult?.spanConfiguration || [];
    
    console.log(`辺${i}の簡易計算結果:`, {
      found: !!quickResult,
      distance: distanceMm,
      spanConfig: spanConfig,
      spanComposition: quickResult?.spanComposition || 'なし'
    });
    
    // 離れ距離をmm単位からピクセル単位に変換
    const distancePixels = distanceMm * scale;
    
    // 足場ラインの平行線を計算
    const parallelLine = getParallelLine(currentVertex, nextVertex, distancePixels, true);
    
    parallelLines.push({
      edgeIndex: i,
      start: parallelLine.start,
      end: parallelLine.end,
      distance: distanceMm,
      spanConfiguration: spanConfig
    });
    
    scaffoldVertices.push(parallelLine.start);
    
    console.log(`辺${i}: 離れ=${distanceMm}mm, スパン構成=[${spanConfig.join(',')}]`);
  }
  
  // 足場辺を生成
  for (let i = 0; i < scaffoldVertices.length; i++) {
    const startVertex = scaffoldVertices[i];
    const endVertex = scaffoldVertices[(i + 1) % scaffoldVertices.length];
    const parallelLine = parallelLines[i];
    
    // 簡易計算結果を使用してスパンマーカーを生成
    const quickResult = quickAllocationResults.find(result => 
      result.success && result.spanConfiguration
    );
    
    
    scaffoldEdges.push({
      edgeIndex: i,
      startVertex,
      endVertex,
      spanConfiguration: parallelLine.spanConfiguration
    });
    
    console.log(`足場辺${i}: スパン数=${parallelLine.spanConfiguration.length}`);
  }
  
  console.log('=== 簡易計算足場ライン生成完了 ===');
  console.log('足場頂点数:', scaffoldVertices.length);
  console.log('足場辺数:', scaffoldEdges.length);
  
  return {
    vertices: scaffoldVertices,
    edges: scaffoldEdges,
    visible: true
  };
}

/**
 * 足場ライン座標を生成（従来の高度計算用）
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
  
  for (let i = 0; i < buildingVertices.length; i++) {
    const currentVertex = buildingVertices[i];
    const nextVertex = buildingVertices[(i + 1) % buildingVertices.length];
    
    // この辺の計算結果を取得
    const calcResult = calculationResults.find(result => result.edgeIndex === i);
    const distanceMm = calcResult?.success ? (calcResult.resultDistance || 150) : 150;
    const rawSpanConfig = calcResult?.success ? (calcResult.spanConfiguration || []) : [];
    
    // スパン構成を数値配列に変換（高度計算結果の文字列形式に対応）
    const spanConfig = parseAdvancedSpanConfiguration(rawSpanConfig);
    
    console.log(`辺${i}の高度計算結果:`, {
      calcResult: calcResult,
      rawSpanConfig,
      parsedSpanConfig: spanConfig,
      distance: distanceMm
    });
    
    // 離れ距離をmm単位からピクセル単位に変換
    const distancePixels = distanceMm * scale;
    
    console.log(`辺${i}: 離れ距離=${distanceMm}mm (${distancePixels.toFixed(1)}px), スパン構成=`, spanConfig);
    
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
    
    scaffoldEdges.push({
      edgeIndex: i,
      startVertex,
      endVertex,
      spanConfiguration: parallelLine.spanConfiguration
    });
    
    console.log(`足場辺${i}: スパン数=${parallelLine.spanConfiguration.length}`);
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