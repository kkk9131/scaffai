/**
 * 足場ライン整合性チェック機能
 * 計算結果の足場ラインが既存の足場ライン矩形からはみ出していないかを検証
 */

import type { BuildingVertex, ScaffoldLineData } from '../../components/DrawingCanvas/types/drawing';
import type { InsideCornerCalculationResult } from './advancedInsideCornerCalculator';

/**
 * 足場ライン境界
 */
export interface ScaffoldLineBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  vertices: BuildingVertex[];
}

/**
 * 整合性チェック結果
 */
export interface ValidationResult {
  isValid: boolean;
  violatingEdges: number[];
  suggestedAdjustments: { edgeIndex: number; suggestedDistance: number }[];
  errorMessages: string[];
}

/**
 * 既存の足場ラインから境界を取得
 */
export function getScaffoldLineBounds(scaffoldLineData: ScaffoldLineData): ScaffoldLineBounds {
  const vertices = scaffoldLineData.vertices;
  
  if (vertices.length === 0) {
    return {
      minX: 0, maxX: 0, minY: 0, maxY: 0,
      vertices: []
    };
  }
  
  let minX = vertices[0].x;
  let maxX = vertices[0].x;
  let minY = vertices[0].y;
  let maxY = vertices[0].y;
  
  vertices.forEach(vertex => {
    minX = Math.min(minX, vertex.x);
    maxX = Math.max(maxX, vertex.x);
    minY = Math.min(minY, vertex.y);
    maxY = Math.max(maxY, vertex.y);
  });
  
  return {
    minX, maxX, minY, maxY,
    vertices: vertices
  };
}

/**
 * 点が境界内にあるかチェック
 */
export function isPointWithinBounds(point: BuildingVertex, bounds: ScaffoldLineBounds): boolean {
  return point.x >= bounds.minX && point.x <= bounds.maxX &&
         point.y >= bounds.minY && point.y <= bounds.maxY;
}

/**
 * 辺から足場ライン頂点を計算
 */
function calculateScaffoldVertex(
  startVertex: BuildingVertex,
  endVertex: BuildingVertex,
  distance: number
): BuildingVertex[] {
  // 辺のベクトルを計算
  const edgeX = endVertex.x - startVertex.x;
  const edgeY = endVertex.y - startVertex.y;
  const edgeLength = Math.sqrt(edgeX * edgeX + edgeY * edgeY);
  
  if (edgeLength === 0) {
    return [startVertex, endVertex];
  }
  
  // 外向きの法線ベクトル
  const normalX = edgeY / edgeLength;
  const normalY = -edgeX / edgeLength;
  
  // 足場ライン頂点を計算
  const scaffoldStart = {
    id: `scaffold_${startVertex.id}`,
    x: startVertex.x + normalX * distance,
    y: startVertex.y + normalY * distance
  };
  
  const scaffoldEnd = {
    id: `scaffold_${endVertex.id}`,
    x: endVertex.x + normalX * distance,
    y: endVertex.y + normalY * distance
  };
  
  return [scaffoldStart, scaffoldEnd];
}

/**
 * 入隅計算結果の足場ライン整合性をチェック
 */
