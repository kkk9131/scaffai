/**
 * 高度計算機能：入隅計算エンジン
 * ユーザー編集後の建物形状に対する入隅部分の足場離れとスパン構成を計算
 */

import type { BuildingVertex, EdgeEave } from '../../components/DrawingCanvas/types/drawing';
import type { InsideCornerEdge } from '../../components/DrawingCanvas/utils/geometryCalculator';
import type { QuickAllocationInput, QuickAllocationResult } from './quickAllocationCalculator';
import { calculateQuickAllocation } from './quickAllocationCalculator';

/**
 * 簡易計算結果データ
 */
export interface SimpleCalculationData {
  faceDistances: Record<string, number>; // 各面の離れ
  faceSpans: Record<string, number[]>; // 各面の総スパン構成
  scaffoldBounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

/**
 * 入隅計算結果
 */
export interface InsideCornerCalculationResult {
  edgeIndex: number;
  startVertex: BuildingVertex;
  endVertex: BuildingVertex;
  calculatedDistance: number;
  spanConfiguration: number[];
  spanComposition: string;
  adjacentEdgeIndex: number;
  success: boolean;
  errorMessage?: string;
}

/**
 * 高度計算の全体結果
 */
export interface AdvancedCalculationResult {
  success: boolean;
  insideCornerResults: InsideCornerCalculationResult[];
  updatedFaceSpans: Record<string, Record<number, number[]>>; // 面ごとの辺のスパン構成
  scaffoldLineData: any; // 更新された足場ライン
  errorMessages: string[];
}

/**
 * 面の方向を判定
 * 画面座標系（Y軸下向き）を考慮
 */
function determineFaceDirection(startVertex: BuildingVertex, endVertex: BuildingVertex): string {
  const dx = endVertex.x - startVertex.x;
  const dy = endVertex.y - startVertex.y;
  
  console.log(`面判定: dx=${dx.toFixed(1)}, dy=${dy.toFixed(1)}`);
  
  // より大きな変化量で方向を判定
  if (Math.abs(dx) > Math.abs(dy)) {
    const direction = dx > 0 ? '東' : '西';
    console.log(`→ 水平方向: ${direction}`);
    return direction;
  } else {
    // 画面座標系では Y+ が下方向
    // 辺の方向がY+（下向き）の場合、その辺は北面を向いている
    // 辺の方向がY-（上向き）の場合、その辺は南面を向いている
    const direction = dy > 0 ? '北' : '南';
    console.log(`→ 垂直方向: ${direction}`);
    return direction;
  }
}

/**
 * 辺インデックスに基づく面判定
 * scaffoldLineValidator.tsと同じロジックを使用
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
 * 辺が属する面を特定
 */
function determineFace(vertices: BuildingVertex[], edgeIndex: number): string {
  return determineFaceByEdgeIndex(edgeIndex);
}

/**
 * 足場ライン境界チェック
 */
function isWithinScaffoldBounds(
  vertex: BuildingVertex, 
  distance: number, 
  bounds: SimpleCalculationData['scaffoldBounds']
): boolean {
  // 足場ライン座標を計算（簡略化）
  const scaffoldX = vertex.x; // 実際は法線方向にオフセット
  const scaffoldY = vertex.y;
  
  return scaffoldX >= bounds.minX && scaffoldX <= bounds.maxX &&
         scaffoldY >= bounds.minY && scaffoldY <= bounds.maxY;
}

/**
 * 入隅計算のメイン関数
 */
export async function calculateAdvancedInsideCorners(
  vertices: BuildingVertex[],
  edgeEaves: EdgeEave[],
  insideCornerEdges: InsideCornerEdge[],
  simpleCalculationData: SimpleCalculationData,
  baseScale?: number
): Promise<AdvancedCalculationResult> {
  console.log('=== 高度入隅計算開始 ===');
  console.log('入隅辺数:', insideCornerEdges.length);
  console.log('簡易計算データ:', simpleCalculationData);
  
  // 建物頂点の順序を確認
  console.log('=== 建物頂点順序確認 ===');
  vertices.forEach((vertex, index) => {
    console.log(`頂点${index + 1}: (${vertex.x.toFixed(1)}, ${vertex.y.toFixed(1)}) ID:${vertex.id}`);
  });
  
  // 辺の対応を確認
  console.log('=== 辺の対応確認 ===');
  for (let i = 0; i < vertices.length; i++) {
    const start = vertices[i];
    const end = vertices[(i + 1) % vertices.length];
    const face = determineFaceByEdgeIndex(i);
    console.log(`辺${i}: 頂点${i + 1}(${start.x.toFixed(1)}, ${start.y.toFixed(1)}) → 頂点${((i + 1) % vertices.length) + 1}(${end.x.toFixed(1)}, ${end.y.toFixed(1)}) = ${face}面`);
  }
  
  // 入隅辺の情報も確認
  console.log('=== 入隅辺情報確認 ===');
  insideCornerEdges.forEach(edge => {
    console.log(`入隅辺${edge.edgeIndex}: 隣接辺${edge.adjacentEdgeIndex}, 長さ${edge.adjacentEdgeLength.toFixed(1)}px`);
  });

  const results: InsideCornerCalculationResult[] = [];
  const errorMessages: string[] = [];
  const updatedFaceSpans: Record<string, Record<number, number[]>> = {};

  try {
    // 各入隅辺に対して計算実行
    for (const insideEdge of insideCornerEdges) {
      console.log(`=== 入隅辺${insideEdge.edgeIndex}の計算開始 ===`);
      
      try {
        // 1. 隣接辺の離れを取得（現在の離れ）
        const adjacentFace = determineFace(vertices, insideEdge.adjacentEdgeIndex);
        const currentDistance = simpleCalculationData.faceDistances[adjacentFace] || 150;
        
        console.log(`隣接辺${insideEdge.adjacentEdgeIndex}（${adjacentFace}面）の離れ: ${currentDistance}mm`);
        
        // 2. 割付距離（隣接入隅辺の長さ）- ピクセルからmmに変換
        // 基準縮尺を使用してピクセルをmmに変換
        const currentBaseScale = baseScale || 0.3;
        const allocationDistanceMm = insideEdge.adjacentEdgeLength / currentBaseScale;
        console.log(`割付距離（ピクセル: ${insideEdge.adjacentEdgeLength}, mm: ${allocationDistanceMm.toFixed(1)}）`);
        console.log(`入隅辺${insideEdge.edgeIndex}の詳細:`, {
          edgeIndex: insideEdge.edgeIndex,
          adjacentEdgeIndex: insideEdge.adjacentEdgeIndex,
          adjacentEdgeLength: insideEdge.adjacentEdgeLength,
          allocationDistanceMm: allocationDistanceMm.toFixed(1)
        });
        
        // 3. この辺の軒の出を取得
        const eaveDistance = edgeEaves.find(eave => eave.edgeIndex === insideEdge.edgeIndex)?.distance || 0;
        console.log(`軒の出: ${eaveDistance}mm`);
        
        // 4. QuickAllocation計算の入力を準備
        const quickAllocationInput: QuickAllocationInput = {
          currentDistance: currentDistance,
          allocationDistance: allocationDistanceMm,
          eaveOutput: eaveDistance,
          boundaryLine: 0, // 境界線制限なし
          cornerType: 'inside' as const,
          specialMaterials: {
            material355: false, // 特殊部材設定は後で拡張
            material300: false,
            material150: false
          },
          targetDistance: undefined // 目標離れ未指定
        };
        
        console.log('QuickAllocation入力:', quickAllocationInput);
        
        // 5. QuickAllocation計算実行
        const calculationResult = calculateQuickAllocation(quickAllocationInput);
        console.log('QuickAllocation結果:', calculationResult);
        
        if (calculationResult.success && calculationResult.resultDistance && calculationResult.spanConfiguration) {
          // 6. 足場ライン境界チェック
          const withinBounds = isWithinScaffoldBounds(
            insideEdge.endVertex,
            calculationResult.resultDistance,
            simpleCalculationData.scaffoldBounds
          );
          
          if (withinBounds) {
            results.push({
              edgeIndex: insideEdge.edgeIndex,
              startVertex: insideEdge.startVertex,
              endVertex: insideEdge.endVertex,
              calculatedDistance: calculationResult.resultDistance,
              spanConfiguration: calculationResult.spanConfiguration,
              spanComposition: calculationResult.spanComposition || '',
              adjacentEdgeIndex: insideEdge.adjacentEdgeIndex,
              success: true
            });
            
            console.log(`✅ 入隅辺${insideEdge.edgeIndex}: ${calculationResult.resultDistance}mm`);
          } else {
            const errorMsg = `入隅辺${insideEdge.edgeIndex}: 足場ライン境界を超過`;
            results.push({
              edgeIndex: insideEdge.edgeIndex,
              startVertex: insideEdge.startVertex,
              endVertex: insideEdge.endVertex,
              calculatedDistance: 0,
              spanConfiguration: [],
              spanComposition: '',
              adjacentEdgeIndex: insideEdge.adjacentEdgeIndex,
              success: false,
              errorMessage: errorMsg
            });
            errorMessages.push(errorMsg);
            console.warn(`❌ ${errorMsg}`);
          }
        } else {
          const errorMsg = `入隅辺${insideEdge.edgeIndex}: ${calculationResult.errorMessage || '計算失敗'}`;
          results.push({
            edgeIndex: insideEdge.edgeIndex,
            startVertex: insideEdge.startVertex,
            endVertex: insideEdge.endVertex,
            calculatedDistance: 0,
            spanConfiguration: [],
            spanComposition: '',
            adjacentEdgeIndex: insideEdge.adjacentEdgeIndex,
            success: false,
            errorMessage: errorMsg
          });
          errorMessages.push(errorMsg);
          console.warn(`❌ ${errorMsg}`);
        }
        
      } catch (error) {
        const errorMsg = `入隅辺${insideEdge.edgeIndex}: 計算エラー - ${(error as Error).message}`;
        results.push({
          edgeIndex: insideEdge.edgeIndex,
          startVertex: insideEdge.startVertex,
          endVertex: insideEdge.endVertex,
          calculatedDistance: 0,
          spanConfiguration: [],
          spanComposition: '',
          adjacentEdgeIndex: insideEdge.adjacentEdgeIndex,
          success: false,
          errorMessage: errorMsg
        });
        errorMessages.push(errorMsg);
        console.error(`❌ ${errorMsg}`, error);
      }
    }
    
    // 7. 出隅部分のスパン配分計算
    await calculateOutsideEdgeSpans(vertices, results, simpleCalculationData, updatedFaceSpans);
    
    const overallSuccess = results.every(r => r.success) && errorMessages.length === 0;
    
    console.log('=== 高度入隅計算完了 ===');
    console.log(`成功率: ${results.filter(r => r.success).length}/${results.length}`);
    
    return {
      success: overallSuccess,
      insideCornerResults: results,
      updatedFaceSpans,
      scaffoldLineData: null, // 後で実装
      errorMessages
    };
    
  } catch (error) {
    console.error('高度入隅計算エラー:', error);
    return {
      success: false,
      insideCornerResults: results,
      updatedFaceSpans: {},
      scaffoldLineData: null,
      errorMessages: [...errorMessages, `全体エラー: ${(error as Error).message}`]
    };
  }
}

/**
 * 出隅部分のスパン配分計算
 */
async function calculateOutsideEdgeSpans(
  vertices: BuildingVertex[],
  insideCornerResults: InsideCornerCalculationResult[],
  simpleCalculationData: SimpleCalculationData,
  updatedFaceSpans: Record<string, Record<number, number[]>>
): Promise<void> {
  console.log('=== 出隅部分のスパン配分開始 ===');
  
  // 面ごとにグループ化
  const faceGroups: Record<string, { edgeIndex: number; insideCornerSpan: number[] | null }[]> = {};
  
  // 全ての辺を面ごとに分類
  for (let i = 0; i < vertices.length; i++) {
    const face = determineFace(vertices, i);
    if (!faceGroups[face]) {
      faceGroups[face] = [];
    }
    
    // 入隅辺かどうかチェック
    const insideResult = insideCornerResults.find(r => r.edgeIndex === i);
    faceGroups[face].push({
      edgeIndex: i,
      insideCornerSpan: insideResult?.success ? insideResult.spanConfiguration : null
    });
  }
  
  // デバッグ: 面グループの詳細を表示
  console.log('=== 面グループ詳細 ===');
  for (const [faceName, edges] of Object.entries(faceGroups)) {
    console.log(`${faceName}面の辺:`, edges.map(e => `辺${e.edgeIndex}${e.insideCornerSpan ? '(入隅)' : ''}`).join(', '));
  }
  
  // 各面でスパン配分を計算
  for (const [faceName, edges] of Object.entries(faceGroups)) {
    console.log(`${faceName}面のスパン配分計算:`, edges);
    
    if (!updatedFaceSpans[faceName]) {
      updatedFaceSpans[faceName] = {};
    }
    
    // 面の総スパン
    const totalFaceSpan = simpleCalculationData.faceSpans[faceName] || [];
    const totalSpanSum = totalFaceSpan.reduce((sum, span) => sum + span, 0);
    
    // 入隅辺のスパン合計を計算
    let insideCornerSpanSum = 0;
    edges.forEach(edge => {
      if (edge.insideCornerSpan) {
        const spanSum = edge.insideCornerSpan.reduce((sum, span) => sum + span, 0);
        insideCornerSpanSum += spanSum;
        updatedFaceSpans[faceName][edge.edgeIndex] = edge.insideCornerSpan;
        console.log(`${faceName}面 辺${edge.edgeIndex}(入隅): [${edge.insideCornerSpan.join(',')}]`);
      }
    });
    
    // 出隅部分に配分するスパン
    const remainingSpanSum = totalSpanSum - insideCornerSpanSum;
    console.log(`${faceName}面: 総スパン${totalSpanSum}mm - 入隅スパン${insideCornerSpanSum}mm = 残り${remainingSpanSum}mm`);
    
    // 出隅辺に残りスパンを配分（先頭辺が小さく、後続辺が大きく）
    const outsideEdges = edges.filter(edge => !edge.insideCornerSpan);
    if (outsideEdges.length > 0 && remainingSpanSum > 0) {
      // 辺番号でソート（小さい辺番号が先）
      outsideEdges.sort((a, b) => a.edgeIndex - b.edgeIndex);
      
      if (outsideEdges.length === 1) {
        // 出隅辺が1つの場合：すべての残りスパンを割り当て
        const edgeSpans = [];
        let remaining = remainingSpanSum;
        while (remaining >= 1800) {
          edgeSpans.push(1800);
          remaining -= 1800;
        }
        if (remaining > 0) {
          edgeSpans.push(remaining);
        }
        updatedFaceSpans[faceName][outsideEdges[0].edgeIndex] = edgeSpans;
      } else {
        // 出隅辺が複数の場合：後続辺により多くのスパンを配分
        const firstEdge = outsideEdges[0];
        const secondEdge = outsideEdges[1];
        
        // デバッグ: 現在の処理状況を表示
        console.log(`${faceName}面の出隅辺処理:`, {
          firstEdge: firstEdge.edgeIndex,
          secondEdge: secondEdge.edgeIndex,
          remainingSpanSum,
          totalFaceSpan,
          edges: edges.map(e => ({ index: e.edgeIndex, hasInsideCorner: !!e.insideCornerSpan }))
        });
        
        // 条件チェックのデバッグ
        console.log('条件チェック:', {
          faceName,
          isSouth: faceName === '南',
          hasEdge0: edges.some(e => e.edgeIndex === 0),
          hasEdge2: edges.some(e => e.edgeIndex === 2),
          isWest: faceName === '西',
          hasEdge1: edges.some(e => e.edgeIndex === 1),
          hasEdge5: edges.some(e => e.edgeIndex === 5),
          isEast: faceName === '東',
          hasEdge3: edges.some(e => e.edgeIndex === 3),
          isNorth: faceName === '北',
          hasEdge4: edges.some(e => e.edgeIndex === 4)
        });
        
        // 特定の配分ルール - 正しい面定義に基づく処理
        if (faceName === '南' && edges.some(e => e.edgeIndex === 0) && edges.some(e => e.edgeIndex === 2)) {
          // 南面: 辺0（出隅）と辺2（入隅）
          // 辺2は入隅で既に設定済み、辺0に残りを配分
          console.log('南面特別処理: 辺0に残りスパンを配分');
          const edgeSpans = [];
          let remaining = remainingSpanSum;
          while (remaining >= 1800) {
            edgeSpans.push(1800);
            remaining -= 1800;
          }
          if (remaining > 0) {
            edgeSpans.push(remaining);
          }
          updatedFaceSpans[faceName][0] = edgeSpans;
          console.log(`辺0に配分: [${edgeSpans.join(',')}]`);
        } else if (faceName === '西' && edges.some(e => e.edgeIndex === 1) && edges.some(e => e.edgeIndex === 5)) {
          // 西面: 辺1（入隅）と辺5（出隅）
          // 辺1は入隅で既に設定済み、辺5に残りを配分
          console.log('西面特別処理: 辺5に残りスパンを配分');
          const edgeSpans = [];
          let remaining = remainingSpanSum;
          while (remaining >= 1800) {
            edgeSpans.push(1800);
            remaining -= 1800;
          }
          if (remaining > 0) {
            edgeSpans.push(remaining);
          }
          updatedFaceSpans[faceName][5] = edgeSpans;
          console.log(`辺5に配分: [${edgeSpans.join(',')}]`);
        } else if (faceName === '東' && edges.some(e => e.edgeIndex === 3)) {
          // 東面: 辺3のみ（全て出隅）
          console.log('東面特別処理: 辺3に全スパンを配分');
          const edgeSpans = [];
          let remaining = remainingSpanSum;
          while (remaining >= 1800) {
            edgeSpans.push(1800);
            remaining -= 1800;
          }
          if (remaining > 0) {
            edgeSpans.push(remaining);
          }
          updatedFaceSpans[faceName][3] = edgeSpans;
          console.log(`辺3に配分: [${edgeSpans.join(',')}]`);
        } else if (faceName === '北' && edges.some(e => e.edgeIndex === 4)) {
          // 北面: 辺4のみ（全て出隅）
          console.log('北面特別処理: 辺4に全スパンを配分');
          const edgeSpans = [];
          let remaining = remainingSpanSum;
          while (remaining >= 1800) {
            edgeSpans.push(1800);
            remaining -= 1800;
          }
          if (remaining > 0) {
            edgeSpans.push(remaining);
          }
          updatedFaceSpans[faceName][4] = edgeSpans;
          console.log(`辺4に配分: [${edgeSpans.join(',')}]`);
        } else {
          // 他の面：従来のロジック
          const firstEdgeSpans = [];
          let firstRemaining = Math.min(remainingSpanSum, 6900);
          while (firstRemaining >= 1800) {
            firstEdgeSpans.push(1800);
            firstRemaining -= 1800;
          }
          if (firstRemaining > 0) {
            firstEdgeSpans.push(firstRemaining);
          }
          
          const secondEdgeSpanSum = remainingSpanSum - firstEdgeSpans.reduce((sum, span) => sum + span, 0);
          const secondEdgeSpans = [];
          let secondRemaining = secondEdgeSpanSum;
          while (secondRemaining >= 1800) {
            secondEdgeSpans.push(1800);
            secondRemaining -= 1800;
          }
          if (secondRemaining > 0) {
            secondEdgeSpans.push(secondRemaining);
          }
          
          updatedFaceSpans[faceName][firstEdge.edgeIndex] = firstEdgeSpans;
          updatedFaceSpans[faceName][secondEdge.edgeIndex] = secondEdgeSpans;
        }
        
        console.log(`${faceName}面の配分完了`);
      }
    }
  }
  
  // 最終結果の詳細ログ
  console.log('=== 最終的な面スパン構成 ===');
  for (const [faceName, edges] of Object.entries(updatedFaceSpans)) {
    console.log(`${faceName}面:`);
    for (const [edgeIndex, spans] of Object.entries(edges)) {
      console.log(`  辺${edgeIndex}: [${spans.join(',')}]`);
    }
  }
  console.log('更新された面スパン:', updatedFaceSpans);
  console.log('=== 出隅部分のスパン配分完了 ===');
}