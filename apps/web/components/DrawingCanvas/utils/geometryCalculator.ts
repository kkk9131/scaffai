// 幾何計算ユーティリティ

import type { BuildingVertex } from '../types/drawing';

// 内角を計算する関数
export function calculateInteriorAngle(
  prevVertex: BuildingVertex,
  currentVertex: BuildingVertex,
  nextVertex: BuildingVertex
): number {
  // ベクトル計算
  const v1 = {
    x: prevVertex.x - currentVertex.x,
    y: prevVertex.y - currentVertex.y
  };
  const v2 = {
    x: nextVertex.x - currentVertex.x,
    y: nextVertex.y - currentVertex.y
  };

  // 内積と外積
  const dot = v1.x * v2.x + v1.y * v2.y;
  const cross = v1.x * v2.y - v1.y * v2.x;

  // 角度を計算（ラジアンから度に変換）
  let angle = Math.atan2(Math.abs(cross), dot) * 180 / Math.PI;
  
  // 外積の符号で回転方向を判定
  if (cross < 0) {
    angle = 360 - angle;
  }

  return angle;
}

// 辺の長さを計算
export function calculateEdgeLength(start: BuildingVertex, end: BuildingVertex): number {
  return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
}

// 点が多角形の内部にあるかどうかを判定
export function isPointInPolygon(point: { x: number; y: number }, vertices: BuildingVertex[]): boolean {
  let inside = false;
  
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x, yi = vertices[i].y;
    const xj = vertices[j].x, yj = vertices[j].y;
    
    if (((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

// 多角形の重心を計算
export function calculateCentroid(vertices: BuildingVertex[]): { x: number; y: number } {
  const centroid = { x: 0, y: 0 };
  
  for (const vertex of vertices) {
    centroid.x += vertex.x;
    centroid.y += vertex.y;
  }
  
  centroid.x /= vertices.length;
  centroid.y /= vertices.length;
  
  return centroid;
}