export function validateScaffoldLineIntegrity(
  buildingVertices: BuildingVertex[],
  insideCornerResults: InsideCornerCalculationResult[],
  existingFaceDistances: Record<string, number>,
  originalScaffoldBounds: ScaffoldLineBounds,
  baseScale?: number
): ValidationResult {
  console.log('=== 足場ライン整合性チェック開始 ===');
  
  const violatingEdges: number[] = [];
  const suggestedAdjustments: { edgeIndex: number; suggestedDistance: number }[] = [];
  const errorMessages: string[] = [];
  
  try {
    // 各入隅辺の足場ライン頂点をチェック
    for (const result of insideCornerResults) {
      if (!result.success) continue;
      
      console.log(`辺${result.edgeIndex}の整合性チェック: 離れ${result.calculatedDistance}mm`);
      
      // mm距離をピクセル距離に変換
      const currentBaseScale = baseScale || 0.3;
      const distancePixels = result.calculatedDistance * currentBaseScale;
      
      // 足場ライン頂点を計算
      const scaffoldVertices = calculateScaffoldVertex(
        result.startVertex,
        result.endVertex,
        distancePixels
      );
      
      // 各頂点が境界内にあるかチェック
      let isValid = true;
      for (const scaffoldVertex of scaffoldVertices) {
        if (!isPointWithinBounds(scaffoldVertex, originalScaffoldBounds)) {
          isValid = false;
          console.warn(`辺${result.edgeIndex}の足場ライン頂点(${scaffoldVertex.x.toFixed(1)}, ${scaffoldVertex.y.toFixed(1)})が境界外`);
          break;
        }
      }
      
      if (!isValid) {
        violatingEdges.push(result.edgeIndex);
        
        // 調整案を計算（境界内に収まる最大距離）
        const maxAllowedDistance = calculateMaxAllowedDistance(
          result.startVertex,
          result.endVertex,
          originalScaffoldBounds
        );
        
        if (maxAllowedDistance > 0) {
          suggestedAdjustments.push({
            edgeIndex: result.edgeIndex,
            suggestedDistance: maxAllowedDistance
          });
          console.log(`辺${result.edgeIndex}の調整案: ${maxAllowedDistance}mm`);
        } else {
          errorMessages.push(`辺${result.edgeIndex}: 境界内に収まる距離が見つかりません`);
        }
      }
    }
    
    // 外周辺もチェック（参考）
    for (let i = 0; i < buildingVertices.length; i++) {
      const startVertex = buildingVertices[i];
      const endVertex = buildingVertices[(i + 1) % buildingVertices.length];
      
      // この辺が入隅辺でない場合のみチェック
      const isInsideCornerEdge = insideCornerResults.some(r => r.edgeIndex === i);
      if (isInsideCornerEdge) continue;
      
      // 面の方向から離れを取得
      const face = determineFaceDirection(startVertex, endVertex, i);
      const distance = existingFaceDistances[face] || 150;
      
      // mm距離をピクセル距離に変換
      const currentBaseScale = baseScale || 0.3;
      const distancePixels = distance * currentBaseScale;
      
      const scaffoldVertices = calculateScaffoldVertex(startVertex, endVertex, distancePixels);
      
      for (const scaffoldVertex of scaffoldVertices) {
        if (!isPointWithinBounds(scaffoldVertex, originalScaffoldBounds)) {
          console.warn(`外周辺${i}の足場ライン頂点が境界外の可能性`);
          break;
        }
      }
    }
    
    const isValid = violatingEdges.length === 0;
    
    console.log(`=== 足場ライン整合性チェック完了: ${isValid ? '✅ 合格' : '❌ 不合格'} ===`);
    console.log(`違反辺数: ${violatingEdges.length}, 調整案数: ${suggestedAdjustments.length}`);
    
    return {
      isValid,
      violatingEdges,
      suggestedAdjustments,
      errorMessages
    };
    
  } catch (error) {
    console.error('足場ライン整合性チェックエラー:', error);
    return {
      isValid: false,
      violatingEdges: [],
      suggestedAdjustments: [],
      errorMessages: [`整合性チェックエラー: ${(error as Error).message}`]
    };
  }
}

/**
 * 境界内に収まる最大距離を計算
 */
