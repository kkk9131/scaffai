// 足場計算エンジンの型定義

// モバイル版と同じ構造のUI用入力データ型定義
export interface MobileScaffoldInputData {
  // 躯体幅 (Frame Width) - Required
  frameWidth: {
    northSouth: number;  // 南北
    eastWest: number;    // 東西
  };
  
  // 軒の出 (Eave Overhang) - Optional
  eaveOverhang: {
    north: number;  // 北
    east: number;   // 東
    south: number;  // 南
    west: number;   // 西
  };
  
  // 敷地境界線の有無 (Property Line Settings)
  propertyLine: {
    north: boolean;
    east: boolean;
    south: boolean;
    west: boolean;
  };
  
  // 敷地境界線距離 (Property Line Distance) - when enabled
  propertyLineDistance: {
    north: number | null;
    east: number | null;
    south: number | null;
    west: number | null;
  };
  
  // 基準高さ (Reference Height) - Required
  referenceHeight: number;
  
  // 屋根の形状 (Roof Shape) - Required
  roofShape: 'flat' | 'sloped' | 'roofDeck';
  
  // 根がらみ支柱の有無 (Tie Columns)
  hasTieColumns: boolean;
  
  // 軒先手摺の本数 (Eaves Handrails)
  eavesHandrails: number;
  
  // 特殊部材数 (Special Materials)
  specialMaterial: {
    northSouth: {
      material355: number;  // 355mm
      material300: number;  // 300mm
      material150: number;  // 150mm
    };
    eastWest: {
      material355: number;  // 355mm
      material300: number;  // 300mm
      material150: number;  // 150mm
    };
  };
  
  // 目標離れ（4面個別設定）(Target Offset - 4-sided Individual Settings)
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

// 計算エンジン用の既存型定義（レガシー）
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

// モバイル版データを計算エンジン用データに変換する関数
export function convertMobileToEngine(mobileData: MobileScaffoldInputData): ScaffoldInputData {
  // 屋根形状の変換
  const roofShapeMap = {
    'flat': 'フラット' as const,
    'sloped': '勾配軒' as const,
    'roofDeck': '陸屋根' as const,
  };

  return {
    // 躯体寸法
    width_NS: mobileData.frameWidth.northSouth,
    width_EW: mobileData.frameWidth.eastWest,
    
    // 軒の出
    eaves_N: mobileData.eaveOverhang.north,
    eaves_E: mobileData.eaveOverhang.east,
    eaves_S: mobileData.eaveOverhang.south,
    eaves_W: mobileData.eaveOverhang.west,
    
    // 境界線距離（有無フラグと距離を統合）
    boundary_N: mobileData.propertyLine.north ? mobileData.propertyLineDistance.north : null,
    boundary_E: mobileData.propertyLine.east ? mobileData.propertyLineDistance.east : null,
    boundary_S: mobileData.propertyLine.south ? mobileData.propertyLineDistance.south : null,
    boundary_W: mobileData.propertyLine.west ? mobileData.propertyLineDistance.west : null,
    
    // 基準高さと屋根形状
    standard_height: mobileData.referenceHeight,
    roof_shape: roofShapeMap[mobileData.roofShape],
    
    // 根がらみ支柱と軒先手すり
    tie_column: mobileData.hasTieColumns,
    railing_count: mobileData.eavesHandrails,
    
    // 特殊部材 (南北方向)
    use_355_NS: mobileData.specialMaterial.northSouth.material355,
    use_300_NS: mobileData.specialMaterial.northSouth.material300,
    use_150_NS: mobileData.specialMaterial.northSouth.material150,
    
    // 特殊部材 (東西方向)
    use_355_EW: mobileData.specialMaterial.eastWest.material355,
    use_300_EW: mobileData.specialMaterial.eastWest.material300,
    use_150_EW: mobileData.specialMaterial.eastWest.material150,
    
    // 目標離れ（有効フラグと値を統合）
    target_margin_N: mobileData.targetOffset.north.enabled ? mobileData.targetOffset.north.value : null,
    target_margin_E: mobileData.targetOffset.east.enabled ? mobileData.targetOffset.east.value : null,
    target_margin_S: mobileData.targetOffset.south.enabled ? mobileData.targetOffset.south.value : null,
    target_margin_W: mobileData.targetOffset.west.enabled ? mobileData.targetOffset.west.value : null,
  };
}

export interface FaceDimensionResult {
  total_span: number;
  span_parts_text: string;
  left_margin: number;
  right_margin: number;
  left_note: string;
  right_note: string;
}

export interface SpanCalculationResult {
  base: number;
  parts: number[];
  total_span: number;
}

// 計算エンジン定数
export const SCAFFOLD_CONSTANTS = {
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
} as const;

// 部材サイズ
export const NORMAL_PARTS = [1800, 1500, 1200, 900, 600] as const;
export const SPECIAL_PARTS = [150, 300, 355] as const;

// 屋根形状別の基本高さ
export const ROOF_BASE_UNIT_MAP = {
  'フラット': 1700,
  '勾配軒': 1900,
  '陸屋根': 1800,
} as const;