// ScaffoldContextの型変換ロジックのデバッグ

// 実際のScaffoldContextから使われている変換ロジックを再現
function convertToScaffoldInputData(inputData) {
  const roofShapeMapping = {
    'flat': 'フラット',
    'sloped': '勾配軒',
    'roofDeck': '陸屋根',
  };

  return {
    width_NS: inputData.frameWidth.northSouth || 1000,
    width_EW: inputData.frameWidth.eastWest || 1000,
    eaves_N: inputData.eaveOverhang.north || 0,
    eaves_E: inputData.eaveOverhang.east || 0,
    eaves_S: inputData.eaveOverhang.south || 0,
    eaves_W: inputData.eaveOverhang.west || 0,
    boundary_N: inputData.propertyLine.north ? (inputData.propertyLineDistance?.north ?? null) : null,
    boundary_E: inputData.propertyLine.east ? (inputData.propertyLineDistance?.east ?? null) : null,
    boundary_S: inputData.propertyLine.south ? (inputData.propertyLineDistance?.south ?? null) : null,
    boundary_W: inputData.propertyLine.west ? (inputData.propertyLineDistance?.west ?? null) : null,
    standard_height: inputData.referenceHeight || 2400,
    roof_shape: roofShapeMapping[inputData.roofShape],
    tie_column: inputData.hasTieColumns,
    railing_count: inputData.eavesHandrails || 0,
    use_355_NS: inputData.specialMaterial.northSouth.material355 || 0,
    use_300_NS: inputData.specialMaterial.northSouth.material300 || 0,
    use_150_NS: inputData.specialMaterial.northSouth.material150 || 0,
    use_355_EW: inputData.specialMaterial.eastWest.material355 || 0,
    use_300_EW: inputData.specialMaterial.eastWest.material300 || 0,
    use_150_EW: inputData.specialMaterial.eastWest.material150 || 0,
    target_margin_N: inputData.targetOffset?.north?.enabled ? (inputData.targetOffset.north.value ?? 900) : null,
    target_margin_E: inputData.targetOffset?.east?.enabled ? (inputData.targetOffset.east.value ?? 900) : null,
    target_margin_S: inputData.targetOffset?.south?.enabled ? (inputData.targetOffset.south.value ?? 900) : null,
    target_margin_W: inputData.targetOffset?.west?.enabled ? (inputData.targetOffset.west.value ?? 900) : null,
  };
}

function convertFromScaffoldResult(result) {
  return {
    ns_total_span: result.ns_total_span,
    ew_total_span: result.ew_total_span,
    ns_span_structure: result.ns_span_structure,
    ew_span_structure: result.ew_span_structure,
    north_gap: result.north_gap,
    south_gap: result.south_gap,
    east_gap: result.east_gap,
    west_gap: result.west_gap,
    num_stages: result.num_stages,
    modules_count: result.modules_count,
    jack_up_height: result.jack_up_height,
    first_layer_height: result.first_layer_height,
    tie_ok: result.tie_ok,
    tie_column_used: result.tie_column_used,
  };
}

// テストデータ（ScaffoldContextから）
const testInputData = {
  frameWidth: {
    northSouth: 1000,
    eastWest: 1000,
  },
  eaveOverhang: {
    north: 0,
    east: 0,
    south: 0,
    west: 0,
  },
  propertyLine: {
    north: false,
    east: false,
    south: false,
    west: false,
  },
  referenceHeight: 2400,
  roofShape: 'flat',
  hasTieColumns: false,
  eavesHandrails: 0,
  specialMaterial: {
    northSouth: {
      material355: 0,
      material300: 0,
      material150: 0,
    },
    eastWest: {
      material355: 0,
      material300: 0,
      material150: 0,
    },
  },
  targetOffset: {
    north: { enabled: true, value: 900 },
    east: { enabled: true, value: 900 },
    south: { enabled: true, value: 900 },
    west: { enabled: true, value: 900 },
  },
  propertyLineDistance: {
    north: null,
    east: null,
    south: null,
    west: null,
  },
};

console.log('=== ScaffoldContext 型変換デバッグ ===\n');

console.log('1. フロントエンド入力データ:');
console.log(JSON.stringify(testInputData, null, 2));

