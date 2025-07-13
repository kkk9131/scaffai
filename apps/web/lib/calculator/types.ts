// 足場計算エンジンの型定義

// coreパッケージから基本型をインポート
import type {
  ScaffoldInputData as CoreScaffoldInputData,
  ScaffoldCalculationResult as CoreScaffoldCalculationResult,
  FaceDimensionResult,
  SpanCalculationResult
} from '../../../../packages/core/src/calculator/types';

export type ScaffoldInputData = CoreScaffoldInputData;
export type ScaffoldCalculationResult = CoreScaffoldCalculationResult;
export type { FaceDimensionResult, SpanCalculationResult };

export {
  SCAFFOLD_CONSTANTS,
  NORMAL_PARTS,
  SPECIAL_PARTS,
  ROOF_BASE_UNIT_MAP
} from '../../../../packages/core/src/calculator/types';

// モバイル版から移植した型定義
export type {
  InputData,
  CalculationResult
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
    prevEdgeIndex: number;
    nextEdgeIndex: number;
    prevEaveDistance: number;
    nextEaveDistance: number;
  }[];
  edgeCalculations?: {
    edgeIndex: number;
    edgeName: string;
    direction: string;
    length: number;
    eaveDistance: number;
    spanConfig: number[];
    totalSpan: number;
    actualDistance: number;
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
    prevEdgeIndex: number;
    nextEdgeIndex: number;
    prevEaveDistance: number;
    nextEaveDistance: number;
  }[];
  edgeCalculations?: {
    edgeIndex: number;
    edgeName: string;
    direction: string;
    length: number;
    eaveDistance: number;
    spanConfig: number[];
    totalSpan: number;
    actualDistance: number;
  }[];
}