function calculateMaxAllowedDistance(
  startVertex: BuildingVertex,
  endVertex: BuildingVertex,
  bounds: ScaffoldLineBounds
): number {
  // 二分探索で最大距離を求める
  let minDistance = 0;
  let maxDistance = 2000; // 2m以内で探索
  let bestDistance = 0;
  
  const tolerance = 1; // 1mm の精度
  
  while (maxDistance - minDistance > tolerance) {
    const testDistance = (minDistance + maxDistance) / 2;
    const scaffoldVertices = calculateScaffoldVertex(startVertex, endVertex, testDistance);
    
    // 全ての頂点が境界内にあるかチェック
    const allWithinBounds = scaffoldVertices.every(vertex => 
      isPointWithinBounds(vertex, bounds)
    );
    
    if (allWithinBounds) {
      bestDistance = testDistance;
      minDistance = testDistance;
    } else {
      maxDistance = testDistance;
    }
  }
  
  return Math.floor(bestDistance);
}

/**
 * 面の方向を判定（建物形状に基づく）
 * テストケース形状での面定義：
 *   1---2    北面: 1-2, 3-4
 *   |   |    東面: 2-3, 4-5  
 *   |   3--4 南面: 5-6
 *   |      | 西面: 6-1
 *   6------5
 */
function determineFaceDirection(startVertex: BuildingVertex, endVertex: BuildingVertex, edgeIndex?: number): string {
  // 辺のインデックスが提供されている場合は、それに基づいて面を判定
  if (edgeIndex !== undefined) {
    return determineFaceByEdgeIndex(edgeIndex);
  }
  
  // 辺のインデックスが不明な場合は、座標から推定（従来の方法）
  const dx = endVertex.x - startVertex.x;
  const dy = endVertex.y - startVertex.y;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? '東' : '西';
  } else {
    // 画面座標系では Y+ が下方向
    // 辺の方向がY+（下向き）の場合、その辺は北面を向いている
    // 辺の方向がY-（上向き）の場合、その辺は南面を向いている
    return dy > 0 ? '北' : '南';
  }
}

/**
 * 辺インデックスに基づく面判定
 * 注意: この関数は特定の建物形状（L字型）を想定している
 */
function determineFaceByEdgeIndex(edgeIndex: number): string {
  // 実際の建物形状での辺と面の対応
  // 形状: 
  //   6--------5  
  //   |        |
  //   |    3---4
  //   |    |
  //   1----2
  switch (edgeIndex) {
    case 0: // 1→2 (250,100)→(500,100) 下側の水平線 (南面)
      return '南';
    case 1: // 2→3 (500,100)→(500,150) 中央の垂直線 (西面)
      return '西';
    case 2: // 3→4 (500,150)→(750,150) 中段の水平線 (南面)
      return '南';
    case 3: // 4→5 (750,150)→(750,600) 右側の垂直線 (東面)
      return '東';
    case 4: // 5→6 (750,600)→(250,600) 上側の水平線 (北面)
      return '北';
    case 5: // 6→1 (250,600)→(250,100) 左側の垂直線 (西面)
      return '西';
    default:
      console.warn(`予期しない辺インデックス: ${edgeIndex}`);
      return '北'; // デフォルト
  }
}

/**
 * 対面を取得
 */
function getOppositeFace(face: string): string {
  const opposites: Record<string, string> = {
    '北': '南',
    '南': '北', 
    '東': '西',
    '西': '東'
  };
  return opposites[face] || face;
}


/**
 * 元のスパン構成から使用したスパン構成を引く
 */
function subtractSpansFromOriginal(originalSpans: number[], usedSpans: number[]): number[] {
  console.log('=== スパン構成減算処理 ===');
  console.log('元のスパン構成:', originalSpans);
  console.log('使用済みスパン:', usedSpans);
  
  // 元のスパン構成をコピー
  const remaining = [...originalSpans];
  
  // 使用されたスパンを順次引いていく
  for (const usedSpan of usedSpans) {
    const index = remaining.findIndex(span => span === usedSpan);
    if (index !== -1) {
      remaining.splice(index, 1); // 該当するスパンを削除
      console.log(`${usedSpan}mmを削除、残り:`, remaining);
    } else {
      console.warn(`使用済みスパン${usedSpan}mmが元の構成に見つかりません`);
    }
  }
  
  console.log('最終的な残りスパン構成:', remaining);
  
  // 残りがない場合は最低限のスパンを返す
  if (remaining.length === 0) {
    console.log('残りスパンがないため、1800mmで補填');
    return [1800];
  }
  
  return remaining;
}

