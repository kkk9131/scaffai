// 足場計算エンジンの型定義
// @scaffai/coreへの依存を完全に削除し、モバイル版から移植

// モバイル版から移植したすべての型定義
export type {
  InputData,
  CalculationResult,
  ScaffoldInputData,
  ScaffoldCalculationResult
} from './mobile-engine';

// モバイル版から移植した変換関数
export {
  convertToScaffoldInputData,
  convertFromScaffoldResult,
  calculateAll,
  defaultInputData,
  testInputData
} from './mobile-engine';