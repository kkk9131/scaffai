// 足場計算の共通型定義
// モバイル版・Web版で共有される型定義

// フロントエンド用の入力データ型（モバイル版・Web版で共通）
export interface MobileScaffoldInputData {
  // 躯体幅 - Required, default values matching mobile
  frameWidth: {
    northSouth: number;
    eastWest: number;
  };
  
  // 軒の出 - Optional, default to 0
  eaveOverhang: {
    north: number;
    east: number;
    south: number;
    west: number;
  };
  
  // 敷地境界線の有無 - Default: all disabled
  propertyLine: {
    north: boolean;
    east: boolean;
    south: boolean;
    west: boolean;
  };
  
  // 敷地境界線距離 - Default: all null when disabled
  propertyLineDistance: {
    north: number | null;
    east: number | null;
    south: number | null;
    west: number | null;
  };
  
  // 基準高さ - Required, default from mobile placeholder
  referenceHeight: number;
  
  // 屋根の形状 - Required, default 'flat'
  roofShape: 'flat' | 'sloped' | 'roofDeck';
  
  // 根がらみ支柱の有無 - Default: false
  hasTieColumns: boolean;
  
  // 軒先手摺の本数 - Default: 0
  eavesHandrails: number;
  
  // 特殊部材数 - Default: all 0
  specialMaterial: {
    northSouth: {
      material355: number;
      material300: number;
      material150: number;
    };
    eastWest: {
      material355: number;
      material300: number;
      material150: number;
    };
  };
  
  // 目標離れ - Default: all disabled
  targetOffset: {
    north: {
      enabled: boolean;
      value: number | null;
    };
    east: {
      enabled: boolean;
      value: number | null;
    };
    south: {
      enabled: boolean;
      value: number | null;
    };
    west: {
      enabled: boolean;
      value: number | null;
    };
  };
}

// 計算エンジン用の入力データ型
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

// 計算結果の型
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

// roofShapeのマッピング
export const roofShapeMapping = {
  'flat': 'フラット' as const,
  'sloped': '勾配軒' as const,
  'roofDeck': '陸屋根' as const,
};

// フロントエンド型から計算エンジン型への変換関数
export function convertMobileToEngine(inputData: MobileScaffoldInputData): ScaffoldInputData {
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

// デフォルト値（モバイル版・Web版で共通）
export const defaultMobileScaffoldInputData: MobileScaffoldInputData = {
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
  propertyLineDistance: {
    north: null,
    east: null,
    south: null,
    west: null,
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
    north: {
      enabled: false,
      value: null,
    },
    east: {
      enabled: false,
      value: null,
    },
    south: {
      enabled: false,
      value: null,
    },
    west: {
      enabled: false,
      value: null,
    },
  },
};