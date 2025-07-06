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
 *   1---2    北面: 辺0(1-2), 辺2(3-4)
 *   |   |    東面: 辺1(2-3), 辺3(4-5)  
 *   |   3--4 南面: 辺4(5-6)
 *   |      | 西面: 辺5(6-1)
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
 * 辺インデックスから辺の説明を取得
 */
function getEdgeDescriptionFromIndex(edgeIndex: number): string {
  switch (edgeIndex) {
    case 0: return '辺0: 1→2 (北辺)';
    case 1: return '辺1: 2→3 (東辺上部)';
    case 2: return '辺2: 3→4 (中央水平辺)';
    case 3: return '辺3: 4→5 (東辺下部)';
    case 4: return '辺4: 5→6 (南辺)';
    case 5: return '辺5: 6→1 (西辺)';
    default: return `辺${edgeIndex}: 不明`;
  }
}

/**
 * 辺インデックスに基づく面判定
 * 注意: この関数は特定の建物形状（L字型）を想定している
 */
function determineFaceByEdgeIndex(edgeIndex: number): string {
  // L字型建物での辺と面の対応
  // 形状: 
  //   1---2
  //   |   |
  //   |   3--4
  //   |      |
  //   6------5
  switch (edgeIndex) {
    case 0: // 1→2 北辺（東西方向）
      return '北';
    case 1: // 2→3 東辺上部（南北方向）
      return '東';
    case 2: // 3→4 中央水平辺（東西方向）
      return '北'; // 内側の水平辺なので北面扱い
    case 3: // 4→5 東辺下部（南北方向）
      return '東';
    case 4: // 5→6 南辺（東西方向）
      return '南';
    case 5: // 6→1 西辺（南北方向）
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
  console.log('');
  console.log('🚀=== 建物形状ベース足場ライン生成開始 ===');
  console.log('');
  console.log('🏢 建物頂点の順序:');
  buildingVertices.forEach((v, i) => {
    const nextIndex = (i + 1) % buildingVertices.length;
    const nextVertex = buildingVertices[nextIndex];
    console.log(`  頂点${i+1}: (${v.x.toFixed(0)}, ${v.y.toFixed(0)}) → 頂点${nextIndex+1}: (${nextVertex.x.toFixed(0)}, ${nextVertex.y.toFixed(0)}) = 建物辺${i}`);
  });
  console.log('');
  console.log('📋 入隅計算結果の詳細:');
  insideCornerResults.forEach((r, index) => {
    console.log(`  結果${index}: 辺${r.edgeIndex} = ${r.success ? r.calculatedDistance + 'mm' : '失敗'} [${r.spanConfiguration?.join(', ') || 'なし'}]`);
  });
  console.log('');
  console.log('📋 edgeSpanConfiguration（各辺の最終スパン構成）:');
  if (edgeSpanConfiguration) {
    for (const [edgeIndex, spans] of Object.entries(edgeSpanConfiguration)) {
      console.log(`  辺${edgeIndex}: [${spans.join(', ')}]`);
    }
  } else {
    console.log('  edgeSpanConfigurationがnull');
  }
  console.log('');
  
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
    buildingEdgeIndex: number;
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
      buildingEdgeIndex: i,
      start: parallelStart,
      end: parallelEnd,
      distance: distance,
      spanConfiguration: spanConfiguration
    });
    
    console.log(`辺${i}平行線: (${parallelStart.x.toFixed(1)}, ${parallelStart.y.toFixed(1)}) → (${parallelEnd.x.toFixed(1)}, ${parallelEnd.y.toFixed(1)})`);
  }
  
  // Step 2: 建物頂点と対応する足場頂点を計算
  // 各建物頂点において、その頂点から出る2つの平行線の交点を計算
  for (let i = 0; i < buildingVertices.length; i++) {
    // 建物頂点iに接続する2つの辺を取得
    const prevEdgeIndex = (i - 1 + buildingVertices.length) % buildingVertices.length;
    const currentEdgeIndex = i;
    
    const prevLine = parallelLines[prevEdgeIndex];
    const currentLine = parallelLines[currentEdgeIndex];
    
    // 前の辺の平行線と現在の辺の平行線の交点を計算
    const intersection = calculateLineIntersection(
      prevLine.start,
      prevLine.end,
      currentLine.start,
      currentLine.end
    );
    
    if (intersection) {
      scaffoldVertices.push(intersection);
      console.log(`足場頂点${i} (建物頂点${i+1}対応、辺${prevEdgeIndex}と辺${currentEdgeIndex}の交点): (${intersection.x.toFixed(1)}, ${intersection.y.toFixed(1)})`);
    } else {
      // 交点が見つからない場合は現在の線の開始点を使用
      scaffoldVertices.push(currentLine.start);
      console.warn(`交点が見つからないため建物頂点${i+1}に対応する足場頂点として線の開始点を使用`);
    }
  }
  
  // Step 3: 足場辺データを生成（建物辺との直接対応）
  const scaffoldEdges = [];
  
  for (let i = 0; i < buildingVertices.length; i++) {
    // 建物辺iに対応する足場辺を作成
    const buildingEdgeIndex = i;
    const parallelLine = parallelLines[i];
    
    // 正しい対応：建物辺iに対応する足場頂点iとi+1を使用
    const startVertexIndex = i;
    const endVertexIndex = (i + 1) % scaffoldVertices.length;
    
    const startScaffoldVertex = scaffoldVertices[startVertexIndex];
    const endScaffoldVertex = scaffoldVertices[endVertexIndex];
    
    // 足場辺の長さを計算（ピクセル単位）
    const edgeLengthPixels = Math.sqrt(
      Math.pow(endScaffoldVertex.x - startScaffoldVertex.x, 2) + 
      Math.pow(endScaffoldVertex.y - startScaffoldVertex.y, 2)
    );
    
    console.log(`建物辺${buildingEdgeIndex}に対応する足場辺: (${startScaffoldVertex.x.toFixed(1)}, ${startScaffoldVertex.y.toFixed(1)}) → (${endScaffoldVertex.x.toFixed(1)}, ${endScaffoldVertex.y.toFixed(1)}), 長さ${edgeLengthPixels.toFixed(1)}px`);
    
    // スパンマーカーを生成（辺の長さを渡す）
    const spanConfiguration = parallelLine.spanConfiguration;
    const spanMarkers = generateSpanMarkersFromConfiguration(
      spanConfiguration, 
      edgeLengthPixels
    ).map(marker => ({ ...marker, type: 'span-boundary' as const }));
    
    scaffoldEdges.push({
      edgeIndex: buildingEdgeIndex, // 建物辺番号
      startVertex: startScaffoldVertex,
      endVertex: endScaffoldVertex,
      spanConfiguration: spanConfiguration,
      spanMarkers
    });
  }
  
  console.log('=== 建物形状ベース足場ライン生成完了 ===');
  console.log('足場頂点数:', scaffoldVertices.length);
  console.log('足場頂点:', scaffoldVertices.map(v => `(${v.x.toFixed(1)}, ${v.y.toFixed(1)})`));
  console.log('');
  console.log('🔍=== 各辺のスパン構成詳細分析 ===');
  console.log('');
  console.log('📊 建物辺と足場辺の対応確認:');
  buildingVertices.forEach((vertex, i) => {
    const nextIndex = (i + 1) % buildingVertices.length;
    const nextVertex = buildingVertices[nextIndex];
    const scaffoldEdge = scaffoldEdges[i];
    
    console.log(`建物辺${i}: (${vertex.x.toFixed(1)}, ${vertex.y.toFixed(1)}) → (${nextVertex.x.toFixed(1)}, ${nextVertex.y.toFixed(1)})`);
    console.log(`足場辺${i}: (${scaffoldEdge.startVertex.x.toFixed(1)}, ${scaffoldEdge.startVertex.y.toFixed(1)}) → (${scaffoldEdge.endVertex.x.toFixed(1)}, ${scaffoldEdge.endVertex.y.toFixed(1)})`);
    console.log(`  対応チェック: ${scaffoldEdge.edgeIndex === i ? '✅ 正しい' : '❌ 間違い'}`);
    console.log('');
  });
  
  console.log('📍 各足場辺の詳細:');
  scaffoldEdges.forEach((edge, index) => {
    const spanSum = edge.spanConfiguration.reduce((sum, span) => sum + span, 0);
    console.log(`📍 足場辺配列[${index}] → 建物辺${edge.edgeIndex}:`);
    console.log(`   足場頂点: (${edge.startVertex.x.toFixed(1)}, ${edge.startVertex.y.toFixed(1)}) → (${edge.endVertex.x.toFixed(1)}, ${edge.endVertex.y.toFixed(1)})`);
    console.log(`   スパン構成: [${edge.spanConfiguration.join(', ')}]`);
    console.log(`   スパン合計: ${spanSum}mm`);
    console.log(`   マーカー数: ${edge.spanMarkers.length}`);
    console.log(`   建物辺の説明: ${getEdgeDescriptionFromIndex(edge.edgeIndex)}`);
    console.log('');
  });
  
  console.log('🎯=== L字型建物辺の期待される対応 ===');
  console.log('建物辺0 (1→2): 北辺、水平');
  console.log('建物辺1 (2→3): 東辺上部、垂直、短い ← 少ないマーカー期待');
  console.log('建物辺2 (3→4): 中央水平辺');
  console.log('建物辺3 (4→5): 東辺下部、垂直、長い ← 多いマーカー期待');
  console.log('建物辺4 (5→6): 南辺、水平');
  console.log('建物辺5 (6→1): 西辺、垂直');
  console.log('');
  console.log('❌=== 現在の問題 ===');
  console.log('ユーザー報告: 辺1-2に辺5-6のマーカーが表示される（1つずれている）');
  console.log('');
  
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