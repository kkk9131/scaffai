// Debug script to test span calculations
const path = require('path');

// 計算エンジンのimport
const { calculateAll } = require('./lib/calculator/engine.ts');

// テストケース1: 5-6スパン (期待値: 4span(7200))
console.log("=== テストケース1: 5-6スパン ===");
console.log("期待値: 4span(7200)");

const test1 = {
  width_NS: 6000,  // 推定値（期待される総スパンから逆算）
  width_EW: 6000,
  eaves_N: 500,
  eaves_E: 500,
  eaves_S: 500,
  eaves_W: 500,
  boundary_N: null,
  boundary_E: null,
  boundary_S: null,
  boundary_W: null,
  standard_height: 5000,
  roof_shape: 'フラット',
  tie_column: false,
  railing_count: 1,
  use_355_NS: 0,
  use_300_NS: 0,
  use_150_NS: 0,
  use_355_EW: 0,
  use_300_EW: 0,
  use_150_EW: 0,
  target_margin_N: null,
  target_margin_E: null,
  target_margin_S: null,
  target_margin_W: null
};

try {
  const result1 = calculateAll(test1);
  console.log("実際の結果:");
  console.log("NS総スパン:", result1.ns_total_span);
  console.log("NSスパン構成:", result1.ns_span_structure);
  console.log("差分:", result1.ns_total_span - 7200, "mm");
  console.log("詳細:", result1);
} catch (e) {
  console.error("エラー:", e);
}

console.log("\n=== テストケース2: 6-1スパン ===");
console.log("期待値: 6span,1500(12300)");

const test2 = {
  width_NS: 10800,  // 推定値（期待される総スパンから逆算）
  width_EW: 10800,
  eaves_N: 500,
  eaves_E: 500,
  eaves_S: 500,
  eaves_W: 500,
  boundary_N: null,
  boundary_E: null,
  boundary_S: null,
  boundary_W: null,
  standard_height: 5000,
  roof_shape: 'フラット',
  tie_column: false,
  railing_count: 1,
  use_355_NS: 0,
  use_300_NS: 0,
  use_150_NS: 0,
  use_355_EW: 0,
  use_300_EW: 0,
  use_150_EW: 0,
  target_margin_N: null,
  target_margin_E: null,
  target_margin_S: null,
  target_margin_W: null
};

try {
  const result2 = calculateAll(test2);
  console.log("実際の結果:");
  console.log("NS総スパン:", result2.ns_total_span);
  console.log("NSスパン構成:", result2.ns_span_structure);
  console.log("差分:", result2.ns_total_span - 12300, "mm");
  console.log("詳細:", result2);
} catch (e) {
  console.error("エラー:", e);
}