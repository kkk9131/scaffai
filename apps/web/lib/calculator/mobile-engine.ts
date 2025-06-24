// モバイル版計算エンジン - Web版移植
// @scaffai/coreへの依存を完全に回避し、モバイル版と100%同じ計算結果を保証

// roofShapeのマッピング
const roofShapeMapping = {
  'flat': 'フラット' as const,
  'sloped': '勾配軒' as const,
  'roofDeck': '陸屋根' as const,
};

// 入力データの型定義（モバイル版と完全一致）
export type InputData = {
  frameWidth: {
    northSouth: number | null;
    eastWest: number | null;
  };
  eaveOverhang: {
    north: number | null;
    east: number | null;
    south: number | null;
    west: number | null;
  };
  propertyLine: {
    north: boolean;
    east: boolean;
    south: boolean;
    west: boolean;
  };
  referenceHeight: number | null;
  roofShape: 'flat' | 'sloped' | 'roofDeck';
  hasTieColumns: boolean;
  eavesHandrails: number | null;
  specialMaterial: {
    northSouth: {
      material355: number | null;
      material300: number | null;
      material150: number | null;
    };
    eastWest: {
      material355: number | null;
      material300: number | null;
      material150: number | null;
    };
  };
  targetOffset: {
    north: { enabled: boolean; value: number | null };
    east: { enabled: boolean; value: number | null };
    south: { enabled: boolean; value: number | null };
    west: { enabled: boolean; value: number | null };
  };
  propertyLineDistance?: {
    north: number | null;
    east: number | null;
    south: number | null;
    west: number | null;
  };
};

// 計算結果の型定義（モバイル版と完全一致）
export type CalculationResult = {
  ns_total_span: number;
  ew_total_span: number;
  ns_span_structure: string;
  ew_span_structure: string;
  north_gap: string;
  south_gap: string;
  east_gap: string;
  west_gap: string;
  num_stages: number;
  modules_count: number;
  jack_up_height: number;
  first_layer_height: number;
  tie_ok: boolean;
  tie_column_used: boolean;
};

// Scaffold計算用入力データ型（モバイル版と完全一致）
export interface ScaffoldInputData {
  // 躯体寸法
  width_NS: number;
  width_EW: number;
  
  // 軒の出
  eaves_N: number;
  eaves_E: number;
  eaves_S: number;
  eaves_W: number;
  
  // 境界線距離 (nullは境界指示なし)
  boundary_N: number | null;
  boundary_E: number | null;
  boundary_S: number | null;
  boundary_W: number | null;
  
  // 基準高さと屋根形状
  standard_height: number;
  roof_shape: 'フラット' | '勾配軒' | '陸屋根';
  
  // 根がらみ支柱と軒先手すり
  tie_column: boolean;
  railing_count: number;
  
  // 特殊部材 (南北方向)
  use_355_NS: number;
  use_300_NS: number;
  use_150_NS: number;
  
  // 特殊部材 (東西方向)
  use_355_EW: number;
  use_300_EW: number;
  use_150_EW: number;
  
  // 目標離れ (4面個別設定、nullは軒の出+80の最小離れのみ)
  target_margin_N: number | null;
  target_margin_E: number | null;
  target_margin_S: number | null;
  target_margin_W: number | null;
}

// Scaffold計算結果型（モバイル版と完全一致）
export interface ScaffoldCalculationResult {
  // スパン情報
  ns_total_span: number;
  ew_total_span: number;
  ns_span_structure: string;
  ew_span_structure: string;
  
  // 離れ情報
  north_gap: string;
  south_gap: string;
  east_gap: string;
  west_gap: string;
  
  // 段数・高さ情報
  num_stages: number;
  modules_count: number;
  jack_up_height: number;
  first_layer_height: number;
  
  // 根がらみ支柱情報
  tie_ok: boolean;
  tie_column_used: boolean;
}

// フロントエンド型からcore型への変換（モバイル版と完全一致）
export function convertToScaffoldInputData(inputData: InputData): ScaffoldInputData {
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

// core型からフロントエンド型への変換（モバイル版と完全一致）
export function convertFromScaffoldResult(result: ScaffoldCalculationResult): CalculationResult {
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

// 実際の@scaffai/coreライブラリから正確な計算エンジンをインポート
import { calculateAll as coreCalculateAll } from '../../../../packages/core/src/calculator/engine';

// モバイル版と同じ計算エンジンを使用
export function calculateAll(inputData: ScaffoldInputData): ScaffoldCalculationResult {
  console.log('calculateAll called with:', inputData);
  
  // @scaffai/coreライブラリの正確な計算エンジンを呼び出し
  const result = coreCalculateAll(inputData);
  
  console.log('Core calculation result:', result);
  
  return result;
}

// デフォルト値（モバイル版と完全一致）
export const defaultInputData: InputData = {
  frameWidth: {
    northSouth: null,
    eastWest: null,
  },
  eaveOverhang: {
    north: null,
    east: null,
    south: null,
    west: null,
  },
  propertyLine: {
    north: false,
    east: false,
    south: false,
    west: false,
  },
  referenceHeight: null,
  roofShape: 'flat',
  hasTieColumns: false,
  eavesHandrails: null,
  specialMaterial: {
    northSouth: {
      material355: null,
      material300: null,
      material150: null,
    },
    eastWest: {
      material355: null,
      material300: null,
      material150: null,
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

// テスト用データ（モバイル版と完全一致）
export const testInputData: InputData = {
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