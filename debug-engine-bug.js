// 計算エンジンのバグ解析
console.log('=== 計算エンジンのバグ解析 ===\n');

// 問題のあるテストケース
const input = {
  width_NS: 1000,
  width_EW: 1000,
  eaves_N: 0, eaves_E: 0, eaves_S: 0, eaves_W: 0,
  boundary_N: null, boundary_E: null, boundary_S: null, boundary_W: null,
  standard_height: 2400,
  roof_shape: 'フラット',
  tie_column: false,
  railing_count: 0,
  use_355_NS: 0, use_300_NS: 0, use_150_NS: 0,
  use_355_EW: 0, use_300_EW: 0, use_150_EW: 0,
  target_margin_N: 900, target_margin_E: 900, target_margin_S: 900, target_margin_W: 900
};

console.log('入力データ:', JSON.stringify(input, null, 2));

// 計算エンジンのロジックを手動で再現して問題を特定
const SCAFFOLD_CONSTANTS = {
  STAGE_UNIT_HEIGHT: 1900,
  FIRST_LAYER_MIN_HEIGHT_THRESHOLD: 950,
  TIE_COLUMN_REDUCTION_LARGE: 475,
  TIE_COLUMN_REDUCTION_SMALL: 130,
  TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION: 550,
  TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION: 150,
};

const ROOF_BASE_UNIT_MAP = {
  'フラット': 1700,
  '勾配軒': 1900,
  '陸屋根': 1800,
};

console.log('\n=== 手動計算（現在のロジック）===');

const { 
  STAGE_UNIT_HEIGHT, 
  FIRST_LAYER_MIN_HEIGHT_THRESHOLD, 
  TIE_COLUMN_REDUCTION_LARGE, 
  TIE_COLUMN_REDUCTION_SMALL, 
  TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION, 
  TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION 
} = SCAFFOLD_CONSTANTS;

const { standard_height, roof_shape, tie_column, railing_count } = input;
const baseUnit = ROOF_BASE_UNIT_MAP[roof_shape] || 1700;
const remainder = standard_height - baseUnit;
const stageUnit = STAGE_UNIT_HEIGHT;

console.log(`1. baseUnit (${roof_shape}): ${baseUnit}mm`);
console.log(`2. remainder: ${standard_height} - ${baseUnit} = ${remainder}mm`);

const initialStages = 1 + (remainder > 0 ? Math.floor(remainder / stageUnit) : 0);
const initialLeftover = remainder - (initialStages - 1) * stageUnit;

console.log(`3. initialStages: 1 + floor(${remainder} / ${stageUnit}) = ${initialStages}`);
console.log(`4. initialLeftover: ${remainder} - (${initialStages} - 1) * ${stageUnit} = ${initialLeftover}mm`);

let firstLayerHeight;
if (initialLeftover < FIRST_LAYER_MIN_HEIGHT_THRESHOLD) {
  firstLayerHeight = initialLeftover + stageUnit;
  console.log(`5. firstLayerHeight (< ${FIRST_LAYER_MIN_HEIGHT_THRESHOLD}): ${initialLeftover} + ${stageUnit} = ${firstLayerHeight}mm`);
} else {
  firstLayerHeight = initialLeftover;
  console.log(`5. firstLayerHeight (>= ${FIRST_LAYER_MIN_HEIGHT_THRESHOLD}): ${firstLayerHeight}mm`);
}

const remainingAfterFirst = standard_height - baseUnit - firstLayerHeight;
console.log(`6. remainingAfterFirst: ${standard_height} - ${baseUnit} - ${firstLayerHeight} = ${remainingAfterFirst}mm`);

const numStages = 1 + (remainingAfterFirst > 0 ? Math.floor(remainingAfterFirst / stageUnit) : 0);
console.log(`7. numStages: 1 + floor(${remainingAfterFirst} / ${stageUnit}) = ${numStages}`);

const leftover = standard_height - baseUnit - (numStages - 1) * stageUnit;
console.log(`8. leftover: ${standard_height} - ${baseUnit} - (${numStages} - 1) * ${stageUnit} = ${leftover}mm`);

let jackUpHeight = leftover;
let reductionLoops = 0;
let tiePossible = true;

console.log('\n--- 根がらみ支柱計算 ---');
if (tie_column) {
  console.log('根がらみ支柱使用');
  // 省略 - tie_column = false なので
} else {
  console.log('根がらみ支柱未使用 - 通常減算');
  while (jackUpHeight >= TIE_COLUMN_REDUCTION_LARGE) {
    jackUpHeight -= TIE_COLUMN_REDUCTION_LARGE;
    reductionLoops++;
    console.log(`  通常減算 ${reductionLoops}回目: ${jackUpHeight}mm`);
  }
}

