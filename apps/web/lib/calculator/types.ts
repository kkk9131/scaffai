// 足場計算エンジンの型定義

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

// SimpleCalculationDisplay用の拡張型
export interface ExtendedScaffoldCalculationResult extends ScaffoldCalculationResult {
  success: boolean;
  buildingDimensions?: {
    width_EW: number;
    width_NS: number;
  };
  eaveDistances?: {
    north: number;
    east: number;
    south: number;
    west: number;
  };
  totalSpans?: {
    eastWest: number;
    northSouth: number;
  };
  faceDistances?: {
    north: number;
    east: number;
    south: number;
    west: number;
  };
  spanConfigurations?: {
    north: number[];
    east: number[];
    south: number[];
    west: number[];
  };
  calculationMethod?: string;
  insideCorners?: {
    index: number;
    position: { x: number; y: number };
    angle: number;
    prevEdgeLength: number;
    nextEdgeLength: number;
  }[];
}

// 割付計算結果の型
export interface AllocationResult {
  eastWest: {
    totalSpan: number;
    minRequiredDistance: number;
    actualDistance: number;
    spanConfig: number[];
  };
  northSouth: {
    totalSpan: number;
    minRequiredDistance: number;
    actualDistance: number;
    spanConfig: number[];
  };
  insideResults?: any[];
  insideCorners?: {
    index: number;
    position: { x: number; y: number };
    angle: number;
    prevEdgeLength: number;
    nextEdgeLength: number;
  }[];
}
