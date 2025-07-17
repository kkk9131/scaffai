// debug_calculation.js
// 計算エンジンのデバッグ用スクリプト

// TypeScriptファイルを直接読み込み、問題を分析する
const fs = require('fs');
const path = require('path');

// ユーザー報告のテストケース条件
const testCase = {
  frameWidth: {
    northSouth: 10000,
    eastWest: 5000,
  },
  eaveOverhang: {
    north: 1000,
    east: 1000,
    south: 1000,
    west: 1000,
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
    north: { enabled: false, value: null },
    east: { enabled: false, value: null },
    south: { enabled: false, value: null },
    west: { enabled: false, value: null },
  },
  propertyLineDistance: {
    north: null,
    east: null,
    south: null,
    west: null,
  },
};

console.log('=== デバッグ計算テスト ===');
console.log('条件:');
console.log('- 南北: 10000mm, 東西: 5000mm');
console.log('- 軒の出: 各面1000mm');
console.log('- 境界線: なし');
console.log('- 目標離れ: なし');
console.log('');

console.log('期待値:');
console.log('- 南北総スパン: 12300mm');
console.log('- 東西総スパン: 7200mm');
console.log('- 北側離れ: 1150mm');
console.log('- 南側離れ: 1150mm');
console.log('- 東側離れ: 1100mm');
console.log('- 西側離れ: 1100mm');
console.log('');

console.log('現在の出力:');
console.log('- 南北総スパン: 12600mm (+300mm)');
console.log('- 東西総スパン: 7500mm (+300mm)');
console.log('- 北側離れ: 1300mm (+150mm)');
console.log('- 南側離れ: 1300mm (+150mm)');
console.log('- 東側離れ: 1250mm (+150mm)');
console.log('- 西側離れ: 1250mm (+150mm)');
console.log('');

// 推定される問題箇所の分析
console.log('=== 問題分析 ===');
console.log('1. 総スパンに300mmの追加が発生している');
console.log('2. 離れ値にも150mmの誤差がある');
console.log('3. おそらくどこかで固定値が加算されている');

// ファイル内容の分析
console.log('\n=== ファイル分析 ===');

try {
  // mobile-engine.tsの内容を確認
  const mobileEnginePath = path.join(__dirname, 'apps/web/lib/calculator/mobile-engine.ts');
  const mobileEngineContent = fs.readFileSync(mobileEnginePath, 'utf8');
  
  // calculateAll関数の呼び出し部分を探す
  const calculateAllMatch = mobileEngineContent.match(/export function calculateAll\(.*?\): ScaffoldCalculationResult \{([\s\S]*?)\}/);
  if (calculateAllMatch) {
    console.log('✅ mobile-engine.ts に calculateAll関数が見つかりました');
    console.log('この関数は packages/core/src/calculator/engine からインポートしているようです');
  }
  
  // core engine.tsの内容を確認
  const coreEnginePath = path.join(__dirname, 'packages/core/src/calculator/engine.ts');
  const coreEngineContent = fs.readFileSync(coreEnginePath, 'utf8');
  
  console.log('✅ core/engine.ts ファイルが見つかりました');
  
  // calculateFaceDimensions の呼び出し部分を探す
  const faceDimensionsMatches = coreEngineContent.match(/calculateFaceDimensions\([^)]*\)/g);
  if (faceDimensionsMatches) {
    console.log(`✅ calculateFaceDimensions の呼び出しが ${faceDimensionsMatches.length} 箇所見つかりました`);
    faceDimensionsMatches.forEach((match, index) => {
      console.log(`  ${index + 1}: ${match}`);
    });
  }
  
} catch (error) {
  console.error('ファイル読み込みエラー:', error.message);
}

console.log('\n=== 推定される問題 ===');
console.log('1. face-dimensions.ts の補正ロジックが実際のスパンに影響している可能性');
console.log('2. span-boundaries.ts でのスパン計算に固定値の追加がある可能性');
console.log('3. DrawingEditor.tsx での補正値の誤った加算（既に確認済み）');
console.log('');
console.log('次のステップ:');
console.log('1. face-dimensions.ts の total_span 計算ロジックをチェック');
console.log('2. span-boundaries.ts の calculateSpanWithBoundaries をチェック');
console.log('3. 基準となる baseWidth 計算をチェック');