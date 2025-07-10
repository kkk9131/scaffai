import { calcOuterSpan } from '../outerSpanCalculator';

describe('外周スパン計算ユーティリティ', () => {
  it('矩形建物: 10000mm, 軒の出1000mm', () => {
    const result = calcOuterSpan({ buildingLength: 10000, eave: 1000 });
    expect(result.minRequiredDistance).toBe(1080);
    expect(result.totalSpan).toBeGreaterThanOrEqual(10000 + 1080 * 2);
    expect(result.spanConfig.length).toBeGreaterThan(0);
    expect(result.actualDistance).toBeGreaterThanOrEqual(1080);
  });

  it('矩形建物: 5000mm, 軒の出800mm', () => {
    const result = calcOuterSpan({ buildingLength: 5000, eave: 800 });
    expect(result.minRequiredDistance).toBe(880);
    expect(result.totalSpan).toBeGreaterThanOrEqual(5000 + 880 * 2);
    expect(result.spanConfig.length).toBeGreaterThan(0);
    expect(result.actualDistance).toBeGreaterThanOrEqual(880);
  });
});