console.log('\n2. Core型への変換:');
const scaffoldInputData = convertToScaffoldInputData(testInputData);
console.log(JSON.stringify(scaffoldInputData, null, 2));

console.log('\n3. 型変換における潜在的な問題:');

// 問題の可能性をチェック
const issues = [];

if (!scaffoldInputData.width_NS || scaffoldInputData.width_NS <= 0) {
  issues.push(`width_NS が無効: ${scaffoldInputData.width_NS}`);
}

if (!scaffoldInputData.width_EW || scaffoldInputData.width_EW <= 0) {
  issues.push(`width_EW が無効: ${scaffoldInputData.width_EW}`);
}

if (!scaffoldInputData.standard_height || scaffoldInputData.standard_height <= 0) {
  issues.push(`standard_height が無効: ${scaffoldInputData.standard_height}`);
}

if (!scaffoldInputData.roof_shape) {
  issues.push(`roof_shape が無効: ${scaffoldInputData.roof_shape}`);
}

// デフォルト値の確認
if (scaffoldInputData.width_NS === 1000 && scaffoldInputData.width_EW === 1000) {
  issues.push('⚠️ デフォルト値（1000mm）が使用されています - 極小建物');
}

if (scaffoldInputData.standard_height === 2400) {
  issues.push('⚠️ デフォルト基準高さ（2400mm）が使用されています - 低い建物');
}

// 目標離れの設定確認
const enabledTargetMargins = [];
if (scaffoldInputData.target_margin_N !== null) enabledTargetMargins.push('北');
if (scaffoldInputData.target_margin_E !== null) enabledTargetMargins.push('東');
if (scaffoldInputData.target_margin_S !== null) enabledTargetMargins.push('南');
if (scaffoldInputData.target_margin_W !== null) enabledTargetMargins.push('西');

console.log(`目標離れ設定: ${enabledTargetMargins.join(', ')} (${enabledTargetMargins.length}/4面)`);

if (issues.length > 0) {
  console.log('発見された問題:');
  issues.forEach(issue => console.log(`  - ${issue}`));
} else {
  console.log('型変換に明らかな問題は見つかりませんでした');
}

// 実際の計算を実行
console.log('\n4. 実際の計算実行:');
try {
  const { calculateAll } = require('./packages/core/dist/calculator/engine');
  const result = calculateAll(scaffoldInputData);
  
  console.log('計算結果:');
  console.log(JSON.stringify(result, null, 2));
  
  console.log('\n5. フロントエンド型への変換:');
  const frontendResult = convertFromScaffoldResult(result);
  console.log(JSON.stringify(frontendResult, null, 2));
  
  console.log('\n6. 結果の妥当性チェック:');
  
  // 極小建物での計算結果の妥当性
  if (scaffoldInputData.width_NS === 1000 && scaffoldInputData.width_EW === 1000) {
    console.log('⚠️ 極小建物 (1m × 1m) での計算:');
    console.log(`  - 南北総スパン: ${result.ns_total_span}mm`);
    console.log(`  - 東西総スパン: ${result.ew_total_span}mm`);
    console.log(`  - 段数: ${result.num_stages}`);
    console.log(`  - 1層目高さ: ${result.first_layer_height}mm`);
    
    if (result.ns_total_span > 10000 || result.ew_total_span > 10000) {
      console.log('❌ 異常に大きなスパンが計算されています！');
    }
  }
  
  // 高さ計算の検証
  const roofBase = scaffoldInputData.roof_shape === 'フラット' ? 1700 :
                   scaffoldInputData.roof_shape === '勾配軒' ? 1900 : 1800;
  const expectedTotal = roofBase + result.first_layer_height + (result.num_stages - 1) * 1900;
  
  if (Math.abs(expectedTotal - scaffoldInputData.standard_height) > 1) {
    console.log(`❌ 高さ計算が矛盾: 期待値${expectedTotal}mm vs 入力${scaffoldInputData.standard_height}mm`);
  } else {
    console.log(`✅ 高さ計算は整合性があります: ${expectedTotal}mm = ${scaffoldInputData.standard_height}mm`);
  }
  
} catch (error) {
  console.error('計算エラー:', error);
}

console.log('\n=== デバッグ完了 ===');