let modulesCount = 4 + (numStages - 1) * 4 + reductionLoops;
if (railing_count === 3) {
  modulesCount += 2;
} else if (railing_count === 2) {
  modulesCount += 1;
}

console.log(`9. 初期jackUpHeight: ${leftover}mm`);
console.log(`10. 減算後jackUpHeight: ${jackUpHeight}mm`);
console.log(`11. reductionLoops: ${reductionLoops}`);
console.log(`12. modulesCount: ${modulesCount}`);

// ❌ 問題箇所：1層目高さの最終調整
console.log('\n--- 🚨 問題箇所：1層目高さの最終調整 ---');
const finalLeftoverForFirstLayer = standard_height - baseUnit - (numStages - 1) * stageUnit;
console.log(`finalLeftoverForFirstLayer: ${standard_height} - ${baseUnit} - (${numStages} - 1) * ${stageUnit} = ${finalLeftoverForFirstLayer}mm`);

if (finalLeftoverForFirstLayer < FIRST_LAYER_MIN_HEIGHT_THRESHOLD) {
  firstLayerHeight = finalLeftoverForFirstLayer + stageUnit;
  console.log(`❌ 最終調整 (< ${FIRST_LAYER_MIN_HEIGHT_THRESHOLD}): ${finalLeftoverForFirstLayer} + ${stageUnit} = ${firstLayerHeight}mm`);
} else {
  firstLayerHeight = finalLeftoverForFirstLayer;
  console.log(`❌ 最終調整 (>= ${FIRST_LAYER_MIN_HEIGHT_THRESHOLD}): ${firstLayerHeight}mm`);
}

console.log('\n=== 結果 ===');
console.log(`段数: ${numStages}`);
console.log(`1層目高さ: ${firstLayerHeight}mm`);
console.log(`ジャッキアップ高さ: ${jackUpHeight}mm`);
console.log(`根がらみ支柱OK: ${tiePossible}`);
console.log(`コマ数: ${modulesCount}`);

// 高さ整合性チェック
const calculatedTotal = baseUnit + firstLayerHeight + (numStages - 1) * stageUnit;
console.log(`\n=== 高さ整合性チェック ===`);
console.log(`計算総高さ: ${baseUnit} + ${firstLayerHeight} + (${numStages} - 1) * ${stageUnit} = ${calculatedTotal}mm`);
console.log(`入力総高さ: ${standard_height}mm`);
console.log(`差: ${calculatedTotal - standard_height}mm`);

if (Math.abs(calculatedTotal - standard_height) > 1) {
  console.log('❌ 高さが一致しません！');
} else {
  console.log('✅ 高さが一致します');
}

console.log('\n=== 問題の分析 ===');
console.log('問題：最終調整のロジックが初期計算を上書きしている');
console.log('');
console.log('現在のロジック:');
console.log('1. 初期段数とleftoverを計算');
console.log('2. remainingAfterFirstとnumStagesを再計算');
console.log('3. ❌ 最終調整で firstLayerHeight を再度計算 (前の計算を無視)');
console.log('');
console.log('修正案:');
console.log('- 最終調整のロジックを削除するか、論理的に整合性を保つ');
console.log('- または段数計算のロジック全体を見直す');

// 実際の計算エンジンの結果と比較
console.log('\n=== 実際の計算エンジンとの比較 ===');
try {
  const { calculateAll } = require('./packages/core/dist/calculator/engine');
  const actualResult = calculateAll(input);
  
  console.log('実際の結果:');
  console.log(`  段数: ${actualResult.num_stages}`);
  console.log(`  1層目高さ: ${actualResult.first_layer_height}mm`);
  console.log(`  ジャッキアップ高さ: ${actualResult.jack_up_height}mm`);
  
  const actualTotal = baseUnit + actualResult.first_layer_height + (actualResult.num_stages - 1) * stageUnit;
  console.log(`  実際の総高さ: ${actualTotal}mm (入力: ${standard_height}mm)`);
  
  if (Math.abs(actualTotal - standard_height) > 1) {
    console.log('❌ 実際の計算エンジンでも高さが一致しません！');
  } else {
    console.log('✅ 実際の計算エンジンでは高さが一致します');
  }
  
} catch (error) {
  console.error('計算エンジンエラー:', error);
}

console.log('\n=== 分析完了 ===');