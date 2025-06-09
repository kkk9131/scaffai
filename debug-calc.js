// ScaffAI 計算エンジンの詳細デバッグスクリプト
const { calculateAll } = require('./packages/core/dist/calculator/engine');

// テストケース1: 基本的な計算
console.log('=== テストケース1: 基本的な計算 ===');
const testCase1 = {
  width_NS: 10000,
  width_EW: 8000,
  eaves_N: 500,
  eaves_E: 500,
  eaves_S: 500,
  eaves_W: 500,
  boundary_N: null,
  boundary_E: null,
  boundary_S: null,
  boundary_W: null,
  standard_height: 6000,
  roof_shape: 'フラット',
  tie_column: true,
  railing_count: 2,
  use_355_NS: 0,
  use_300_NS: 0,
  use_150_NS: 0,
  use_355_EW: 0,
  use_300_EW: 0,
  use_150_EW: 0,
  target_margin_N: 900,
  target_margin_E: 900,
  target_margin_S: 900,
  target_margin_W: 900
};

try {
  const result1 = calculateAll(testCase1);
  console.log('入力データ:', JSON.stringify(testCase1, null, 2));
  console.log('計算結果:', JSON.stringify(result1, null, 2));
  
  // 高さ計算の詳細チェック
  console.log('\n--- 高さ計算の詳細 ---');
  console.log('基準高さ:', testCase1.standard_height);
  console.log('屋根形状:', testCase1.roof_shape);
  console.log('段数:', result1.num_stages);
  console.log('1層目高さ:', result1.first_layer_height);
  console.log('ジャッキアップ高さ:', result1.jack_up_height);
  console.log('根がらみ支柱OK:', result1.tie_ok);
  console.log('根がらみ支柱使用:', result1.tie_column_used);
  
  // 計算検証
  const baseUnit = 1700; // フラット屋根
  const stageUnit = 1900;
  const expectedCalculation = testCase1.standard_height - baseUnit;
  console.log('期待される残り高さ:', expectedCalculation);
  console.log('1層目 + (段数-1) * 1900 =', result1.first_layer_height + (result1.num_stages - 1) * stageUnit);
  
} catch (error) {
  console.error('テストケース1でエラー:', error);
}

// テストケース2: 高い建物
console.log('\n=== テストケース2: 高い建物 ===');
const testCase2 = {
  ...testCase1,
  standard_height: 12000,
  roof_shape: '勾配軒'
};

try {
  const result2 = calculateAll(testCase2);
  console.log('入力データ:', JSON.stringify(testCase2, null, 2));
  console.log('計算結果:', JSON.stringify(result2, null, 2));
  
  console.log('\n--- 高さ計算の詳細 ---');
  console.log('基準高さ:', testCase2.standard_height);
  console.log('屋根形状:', testCase2.roof_shape);
  console.log('段数:', result2.num_stages);
  console.log('1層目高さ:', result2.first_layer_height);
  console.log('ジャッキアップ高さ:', result2.jack_up_height);
  
  const baseUnit = 1900; // 勾配軒
  const expectedCalculation = testCase2.standard_height - baseUnit;
  console.log('期待される残り高さ:', expectedCalculation);
  console.log('1層目 + (段数-1) * 1900 =', result2.first_layer_height + (result2.num_stages - 1) * 1900);
  
} catch (error) {
  console.error('テストケース2でエラー:', error);
}

// テストケース3: 低い建物
console.log('\n=== テストケース3: 低い建物 ===');
const testCase3 = {
  ...testCase1,
  standard_height: 3000,
  roof_shape: '陸屋根'
};

try {
  const result3 = calculateAll(testCase3);
  console.log('入力データ:', JSON.stringify(testCase3, null, 2));
  console.log('計算結果:', JSON.stringify(result3, null, 2));
  
  console.log('\n--- 高さ計算の詳細 ---');
  console.log('基準高さ:', testCase3.standard_height);
  console.log('屋根形状:', testCase3.roof_shape);
  console.log('段数:', result3.num_stages);
  console.log('1層目高さ:', result3.first_layer_height);
  console.log('ジャッキアップ高さ:', result3.jack_up_height);
  
  const baseUnit = 1800; // 陸屋根
  const expectedCalculation = testCase3.standard_height - baseUnit;
  console.log('期待される残り高さ:', expectedCalculation);
  console.log('1層目 + (段数-1) * 1900 =', result3.first_layer_height + (result3.num_stages - 1) * 1900);
  
} catch (error) {
  console.error('テストケース3でエラー:', error);
}

console.log('\n=== 計算ロジックの分析完了 ===');