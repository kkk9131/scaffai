import { detectInsideCorners, Vertex } from '../insideCornerDetector';

describe('入隅検出ユーティリティ', () => {
  it('矩形（入隅なし）', () => {
    const rect: Vertex[] = [
      { x: 0, y: 0 },
      { x: 0, y: 100 },
      { x: 100, y: 100 },
      { x: 100, y: 0 },
    ];
    const result = detectInsideCorners(rect);
    expect(result.length).toBe(0);
  });

  it('L字型（1つの入隅）', () => {
    const lShape: Vertex[] = [
      { x: 0, y: 0 },
      { x: 0, y: 100 },
      { x: 50, y: 100 },
      { x: 50, y: 50 },   // ← ここが入隅（270°）
      { x: 100, y: 50 },
      { x: 100, y: 0 },
    ];
    const result = detectInsideCorners(lShape);
    console.log('L字型 入隅検出結果:', result);
    expect(result.length).toBe(1);
    expect(result[0].index).toBe(3);
    expect(result[0].angle).toBeGreaterThan(180);
  });

  it('実際のL字型建物の入隅検出', () => {
    // DrawingEditorで使われている実際の頂点配列と同じ形式
    const actualLShape: Vertex[] = [
      { x: 375, y: 100 }, // 0
      { x: 500, y: 100 }, // 1  
      { x: 500, y: 150 }, // 2 ← ここが入隅のはず
      { x: 625, y: 150 }, // 3
      { x: 625, y: 600 }, // 4
      { x: 375, y: 600 }, // 5
    ];
    const result = detectInsideCorners(actualLShape);
    console.log('実際のL字型建物 入隅検出結果:', result);
    console.log('各頂点の詳細:', actualLShape.map((v, i) => `${i}: (${v.x}, ${v.y})`));
    
    // 入隅は1箇所だけ検出されるべき
    expect(result.length).toBe(1);
    // index: 2の頂点が入隅
    expect(result[0].index).toBe(2);
    // 内角は180度を超えるべき
    expect(result[0].angle).toBeGreaterThan(180);
  });
});