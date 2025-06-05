import { calculateAll } from '../engine';
import { ScaffoldInputData } from '../types';

describe('足場計算エンジン', () => {
  test('基本的な計算が正常に動作する', () => {
    const input: ScaffoldInputData = {
      width_NS: 10010,
      width_EW: 9100,
      eaves_N: 500,
      eaves_E: 500,
      eaves_S: 500,
      eaves_W: 500,
      boundary_N: 640,
      boundary_E: null,
      boundary_S: 600,
      boundary_W: null,
      standard_height: 6000,
      roof_shape: 'フラット',
      tie_column: true,
      railing_count: 3,
      use_355_NS: 1,
      use_300_NS: 0,
      use_150_NS: 1,
      use_355_EW: 0,
      use_300_EW: 0,
      use_150_EW: 0,
      target_margin: 1000
    };

    const result = calculateAll(input);

    // 基本的な結果の存在確認
    expect(result.ns_total_span).toBeGreaterThan(0);
    expect(result.ew_total_span).toBeGreaterThan(0);
    expect(result.ns_span_structure).toBeTruthy();
    expect(result.ew_span_structure).toBeTruthy();
    expect(result.num_stages).toBeGreaterThan(0);
    expect(result.modules_count).toBeGreaterThan(0);
    expect(result.jack_up_height).toBeGreaterThanOrEqual(0);
    expect(result.first_layer_height).toBeGreaterThan(0);
    
    // 離れ情報の存在確認
    expect(result.north_gap).toBeTruthy();
    expect(result.south_gap).toBeTruthy();
    expect(result.east_gap).toBeTruthy();
    expect(result.west_gap).toBeTruthy();
    
    // 根がらみ支柱情報
    expect(typeof result.tie_ok).toBe('boolean');
    expect(result.tie_column_used).toBe(true);
  });

  test('小さな建物での計算', () => {
    const input: ScaffoldInputData = {
      width_NS: 5400,
      width_EW: 7200,
      eaves_N: 300,
      eaves_E: 300,
      eaves_S: 300,
      eaves_W: 300,
      boundary_N: null,
      boundary_E: null,
      boundary_S: null,
      boundary_W: null,
      standard_height: 3000,
      roof_shape: '勾配軒',
      tie_column: false,
      railing_count: 1,
      use_355_NS: 0,
      use_300_NS: 1,
      use_150_NS: 0,
      use_355_EW: 0,
      use_300_EW: 0,
      use_150_EW: 0,
      target_margin: 600
    };

    const result = calculateAll(input);

    expect(result.ns_total_span).toBeGreaterThan(input.width_NS);
    expect(result.ew_total_span).toBeGreaterThan(input.width_EW);
    expect(result.tie_column_used).toBe(false);
    expect(result.num_stages).toBeGreaterThanOrEqual(1);
  });

  test('境界線制約のある計算', () => {
    const input: ScaffoldInputData = {
      width_NS: 8000,
      width_EW: 6000,
      eaves_N: 400,
      eaves_E: 400,
      eaves_S: 400,
      eaves_W: 400,
      boundary_N: 500,
      boundary_E: 800,
      boundary_S: 600,
      boundary_W: 700,
      standard_height: 4500,
      roof_shape: '陸屋根',
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

    const result = calculateAll(input);

    // 境界線制約下でも計算が完了することを確認
    expect(result.ns_total_span).toBeGreaterThan(0);
    expect(result.ew_total_span).toBeGreaterThan(0);
    expect(result.ns_span_structure).toBeTruthy();
    expect(result.ew_span_structure).toBeTruthy();
  });

  test('特殊部材なしの計算', () => {
    const input: ScaffoldInputData = {
      width_NS: 9000,
      width_EW: 7200,
      eaves_N: 450,
      eaves_E: 450,
      eaves_S: 450,
      eaves_W: 450,
      boundary_N: null,
      boundary_E: null,
      boundary_S: null,
      boundary_W: null,
      standard_height: 5200,
      roof_shape: 'フラット',
      tie_column: false,
      railing_count: 0,
      use_355_NS: 0,
      use_300_NS: 0,
      use_150_NS: 0,
      use_355_EW: 0,
      use_300_EW: 0,
      use_150_EW: 0,
      target_margin: 900
    };

    const result = calculateAll(input);

    expect(result.ns_total_span).toBeGreaterThan(0);
    expect(result.ew_total_span).toBeGreaterThan(0);
    expect(result.tie_column_used).toBe(false);
    expect(result.railing_count).toBe(0);
  });

  test('高い建物での計算', () => {
    const input: ScaffoldInputData = {
      width_NS: 12000,
      width_EW: 8000,
      eaves_N: 600,
      eaves_E: 600,
      eaves_S: 600,
      eaves_W: 600,
      boundary_N: null,
      boundary_E: null,
      boundary_S: null,
      boundary_W: null,
      standard_height: 12000,
      roof_shape: '勾配軒',
      tie_column: true,
      railing_count: 4,
      use_355_NS: 2,
      use_300_NS: 1,
      use_150_NS: 1,
      use_355_EW: 1,
      use_300_EW: 2,
      use_150_EW: 0,
      target_margin: 1200
    };

    const result = calculateAll(input);

    expect(result.num_stages).toBeGreaterThan(3); // 高い建物は段数が多い
    expect(result.modules_count).toBeGreaterThan(20); // コマ数も多くなる
    expect(result.ns_total_span).toBeGreaterThan(input.width_NS + 2000);
    expect(result.ew_total_span).toBeGreaterThan(input.width_EW + 2000);
  });
});