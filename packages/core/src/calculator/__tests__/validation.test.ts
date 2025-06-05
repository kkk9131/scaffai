import { validateScaffoldInput, normalizeScaffoldInput } from '../validation';
import { ScaffoldInputData } from '../types';

describe('バリデーション', () => {
  const validInput: ScaffoldInputData = {
    width_NS: 8000,
    width_EW: 6000,
    eaves_N: 400,
    eaves_E: 400,
    eaves_S: 400,
    eaves_W: 400,
    boundary_N: 500,
    boundary_E: null,
    boundary_S: 600,
    boundary_W: null,
    standard_height: 4500,
    roof_shape: 'フラット',
    tie_column: true,
    railing_count: 2,
    use_355_NS: 1,
    use_300_NS: 0,
    use_150_NS: 1,
    use_355_EW: 0,
    use_300_EW: 1,
    use_150_EW: 0,
    target_margin: 800
  };

  test('正常なデータのバリデーション', () => {
    const result = validateScaffoldInput(validInput);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('躯体寸法の異常値検出', () => {
    const invalidInput = { ...validInput, width_NS: -1000 };
    const result = validateScaffoldInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'width_NS')).toBe(true);
  });

  test('躯体寸法の過大値検出', () => {
    const invalidInput = { ...validInput, width_EW: 60000 };
    const result = validateScaffoldInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'width_EW')).toBe(true);
  });

  test('軒の出の負の値検出', () => {
    const invalidInput = { ...validInput, eaves_N: -100 };
    const result = validateScaffoldInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'eaves_N')).toBe(true);
  });

  test('基準高さの異常値検出', () => {
    const invalidInput = { ...validInput, standard_height: 500 };
    const result = validateScaffoldInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'standard_height')).toBe(true);
  });

  test('無効な屋根形状の検出', () => {
    const invalidInput = { ...validInput, roof_shape: '無効な形状' as any };
    const result = validateScaffoldInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'roof_shape')).toBe(true);
  });

  test('軒先手すりの範囲外値検出', () => {
    const invalidInput = { ...validInput, railing_count: 10 };
    const result = validateScaffoldInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'railing_count')).toBe(true);
  });

  test('特殊部材の負の値検出', () => {
    const invalidInput = { ...validInput, use_355_NS: -1 };
    const result = validateScaffoldInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'use_355_NS')).toBe(true);
  });

  test('特殊部材の過大値検出', () => {
    const invalidInput = { ...validInput, use_300_EW: 15 };
    const result = validateScaffoldInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'use_300_EW')).toBe(true);
  });
});

describe('正規化', () => {
  test('文字列数値の変換', () => {
    const input = {
      width_NS: '8000' as any,
      width_EW: '6000' as any,
      eaves_N: '400' as any,
      standard_height: '4500' as any,
      roof_shape: 'フラット' as const,
      tie_column: true,
      railing_count: '2' as any,
      target_margin: '800' as any
    };

    const normalized = normalizeScaffoldInput(input);
    
    expect(typeof normalized.width_NS).toBe('number');
    expect(normalized.width_NS).toBe(8000);
    expect(typeof normalized.width_EW).toBe('number');
    expect(normalized.width_EW).toBe(6000);
    expect(typeof normalized.railing_count).toBe('number');
    expect(normalized.railing_count).toBe(2);
  });

  test('負の値の0への変換', () => {
    const input = {
      width_NS: -1000,
      eaves_N: -100,
      target_margin: -500
    };

    const normalized = normalizeScaffoldInput(input);
    
    expect(normalized.width_NS).toBe(0);
    expect(normalized.eaves_N).toBe(0);
    expect(normalized.target_margin).toBe(0);
  });

  test('範囲外の値の制限', () => {
    const input = {
      railing_count: 10
    };

    const normalized = normalizeScaffoldInput(input);
    
    expect(normalized.railing_count).toBe(4); // 最大値に制限
  });

  test('null値の保持', () => {
    const input = {
      boundary_N: null,
      boundary_E: null
    };

    const normalized = normalizeScaffoldInput(input);
    
    expect(normalized.boundary_N).toBeNull();
    expect(normalized.boundary_E).toBeNull();
  });

  test('デフォルト値の設定', () => {
    const input = {};

    const normalized = normalizeScaffoldInput(input);
    
    expect(normalized.roof_shape).toBe('フラット');
    expect(normalized.tie_column).toBe(false);
    expect(normalized.target_margin).toBe(900);
  });
});