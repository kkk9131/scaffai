// 足場計算エンジンの型定義

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
  PREFERRED_MIN_MARGIN_ADDITION: 300, // 軒の出に追加する推奨最小マージン
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