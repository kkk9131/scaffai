// Node.js test script for the TypeScript engine
// TypeScript implementation test

const SCAFFOLD_CONSTANTS = {
  BOUNDARY_OFFSET: 60,
  EAVES_MARGIN_THRESHOLD_ADDITION: 80,
  STANDARD_PART_SIZE: 1800,
  DEFAULT_TARGET_MARGIN: 900,
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

const { 
  STAGE_UNIT_HEIGHT, 
  FIRST_LAYER_MIN_HEIGHT_THRESHOLD, 
  TIE_COLUMN_REDUCTION_LARGE, 
  TIE_COLUMN_REDUCTION_SMALL, 
  TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION, 
  TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION 
} = SCAFFOLD_CONSTANTS;

function testHeightCalculation(standard_height, roof_shape, tie_column, railing_count) {
  console.log("=== TypeScript Engine Height Calculation ===");
  console.log(`Input: standard_height=${standard_height}, roof_shape='${roof_shape}', tie_column=${tie_column}, railing_count=${railing_count}`);
  
  // 段数とジャッキアップ高さ計算
  const baseUnit = ROOF_BASE_UNIT_MAP[roof_shape] || 1700;
  const remainder = standard_height - baseUnit;
  const stageUnit = STAGE_UNIT_HEIGHT;

  console.log(`Step 1: base_unit=${baseUnit}, remainder=${remainder}, stage_unit=${stageUnit}`);

  const initialStages = 1 + (remainder > 0 ? Math.floor(remainder / stageUnit) : 0);
  const initialLeftover = remainder - (initialStages - 1) * stageUnit;

  console.log(`Step 2: initial_stages=${initialStages}, initial_leftover=${initialLeftover}`);

  let firstLayerHeight;
  if (initialLeftover < FIRST_LAYER_MIN_HEIGHT_THRESHOLD) {
    firstLayerHeight = initialLeftover + stageUnit;
  } else {
    firstLayerHeight = initialLeftover;
  }

  console.log(`Step 3: first_layer_height=${firstLayerHeight} (threshold=${FIRST_LAYER_MIN_HEIGHT_THRESHOLD})`);

  const remainingAfterFirst = standard_height - baseUnit - firstLayerHeight;
  const numStages = 1 + (remainingAfterFirst > 0 ? Math.floor(remainingAfterFirst / stageUnit) : 0);
  const leftover = standard_height - baseUnit - (numStages - 1) * stageUnit;

  console.log(`Step 4: remaining_after_first=${remainingAfterFirst}, num_stages=${numStages}`);
  console.log(`Step 5: leftover=${leftover}`);

  let jackUpHeight = leftover;
  let reductionLoops = 0;
  let tiePossible = true;

  // 根がらみ支柱の計算
  if (tie_column) {
    if (jackUpHeight >= TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION) {
      while (jackUpHeight >= TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION) {
        jackUpHeight -= TIE_COLUMN_REDUCTION_LARGE;
        reductionLoops++;
        console.log(`  大型削減: jack_up_height=${jackUpHeight}, reduction_loops=${reductionLoops}`);
      }
      if (jackUpHeight >= TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION) {
        jackUpHeight -= TIE_COLUMN_REDUCTION_SMALL;
        console.log(`  小型削減: jack_up_height=${jackUpHeight}`);
      } else {
        tiePossible = false;
        jackUpHeight = leftover;
        reductionLoops = 0;
        console.log(`  削減失敗: jack_up_height reset to ${jackUpHeight}, tie_possible=${tiePossible}`);
      }
    } else if (jackUpHeight >= TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION) {
      jackUpHeight -= TIE_COLUMN_REDUCTION_SMALL;
      console.log(`  小型削減のみ: jack_up_height=${jackUpHeight}`);
    } else {
      tiePossible = false;
      jackUpHeight = leftover;
      console.log(`  削減不可: jack_up_height=${jackUpHeight}, tie_possible=${tiePossible}`);
    }
  } else {
    while (jackUpHeight >= TIE_COLUMN_REDUCTION_LARGE) {
      jackUpHeight -= TIE_COLUMN_REDUCTION_LARGE;
      reductionLoops++;
      console.log(`  通常削減: jack_up_height=${jackUpHeight}, reduction_loops=${reductionLoops}`);
    }
  }

  // コマ数計算
  let modulesCount = 4 + (numStages - 1) * 4 + reductionLoops;
  if (railing_count === 3) {
    modulesCount += 2;
  } else if (railing_count === 2) {
    modulesCount += 1;
  }

  console.log(`Step 6: modules_count=${modulesCount} (base=4, stages=${(numStages - 1) * 4}, reductions=${reductionLoops}, railing=${railing_count === 3 ? 2 : railing_count === 2 ? 1 : 0})`);

  // 1層目高さの最終調整
  const finalLeftoverForFirstLayer = standard_height - baseUnit - (numStages - 1) * stageUnit;
  if (finalLeftoverForFirstLayer < FIRST_LAYER_MIN_HEIGHT_THRESHOLD) {
    firstLayerHeight = finalLeftoverForFirstLayer + stageUnit;
  } else {
    firstLayerHeight = finalLeftoverForFirstLayer;
  }

  console.log(`Step 7 (最終調整): final_leftover_for_first_layer=${finalLeftoverForFirstLayer}, first_layer_height=${firstLayerHeight}`);
  console.log(`最終結果: num_stages=${numStages}, jack_up_height=${jackUpHeight}, first_layer_height=${firstLayerHeight}, modules_count=${modulesCount}, tie_ok=${tiePossible}`);

  return {
    num_stages: numStages,
    modules_count: modulesCount,
    jack_up_height: jackUpHeight,
    first_layer_height: firstLayerHeight,
    tie_ok: tiePossible,
    tie_column_used: tie_column
  };
}

// ユーザー指定値でテスト
console.log("========== ユーザー指定値での計算結果 ==========");
console.log("standard_height: 2400 mm");
console.log("roof_shape: 'フラット'");
console.log("railing_count: 0");
console.log("==========================================\n");

const result = testHeightCalculation(2400, 'フラット', true, 0);

console.log("\n========== 最終結果 ==========");
console.log(`総段数        : ${result.num_stages} 段`);
console.log(`1層目高さ     : ${result.first_layer_height} mm`);
console.log(`ジャッキアップ: ${result.jack_up_height} mm`);
console.log(`コマ数        : ${result.modules_count} コマ`);
if (result.tie_column_used) {
    console.log(`根がらみ支柱  : ${result.tie_ok ? '設置可能' : '設置不可'}`);
} else {
    console.log(`根がらみ支柱  : 使用しない`);
}