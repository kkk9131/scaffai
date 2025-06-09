// 高さ計算ロジックの詳細デバッグ
const { calculateAll } = require('./packages/core/dist/calculator/engine');

console.log('=== 高さ計算ロジックの詳細デバッグ ===\n');

// 屋根形状別の基本高さマッピング
const ROOF_BASE_UNIT_MAP = {
  'フラット': 1700,
  '勾配軒': 1900,
  '陸屋根': 1800,
};

// 定数値
const STAGE_UNIT_HEIGHT = 1900;
const FIRST_LAYER_MIN_HEIGHT_THRESHOLD = 950;
const TIE_COLUMN_REDUCTION_LARGE = 475;
const TIE_COLUMN_REDUCTION_SMALL = 130;
const TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION = 550;
const TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION = 150;

function debugHeightCalculation(input) {
  console.log(`\n--- ${input.roof_shape} 高さ${input.standard_height}mm の詳細計算 ---`);
  
  const baseUnit = ROOF_BASE_UNIT_MAP[input.roof_shape] || 1700;
  console.log(`1. 基本高さ (${input.roof_shape}): ${baseUnit}mm`);
  
  const remainder = input.standard_height - baseUnit;
  console.log(`2. 残り高さ: ${input.standard_height} - ${baseUnit} = ${remainder}mm`);
  
  const stageUnit = STAGE_UNIT_HEIGHT;
  console.log(`3. 段数単位高さ: ${stageUnit}mm`);
  
  const initialStages = 1 + (remainder > 0 ? Math.floor(remainder / stageUnit) : 0);
  console.log(`4. 初期段数: 1 + floor(${remainder} / ${stageUnit}) = ${initialStages}`);
  
  const initialLeftover = remainder - (initialStages - 1) * stageUnit;
  console.log(`5. 初期余り: ${remainder} - (${initialStages} - 1) * ${stageUnit} = ${initialLeftover}mm`);
  
  let firstLayerHeight;
  if (initialLeftover < FIRST_LAYER_MIN_HEIGHT_THRESHOLD) {
    firstLayerHeight = initialLeftover + stageUnit;
    console.log(`6. 1層目高さ (余り < ${FIRST_LAYER_MIN_HEIGHT_THRESHOLD}): ${initialLeftover} + ${stageUnit} = ${firstLayerHeight}mm`);
  } else {
    firstLayerHeight = initialLeftover;
    console.log(`6. 1層目高さ (余り >= ${FIRST_LAYER_MIN_HEIGHT_THRESHOLD}): ${firstLayerHeight}mm`);
  }
  
  const remainingAfterFirst = input.standard_height - baseUnit - firstLayerHeight;
  console.log(`7. 1層目後の残り: ${input.standard_height} - ${baseUnit} - ${firstLayerHeight} = ${remainingAfterFirst}mm`);
  
  const numStages = 1 + (remainingAfterFirst > 0 ? Math.floor(remainingAfterFirst / stageUnit) : 0);
  console.log(`8. 最終段数: 1 + floor(${remainingAfterFirst} / ${stageUnit}) = ${numStages}`);
  
  const leftover = input.standard_height - baseUnit - (numStages - 1) * stageUnit;
  console.log(`9. 最終余り: ${input.standard_height} - ${baseUnit} - (${numStages} - 1) * ${stageUnit} = ${leftover}mm`);
  
  let jackUpHeight = leftover;
  let reductionLoops = 0;
  let tiePossible = true;
  
  console.log(`10. 根がらみ支柱計算開始 (tie_column: ${input.tie_column})`);
  
  if (input.tie_column) {
    console.log(`    初期ジャッキアップ高さ: ${jackUpHeight}mm`);
    
    if (jackUpHeight >= TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION) {
      console.log(`    大減算適用可能 (>= ${TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION}mm)`);
      while (jackUpHeight >= TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION) {
        jackUpHeight -= TIE_COLUMN_REDUCTION_LARGE;
        reductionLoops++;
        console.log(`    大減算 ${reductionLoops}回目: ${jackUpHeight}mm (${TIE_COLUMN_REDUCTION_LARGE}mm減算)`);
      }
      
      if (jackUpHeight >= TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION) {
        jackUpHeight -= TIE_COLUMN_REDUCTION_SMALL;
        console.log(`    小減算適用: ${jackUpHeight}mm (${TIE_COLUMN_REDUCTION_SMALL}mm減算)`);
      } else {
        tiePossible = false;
        jackUpHeight = leftover;
        reductionLoops = 0;
        console.log(`    小減算不可 (< ${TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION}mm) - 根がらみ支柱NG`);
      }
    } else if (jackUpHeight >= TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION) {
      jackUpHeight -= TIE_COLUMN_REDUCTION_SMALL;
      console.log(`    小減算のみ適用: ${jackUpHeight}mm (${TIE_COLUMN_REDUCTION_SMALL}mm減算)`);
    } else {
      tiePossible = false;
      jackUpHeight = leftover;
      console.log(`    減算不可 (< ${TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION}mm) - 根がらみ支柱NG`);
    }
  } else {
    console.log(`    根がらみ支柱未使用 - 通常減算のみ`);
    while (jackUpHeight >= TIE_COLUMN_REDUCTION_LARGE) {
      jackUpHeight -= TIE_COLUMN_REDUCTION_LARGE;
      reductionLoops++;
      console.log(`    通常減算 ${reductionLoops}回目: ${jackUpHeight}mm (${TIE_COLUMN_REDUCTION_LARGE}mm減算)`);
    }
  }
  
  console.log(`11. 最終ジャッキアップ高さ: ${jackUpHeight}mm`);
  console.log(`12. 減算ループ回数: ${reductionLoops}`);
  console.log(`13. 根がらみ支柱可能: ${tiePossible}`);
  
  // コマ数計算
  let modulesCount = 4 + (numStages - 1) * 4 + reductionLoops;
  if (input.railing_count === 3) {
    modulesCount += 2;
  } else if (input.railing_count === 2) {
    modulesCount += 1;
  }
  console.log(`14. コマ数: 4 + (${numStages} - 1) * 4 + ${reductionLoops} + 手すり補正 = ${modulesCount}`);
  
  // 1層目高さの最終調整
  const finalLeftoverForFirstLayer = input.standard_height - baseUnit - (numStages - 1) * stageUnit;
  let finalFirstLayerHeight;
  if (finalLeftoverForFirstLayer < FIRST_LAYER_MIN_HEIGHT_THRESHOLD) {
    finalFirstLayerHeight = finalLeftoverForFirstLayer + stageUnit;
    console.log(`15. 1層目最終高さ (< ${FIRST_LAYER_MIN_HEIGHT_THRESHOLD}): ${finalLeftoverForFirstLayer} + ${stageUnit} = ${finalFirstLayerHeight}mm`);
  } else {
    finalFirstLayerHeight = finalLeftoverForFirstLayer;
    console.log(`15. 1層目最終高さ (>= ${FIRST_LAYER_MIN_HEIGHT_THRESHOLD}): ${finalFirstLayerHeight}mm`);
  }
  
  console.log('\n予想結果:');
  console.log(`  段数: ${numStages}`);
  console.log(`  1層目高さ: ${finalFirstLayerHeight}mm`);
  console.log(`  ジャッキアップ高さ: ${jackUpHeight}mm`);
  console.log(`  根がらみ支柱OK: ${tiePossible}`);
  console.log(`  コマ数: ${modulesCount}`);
  
  // 実際の計算実行
  console.log('\n実際の計算結果:');
  const result = calculateAll(input);
  console.log(`  段数: ${result.num_stages}`);
  console.log(`  1層目高さ: ${result.first_layer_height}mm`);
  console.log(`  ジャッキアップ高さ: ${result.jack_up_height}mm`);
  console.log(`  根がらみ支柱OK: ${result.tie_ok}`);
  console.log(`  コマ数: ${result.modules_count}`);
  
  // 矛盾チェック
  console.log('\n矛盾チェック:');
  if (numStages !== result.num_stages) {
    console.log(`❌ 段数が一致しません: 予想${numStages} vs 実際${result.num_stages}`);
  }
  if (Math.abs(finalFirstLayerHeight - result.first_layer_height) > 1) {
    console.log(`❌ 1層目高さが一致しません: 予想${finalFirstLayerHeight} vs 実際${result.first_layer_height}`);
  }
  if (Math.abs(jackUpHeight - result.jack_up_height) > 1) {
    console.log(`❌ ジャッキアップ高さが一致しません: 予想${jackUpHeight} vs 実際${result.jack_up_height}`);
  }
  if (tiePossible !== result.tie_ok) {
    console.log(`❌ 根がらみ支柱判定が一致しません: 予想${tiePossible} vs 実際${result.tie_ok}`);
  }
  if (modulesCount !== result.modules_count) {
    console.log(`❌ コマ数が一致しません: 予想${modulesCount} vs 実際${result.modules_count}`);
  }
  
  // 高さ整合性チェック
  const calculatedTotal = baseUnit + result.first_layer_height + (result.num_stages - 1) * stageUnit;
  if (Math.abs(calculatedTotal - input.standard_height) > 1) {
    console.log(`❌ 高さ整合性エラー: ${baseUnit} + ${result.first_layer_height} + (${result.num_stages} - 1) * ${stageUnit} = ${calculatedTotal} ≠ ${input.standard_height}`);
  } else {
    console.log(`✅ 高さ整合性OK: ${baseUnit} + ${result.first_layer_height} + (${result.num_stages} - 1) * ${stageUnit} = ${calculatedTotal} = ${input.standard_height}`);
  }
}

