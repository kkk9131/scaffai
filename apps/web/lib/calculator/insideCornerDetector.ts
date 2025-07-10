// 頂点型（例: { x: number, y: number }）
export type Vertex = { x: number; y: number };

// 入隅情報
export type InsideCorner = {
  index: number;      // 頂点インデックス
  position: Vertex;   // 頂点座標
  angle: number;      // 内角（度）
};

/**
 * 2点間のベクトル
 */
function vector(a: Vertex, b: Vertex): { x: number; y: number } {
  return { x: b.x - a.x, y: b.y - a.y };
}

/**
 * 2ベクトルのなす角（度）を0〜360°で返す
 */
function angleBetween(v1: { x: number; y: number }, v2: { x: number; y: number }): number {
  const dot = v1.x * v2.x + v1.y * v2.y;
  const det = v1.x * v2.y - v1.y * v2.x;
  const rad = Math.atan2(det, dot);
  let deg = (rad * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg;
}


/**
 * 多角形の符号付き面積で回転方向を判定（正:反時計回り, 負:時計回り）
 */
function getPolygonOrientation(vertices: Vertex[]): 1 | -1 {
  let sum = 0;
  for (let i = 0; i < vertices.length; i++) {
    const curr = vertices[i];
    const next = vertices[(i + 1) % vertices.length];
    sum += (next.x - curr.x) * (next.y + curr.y);
  }
  return sum > 0 ? 1 : -1; // 1:CW, -1:CCW
}

/**
 * 入隅（内角180°より大きい）を正しく検出
 */
export function detectInsideCorners(vertices: Vertex[]): InsideCorner[] {
  const n = vertices.length;
  const result: InsideCorner[] = [];
  
  // 多角形の向きを判定
  const orientation = getPolygonOrientation(vertices);
  
  for (let i = 0; i < n; i++) {
    const prev = vertices[(i - 1 + n) % n];
    const curr = vertices[i];
    const next = vertices[(i + 1) % n];
    
    // ベクトル: prev→curr, curr→next
    const v1 = vector(prev, curr);
    const v2 = vector(curr, next);
    
    // 外積計算
    const cross = v1.x * v2.y - v1.y * v2.x;
    
    // 内角計算: ベクトルのなす角
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    
    let angle = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2)))) * 180 / Math.PI;
    
    // 多角形の向きと外積の符号で内角を決定
    if (orientation === 1) { // 時計回り
      if (cross > 0) {
        // 左折 = 凹角（入隅）
        angle = 360 - angle;
      }
      // cross <= 0: 右折 = 凸角, angleはそのまま
    } else { // 反時計回り
      if (cross < 0) {
        // 右折 = 凹角（入隅）
        angle = 360 - angle;
      }
      // cross >= 0: 左折 = 凸角, angleはそのまま
    }
    
    // 内角が180度を超える場合は入隅
    if (angle > 180) {
      result.push({ index: i, position: curr, angle });
    }
  }
  return result;
}

export {};