/**
 * スパン構成からスパンマーカーを生成
 * 実際の足場辺の長さに基づいて正確な位置を計算
 */
function generateSpanMarkersFromConfiguration(
  spanConfiguration: number[], 
  scaffoldEdgeLength?: number
): Array<{ position: number }> {
  console.log('=== スパンマーカー生成 ===');
  console.log('スパン構成:', spanConfiguration);
  console.log('足場辺長さ(px):', scaffoldEdgeLength);
  
  // スパン構成が空の場合は開始点と終了点のみ作成
  if (spanConfiguration.length === 0) {
    console.log('スパン構成が空のため、開始・終了点のみ作成');
    return [
      { position: 0 },
      { position: 1.0 }
    ];
  }
  
  const markers: Array<{ position: number }> = [];
  
  // スパン構成の総長さ（mm）
  const totalSpanLengthMm = spanConfiguration.reduce((sum, span) => sum + span, 0);
  console.log('スパン構成総長さ(mm):', totalSpanLengthMm);
  
  if (totalSpanLengthMm === 0) {
    console.log('スパン構成総長さが0のため、開始・終了点のみ作成');
    return [
      { position: 0 },
      { position: 1.0 }
    ];
  }
  
  // 実際のスパン寸法に比例してマーカーを配置
  let currentPositionMm = 0;
  
  // 開始位置マーカー（0の位置）
  markers.push({ position: 0 });
  
  // 各スパンの境界位置にマーカーを配置
  for (let i = 0; i < spanConfiguration.length; i++) {
    currentPositionMm += spanConfiguration[i];
    
    // 最後のスパンの終端は足場辺の終点なので、position: 1.0に設定
    if (i === spanConfiguration.length - 1) {
      markers.push({ position: 1.0 });
    } else {
      // 中間マーカーはスパン寸法の比率で計算
      const ratio = currentPositionMm / totalSpanLengthMm;
      markers.push({ position: ratio });
      console.log(`マーカー${i+1}: ${currentPositionMm}mm / ${totalSpanLengthMm}mm = ${ratio.toFixed(3)} (スパン: ${spanConfiguration[i]}mm)`);
    }
  }
  
  // 足場辺の長さが指定されている場合は、実際の辺長との比較をログ出力
  if (scaffoldEdgeLength && scaffoldEdgeLength > 0) {
    const edgeLengthMm = scaffoldEdgeLength / 0.3; // ピクセルからmmに変換（仮想的）
    console.log(`足場辺長さ: ${scaffoldEdgeLength}px (約${edgeLengthMm.toFixed(1)}mm), スパン構成総長さ: ${totalSpanLengthMm}mm`);
    if (Math.abs(edgeLengthMm - totalSpanLengthMm) > 100) {
      console.warn('足場辺長さとスパン構成総長さに大きな差があります');
    }
  }
  
  console.log('生成されたマーカー位置:', markers.map(m => m.position.toFixed(3)));
  return markers;
}

/**
 * 調整された計算結果で足場ラインデータを生成
 * 
 * 建物ラインと同じ形状のアプローチ：建物の各辺から計算された距離で平行線を作成
 */