// テストケース実行
const testCases = [
  {
    name: '基本ケース',
    data: {
      width_NS: 10000, width_EW: 8000,
      eaves_N: 500, eaves_E: 500, eaves_S: 500, eaves_W: 500,
      boundary_N: null, boundary_E: null, boundary_S: null, boundary_W: null,
      standard_height: 6000, roof_shape: 'フラット',
      tie_column: true, railing_count: 2,
      use_355_NS: 0, use_300_NS: 0, use_150_NS: 0,
      use_355_EW: 0, use_300_EW: 0, use_150_EW: 0,
      target_margin_N: 900, target_margin_E: 900, target_margin_S: 900, target_margin_W: 900
    }
  },
  {
    name: '高い建物',
    data: {
      width_NS: 10000, width_EW: 8000,
      eaves_N: 500, eaves_E: 500, eaves_S: 500, eaves_W: 500,
      boundary_N: null, boundary_E: null, boundary_S: null, boundary_W: null,
      standard_height: 12000, roof_shape: '勾配軒',
      tie_column: true, railing_count: 2,
      use_355_NS: 0, use_300_NS: 0, use_150_NS: 0,
      use_355_EW: 0, use_300_EW: 0, use_150_EW: 0,
      target_margin_N: 900, target_margin_E: 900, target_margin_S: 900, target_margin_W: 900
    }
  },
  {
    name: '問題ケース - 境界値',
    data: {
      width_NS: 10000, width_EW: 8000,
      eaves_N: 500, eaves_E: 500, eaves_S: 500, eaves_W: 500,
      boundary_N: null, boundary_E: null, boundary_S: null, boundary_W: null,
      standard_height: 4850, roof_shape: 'フラット',
      tie_column: true, railing_count: 2,
      use_355_NS: 0, use_300_NS: 0, use_150_NS: 0,
      use_355_EW: 0, use_300_EW: 0, use_150_EW: 0,
      target_margin_N: 900, target_margin_E: 900, target_margin_S: 900, target_margin_W: 900
    }
  }
];

testCases.forEach(testCase => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`テストケース: ${testCase.name}`);
  console.log(`${'='.repeat(60)}`);
  debugHeightCalculation(testCase.data);
});

console.log('\n=== デバッグ完了 ===');