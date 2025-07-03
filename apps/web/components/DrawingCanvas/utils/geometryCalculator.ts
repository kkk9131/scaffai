import type { BuildingVertex, EdgeInfo, CornerInfo } from '../types/drawing';

/**
 * 角度計算と幾何学的分析のユーティリティ
 */

/**
 * 2つの点間の距離を計算
 */
export function calculateDistance(point1: BuildingVertex, point2: BuildingVertex): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 2つの点間のベクトル角度を計算（ラジアン）
 */
export function calculateVectorAngle(start: BuildingVertex, end: BuildingVertex): number {
  return Math.atan2(end.y - start.y, end.x - start.x);
}

/**
 * ラジアンを度に変換
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180 / Math.PI + 360) % 360;
}

/**
 * 3点による角度を計算（内角）
 * @param prev 前の頂点
 * @param current 現在の頂点
 * @param next 次の頂点
 * @returns 内角（度）
 */
export function calculateCornerAngle(prev: BuildingVertex, current: BuildingVertex, next: BuildingVertex): number {
  // 前の点から現在の点へのベクトル
  const vector1 = {
    x: prev.x - current.x,
    y: prev.y - current.y
  };
  
  // 現在の点から次の点へのベクトル
  const vector2 = {
    x: next.x - current.x,
    y: next.y - current.y
  };
  
  // 外積を計算（符号で回転方向を判定）
  const crossProduct = vector1.x * vector2.y - vector1.y * vector2.x;
  
  // 内積を計算
  const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
  
  // ベクトルの長さ
  const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
  const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
  
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 180; // 直線の場合
  }
  
  // 角度を計算
  const cosAngle = dotProduct / (magnitude1 * magnitude2);
  const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI;
  
  // 外積の符号で内角・外角を判定
  // 時計回りの場合（外積が負）は外角、反時計回りの場合（外積が正）は内角
  return crossProduct > 0 ? angle : 360 - angle;
}

/**
 * 辺の法線ベクトル方向から面を判定
 */
export function getEdgeFaceDirection(startVertex: BuildingVertex, endVertex: BuildingVertex): 'north' | 'east' | 'south' | 'west' {
  // 辺のベクトル
  const edgeVector = {
    x: endVertex.x - startVertex.x,
    y: endVertex.y - startVertex.y
  };
  
  // 外向き法線ベクトル（右回り：辺ベクトルを90度時計回り回転）
  const normalVector = {
    x: edgeVector.y,  // 90度時計回り回転
    y: -edgeVector.x
  };
  
  // 法線ベクトルの角度を計算
  const angle = Math.atan2(normalVector.y, normalVector.x);
  const degrees = (angle * 180 / Math.PI + 360) % 360;
  
  // 角度による面判定
  if (degrees >= 315 || degrees < 45) {
    return 'east';
  } else if (degrees >= 45 && degrees < 135) {
    return 'south';
  } else if (degrees >= 135 && degrees < 225) {
    return 'west';
  } else {
    return 'north';
  }
}

/**
 * 建物頂点から辺情報を生成
 */
export function generateEdgeInfo(vertices: BuildingVertex[]): EdgeInfo[] {
  if (vertices.length < 3) {
    return [];
  }
  
  const edges: EdgeInfo[] = [];
  
  for (let i = 0; i < vertices.length; i++) {
    const current = vertices[i];
    const next = vertices[(i + 1) % vertices.length];
    const prev = vertices[(i - 1 + vertices.length) % vertices.length];
    const nextNext = vertices[(i + 2) % vertices.length];
    
    // 辺の基本情報
    const length = calculateDistance(current, next);
    const direction = getEdgeFaceDirection(current, next);
    const angle = calculateVectorAngle(current, next);
    
    // 開始点と終了点の角度を計算
    const startCornerAngle = calculateCornerAngle(prev, current, next);
    const endCornerAngle = calculateCornerAngle(current, next, nextNext);
    
    // 入隅・出隅判定（建築用語に従い修正）
    const isInsideCorner = startCornerAngle > 180;  // 内角が180度超は入隅（建物が凹んでいる）
    const isOutsideCorner = startCornerAngle < 180; // 内角が180度未満は出隅（建物が凸出している）
    
    edges.push({
      edgeIndex: i,
      startVertex: current,
      endVertex: next,
      length,
      direction,
      angle: radiansToDegrees(angle),
      isInsideCorner,
      isOutsideCorner
    });
  }
  
  return edges;
}

