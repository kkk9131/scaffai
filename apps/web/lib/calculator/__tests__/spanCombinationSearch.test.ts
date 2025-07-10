import { findMinSpanCombination } from '../spanCombinationSearch';

describe('スパン構成探索アルゴリズム', () => {
  it('5000mmを満たす最小構成', () => {
    const result = findMinSpanCombination(5000);
    expect(result.reduce((a, b) => a + b, 0)).toBeGreaterThanOrEqual(5000);
    expect(result.length).toBeGreaterThan(0);
  });

  it('3000mmを満たす最小構成', () => {
    const result = findMinSpanCombination(3000);
    expect(result.reduce((a, b) => a + b, 0)).toBeGreaterThanOrEqual(3000);
    expect(result.length).toBeGreaterThan(0);
  });
});