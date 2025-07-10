import { calcInsideCornerSpan } from '../insideCornerSpanCalculator';
import { InsideCorner } from '../insideCornerDetector';

describe('入隅スパン構成計算ユーティリティ', () => {
  it('L字型入隅の計算', () => {
    const insideCorner: InsideCorner = {
      index: 2,
      position: { x: 100, y: 100 },
      angle: 90,
    };
    const result = calcInsideCornerSpan({
      insideCorner,
      prevEdgeLength: 5000,
      nextEdgeLength: 3000,
      minDistance: 1080,
    });
    expect(result.spanConfig.length).toBeGreaterThan(0);
    expect(result.actualDistance).toBeGreaterThanOrEqual(1080);
  });
});