// ユーティリティ関数：線分の交点を計算
export const calculateLineIntersection = (
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  p4: { x: number; y: number }
): { x: number; y: number } | null => {
  const d1x = p2.x - p1.x;
  const d1y = p2.y - p1.y;
  const d2x = p4.x - p3.x;
  const d2y = p4.y - p3.y;
  
  const denominator = d1x * d2y - d1y * d2x;
  
  if (Math.abs(denominator) < 1e-10) {
    return null;
  }
  
  const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / denominator;
  
  return {
    x: p1.x + t * d1x,
    y: p1.y + t * d1y
  };
};

// その他の幾何学計算関数もここに追加予定