// 300mmエラー調査用テストスクリプト

const { calculateAll } = require('./packages/core/src/calculator/engine');

// 問題のあるテストデータ（300mm過多になるパターン）
const testData = {
  width_NS: 4800,  // 南北方向の躯体幅
  width_EW: 7200,  // 東西方向の躯体幅
  eaves_N: 0,      // 北側軒の出
  eaves_E: 0,      // 東側軒の出
  eaves_S: 0,      // 南側軒の出
  eaves_W: 0,      // 西側軒の出
  boundary_N: null, // 北側境界線なし
  boundary_E: null, // 東側境界線なし
  boundary_S: null, // 南側境界線なし
  boundary_W: null, // 西側境界線なし
  standard_height: 2400,
  roof_shape: 'フラット',
  tie_column: false,
  railing_count: 0,
  use_355_NS: 0,
  use_300_NS: 0,
  use_150_NS: 0,
  use_355_EW: 0,
  use_300_EW: 0,
  use_150_EW: 0,
  target_margin_N: 900,  // 北側目標離れ
  target_margin_E: 900,  // 東側目標離れ
  target_margin_S: 900,  // 南側目標離れ
  target_margin_W: 900   // 西側目標離れ
};

console.log('==========================================');
console.log('300mm ERROR TEST - Expected vs Actual');
console.log('==========================================');

console.log('Input data:');
console.log(`  width_NS: ${testData.width_NS}mm`);
console.log(`  width_EW: ${testData.width_EW}mm`);
console.log(`  All eaves: ${testData.eaves_N}mm`);
console.log(`  All target_margins: ${testData.target_margin_N}mm`);
console.log(`  All boundaries: null`);

console.log('\nExpected results:');
const expectedNS = testData.width_NS + testData.target_margin_N + testData.target_margin_S;
const expectedEW = testData.width_EW + testData.target_margin_E + testData.target_margin_W;
console.log(`  NS total_span: ${expectedNS}mm (${testData.width_NS} + ${testData.target_margin_S} + ${testData.target_margin_N})`);
console.log(`  EW total_span: ${expectedEW}mm (${testData.width_EW} + ${testData.target_margin_E} + ${testData.target_margin_W})`);

console.log('\nActual calculation results:');
const result = calculateAll(testData);

console.log(`  NS total_span: ${result.ns_total_span}mm`);
console.log(`  EW total_span: ${result.ew_total_span}mm`);

console.log('\nDifference analysis:');
const nsDiff = result.ns_total_span - expectedNS;
const ewDiff = result.ew_total_span - expectedEW;
console.log(`  NS difference: ${nsDiff}mm ${nsDiff === 300 ? '❌ 300mm ERROR!' : (nsDiff === 0 ? '✅ OK' : '⚠️ Other error')}`);
console.log(`  EW difference: ${ewDiff}mm ${ewDiff === 300 ? '❌ 300mm ERROR!' : (ewDiff === 0 ? '✅ OK' : '⚠️ Other error')}`);

console.log('\nComplete result:');
console.log(result);