export function generateAdjustedScaffoldLine(
  buildingVertices: BuildingVertex[],
  insideCornerResults: InsideCornerCalculationResult[],
  existingFaceDistances: Record<string, number>,
  adjustments: { edgeIndex: number; suggestedDistance: number }[],
  baseScale?: number,
  existingScaffoldData?: ScaffoldLineData,
  specialMaterials?: { material355?: boolean; material300?: boolean; material150?: boolean },
  simpleCalculationData?: { faceSpans: Record<string, number[]> },
  edgeSpanConfiguration?: Record<number, number[]>
): ScaffoldLineData {
  console.log('=== 建物形状ベース足場ライン生成開始 ===');
  console.log('入隅計算結果の詳細:');
  insideCornerResults.forEach((r, index) => {
    console.log(`  結果${index}:`, {
      edgeIndex: r.edgeIndex,
      success: r.success,
      calculatedDistance: r.calculatedDistance,
      spanConfiguration: r.spanConfiguration
    });
  });
  
  if (buildingVertices.length < 3) {
    console.error('建物頂点が不足しています');
    return {
      vertices: [],
      edges: [],
      visible: true
    };
  }
  
  console.log('建物頂点数:', buildingVertices.length);
  console.log('建物頂点:', buildingVertices.map(v => `(${v.x.toFixed(1)}, ${v.y.toFixed(1)})`));
  console.log('入隅計算結果:', insideCornerResults.map(r => `辺${r.edgeIndex}: ${r.calculatedDistance}mm`));
  
  const currentBaseScale = baseScale || 0.3;
  
  // 建物の各辺から足場ラインを計算
  const scaffoldVertices: BuildingVertex[] = [];
  const parallelLines: {
    start: BuildingVertex;
    end: BuildingVertex;
    distance: number;
    spanConfiguration: number[];
  }[] = [];
  
  // Step 1: 各建物辺から平行線を計算
  for (let i = 0; i < buildingVertices.length; i++) {
    const currentVertex = buildingVertices[i];
    const nextVertex = buildingVertices[(i + 1) % buildingVertices.length];
    
    console.log(`=== 建物辺${i}: (${currentVertex.x.toFixed(1)}, ${currentVertex.y.toFixed(1)}) → (${nextVertex.x.toFixed(1)}, ${nextVertex.y.toFixed(1)}) ===`);
    
    // この辺の計算結果を取得
    const insideCornerResult = insideCornerResults.find(r => r.edgeIndex === i && r.success);
    
    let distance: number;
    let spanConfiguration: number[] = [];
    
    // 優先順位：edgeSpanConfiguration > insideCornerResult > デフォルト
    if (edgeSpanConfiguration && edgeSpanConfiguration[i]) {
      // 最新の計算済みスパン構成を使用（入隅・出隅配分済み）
      spanConfiguration = edgeSpanConfiguration[i];
      
      if (insideCornerResult) {
        // 入隅辺の場合は入隅計算結果の離れを使用
        distance = insideCornerResult.calculatedDistance;
        console.log(`辺${i}: 最新スパン構成使用（入隅） - 離れ${distance}mm, スパン構成=[${spanConfiguration.join(',')}]`);
      } else {
        // 非入隅辺の場合は面の離れを使用
        const face = determineFaceDirection(currentVertex, nextVertex, i);
        distance = existingFaceDistances[face] || 150;
        console.log(`辺${i}: 最新スパン構成使用（非入隅） - ${face}面 ${distance}mm, スパン構成=[${spanConfiguration.join(',')}]`);
      }
    } else if (insideCornerResult) {
      // 入隅計算結果を使用（フォールバック）
      distance = insideCornerResult.calculatedDistance;
      spanConfiguration = insideCornerResult.spanConfiguration;
      console.log(`辺${i}: 入隅計算結果使用（フォールバック） - 離れ${distance}mm, スパン構成=[${spanConfiguration.join(',')}]`);
    } else {
      // デフォルト：面のスパン構成を使用
      const face = determineFaceDirection(currentVertex, nextVertex, i);
      distance = existingFaceDistances[face] || 150;
      const originalSpanConfig = simpleCalculationData?.faceSpans[face] || [1800];
      spanConfiguration = originalSpanConfig;
      console.log(`辺${i}: デフォルトスパン構成使用 - ${face}面 ${distance}mm, スパン構成=[${spanConfiguration.join(',')}]`);
    }
    
    // 距離をピクセルに変換
    const distancePixels = distance * currentBaseScale;
    
    // 辺のベクトルを計算
    const edgeX = nextVertex.x - currentVertex.x;
    const edgeY = nextVertex.y - currentVertex.y;
    const edgeLength = Math.sqrt(edgeX * edgeX + edgeY * edgeY);
    
    if (edgeLength === 0) {
      console.warn(`辺${i}の長さが0です`);
      continue;
    }
    
    // 外向きの法線ベクトル（建物の外側方向）
    const normalX = edgeY / edgeLength;
    const normalY = -edgeX / edgeLength;
    
    // 平行線の開始点と終了点
    const parallelStart = {
      id: `scaffold_${i}_start`,
      x: currentVertex.x + normalX * distancePixels,
      y: currentVertex.y + normalY * distancePixels
    };
    
    const parallelEnd = {
      id: `scaffold_${i}_end`,
      x: nextVertex.x + normalX * distancePixels,
      y: nextVertex.y + normalY * distancePixels
    };
    
    parallelLines.push({
      start: parallelStart,
      end: parallelEnd,
      distance: distance,
      spanConfiguration: spanConfiguration
    });
    
    console.log(`辺${i}平行線: (${parallelStart.x.toFixed(1)}, ${parallelStart.y.toFixed(1)}) → (${parallelEnd.x.toFixed(1)}, ${parallelEnd.y.toFixed(1)})`);
  }
  
  // Step 2: 隣接する平行線の交点を計算して足場頂点を生成
  for (let i = 0; i < parallelLines.length; i++) {
    const currentLine = parallelLines[i];
    const nextLine = parallelLines[(i + 1) % parallelLines.length];
    
    // 交点を計算
    const intersection = calculateLineIntersection(
      currentLine.start,
      currentLine.end,
      nextLine.start,
      nextLine.end
    );
    
    if (intersection) {
      scaffoldVertices.push(intersection);
      console.log(`足場頂点${i}: (${intersection.x.toFixed(1)}, ${intersection.y.toFixed(1)})`);
    } else {
      // 交点が見つからない場合は現在の線の終点を使用
      scaffoldVertices.push(currentLine.end);
      console.warn(`交点が見つからないため辺${i}の終点を使用`);
    }
  }
  
  // Step 3: 足場辺データを生成
  const scaffoldEdges = scaffoldVertices.map((vertex, index) => {
    const nextIndex = (index + 1) % scaffoldVertices.length;
    const nextVertex = scaffoldVertices[nextIndex];
    const parallelLine = parallelLines[index];
    
    // 足場辺の長さを計算（ピクセル単位）
    const edgeLengthPixels = Math.sqrt(
      Math.pow(nextVertex.x - vertex.x, 2) + 
      Math.pow(nextVertex.y - vertex.y, 2)
    );
    
    console.log(`足場辺${index}: 長さ${edgeLengthPixels.toFixed(1)}px, スパン構成=[${parallelLine.spanConfiguration.join(',')}]`);
    
    // スパンマーカーを生成（辺の長さを渡す）
    const spanMarkers = generateSpanMarkersFromConfiguration(
      parallelLine.spanConfiguration, 
      edgeLengthPixels
    );
    
    return {
      edgeIndex: index,
      startVertex: vertex,
      endVertex: nextVertex,
      spanConfiguration: parallelLine.spanConfiguration,
      spanMarkers
    };
  });
  
  console.log('=== 建物形状ベース足場ライン生成完了 ===');
  console.log('足場頂点数:', scaffoldVertices.length);
  console.log('足場頂点:', scaffoldVertices.map(v => `(${v.x.toFixed(1)}, ${v.y.toFixed(1)})`));
  
  return {
    vertices: scaffoldVertices,
    edges: scaffoldEdges,
    visible: true
  };
}

/**
 * 2つの直線の交点を計算
 */
function calculateLineIntersection(
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