/**
 * 建物頂点から角情報を生成
 */
export function generateCornerInfo(vertices: BuildingVertex[]): CornerInfo[] {
  if (vertices.length < 3) {
    return [];
  }
  
  const corners: CornerInfo[] = [];
  const edges = generateEdgeInfo(vertices);
  
  for (let i = 0; i < vertices.length; i++) {
    const current = vertices[i];
    const prev = vertices[(i - 1 + vertices.length) % vertices.length];
    const next = vertices[(i + 1) % vertices.length];
    
    const angle = calculateCornerAngle(prev, current, next);
    
    let cornerType: 'inside' | 'outside' | 'straight';
    if (Math.abs(angle - 180) < 5) { // 5度の許容範囲
      cornerType = 'straight';
    } else if (angle < 180) {
      cornerType = 'inside';
    } else {
      cornerType = 'outside';
    }
    
    // 入力辺と出力辺を取得
    const incomingEdge = edges[(i - 1 + edges.length) % edges.length];
    const outgoingEdge = edges[i];
    
    corners.push({
      vertexIndex: i,
      vertex: current,
      cornerType,
      angle,
      incomingEdge,
      outgoingEdge
    });
  }
  
  return corners;
}

/**
 * 入隅辺を検出し、対応する面の基本離れと組み合わせる
 */
export function findInsideCornerEdges(
  vertices: BuildingVertex[],
  simpleCalculationResult: { north: number; east: number; south: number; west: number }
): { edge: EdgeInfo; baseDistance: number; faceName: string }[] {
  const corners = generateCornerInfo(vertices);
  const edges = generateEdgeInfo(vertices);
  
  const insideCornerEdges: { edge: EdgeInfo; baseDistance: number; faceName: string }[] = [];
  
  corners.forEach(corner => {
    if (corner.cornerType === 'inside') {
      // この入隅から出る辺（出力辺）を入隅辺として扱う
      const insideEdge = corner.outgoingEdge;
      
      // 面の基本離れを取得
      let baseDistance: number;
      let faceName: string;
      
      switch (insideEdge.direction) {
        case 'north':
          baseDistance = simpleCalculationResult.north;
          faceName = '北面';
          break;
        case 'east':
          baseDistance = simpleCalculationResult.east;
          faceName = '東面';
          break;
        case 'south':
          baseDistance = simpleCalculationResult.south;
          faceName = '南面';
          break;
        case 'west':
          baseDistance = simpleCalculationResult.west;
          faceName = '西面';
          break;
      }
      
      insideCornerEdges.push({
        edge: insideEdge,
        baseDistance,
        faceName
      });
    }
  });
  
  console.log('入隅辺検出結果:', insideCornerEdges.map(item => ({
    edgeIndex: item.edge.edgeIndex,
    direction: item.edge.direction,
    faceName: item.faceName,
    length: item.edge.length.toFixed(1),
    baseDistance: item.baseDistance
  })));
  
  return insideCornerEdges;
}

/**
 * 入隅方向辺を特定（入隅計算で使用する allocation distance）
 */
export function findAllocationEdge(
  targetEdge: EdgeInfo,
  vertices: BuildingVertex[]
): { edge: EdgeInfo | null; length: number } {
  const corners = generateCornerInfo(vertices);
  
  // 目標辺の開始頂点を見つける
  const startVertexIndex = vertices.findIndex(v => 
    v.x === targetEdge.startVertex.x && v.y === targetEdge.startVertex.y
  );
  
  if (startVertexIndex === -1) {
    console.warn('目標辺の開始頂点が見つかりません');
    return { edge: null, length: 0 };
  }
  
  // その頂点の角情報を取得
  const corner = corners[startVertexIndex];
  
  if (corner.cornerType === 'inside') {
    // 入隅の場合、入力辺（incoming edge）が割付距離となる
    const allocationEdge = corner.incomingEdge;
    console.log(`辺${targetEdge.edgeIndex}の割付距離: 辺${allocationEdge.edgeIndex} (${allocationEdge.length.toFixed(1)}mm)`);
    
    return {
      edge: allocationEdge,
      length: allocationEdge.length
    };
  }
  
  console.warn(`辺${targetEdge.edgeIndex}は入隅ではありません`);
  return { edge: null, length: 0 };
}