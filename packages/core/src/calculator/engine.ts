import { 
  ScaffoldInputData, 
  ScaffoldCalculationResult, 
  SCAFFOLD_CONSTANTS, 
  NORMAL_PARTS, 
  ROOF_BASE_UNIT_MAP 
} from './types';
import { calculateFaceDimensions } from './face-dimensions';

const { 
  STAGE_UNIT_HEIGHT, 
  FIRST_LAYER_MIN_HEIGHT_THRESHOLD, 
  TIE_COLUMN_REDUCTION_LARGE, 
  TIE_COLUMN_REDUCTION_SMALL, 
  TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION, 
  TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION 
} = SCAFFOLD_CONSTANTS;

/**
 * 足場計算のメイン関数
 */
export function calculateAll(input: ScaffoldInputData): ScaffoldCalculationResult {
  const {
    width_NS, width_EW,
    eaves_N, eaves_E, eaves_S, eaves_W,
    boundary_N, boundary_E, boundary_S, boundary_W,
    standard_height, roof_shape, tie_column, railing_count,
    use_355_NS = 0, use_300_NS = 0, use_150_NS = 0,
    use_355_EW = 0, use_300_EW = 0, use_150_EW = 0,
    target_margin_N, target_margin_E, target_margin_S, target_margin_W
  } = input;

  // 南北方向の計算（東面・西面の離れを決定）
  // 個別の目標離れを考慮して計算（東=left, 西=right）
  const targetMarginEast = target_margin_E;
  const targetMarginWest = target_margin_W;
    
  const nsResult = calculateFaceDimensions(
    width_NS,
    eaves_E, eaves_W,  // 左=東、右=西
    boundary_E, boundary_W,
    use_150_NS, use_300_NS, use_355_NS,
    NORMAL_PARTS,
    targetMarginEast,
    targetMarginWest,
    "NS_direction (East/West gaps)"
  );

  // 東西方向の計算（北面・南面の離れを決定）
  // 個別の目標離れを考慮して計算（南=left, 北=right）
  const targetMarginSouth = target_margin_S;
  const targetMarginNorth = target_margin_N;
    
  const ewResult = calculateFaceDimensions(
    width_EW,
    eaves_S, eaves_N,  // 左=南、右=北
    boundary_S, boundary_N,
    use_150_EW, use_300_EW, use_355_EW,
    NORMAL_PARTS,
    targetMarginSouth,
    targetMarginNorth,
    "EW_direction (North/South gaps)"
  );

  // 段数とジャッキアップ高さ計算
  const baseUnit = ROOF_BASE_UNIT_MAP[roof_shape] || 1700;
  const remainder = standard_height - baseUnit;
  const stageUnit = STAGE_UNIT_HEIGHT;

  const initialStages = 1 + (remainder > 0 ? Math.floor(remainder / stageUnit) : 0);
  const initialLeftover = remainder - (initialStages - 1) * stageUnit;

  let firstLayerHeight: number;
  if (initialLeftover < FIRST_LAYER_MIN_HEIGHT_THRESHOLD) {
    firstLayerHeight = initialLeftover + stageUnit;
  } else {
    firstLayerHeight = initialLeftover;
  }

  const remainingAfterFirst = standard_height - baseUnit - firstLayerHeight;
  const numStages = 1 + (remainingAfterFirst > 0 ? Math.floor(remainingAfterFirst / stageUnit) : 0);
  const leftover = standard_height - baseUnit - (numStages - 1) * stageUnit;

  let jackUpHeight = leftover;
  let reductionLoops = 0;
  let tiePossible = true;

  // 根がらみ支柱の計算
  if (tie_column) {
    if (jackUpHeight >= TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION) {
      while (jackUpHeight >= TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION) {
        jackUpHeight -= TIE_COLUMN_REDUCTION_LARGE;
        reductionLoops++;
      }
      if (jackUpHeight >= TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION) {
        jackUpHeight -= TIE_COLUMN_REDUCTION_SMALL;
      } else {
        tiePossible = false;
      }
    } else if (jackUpHeight >= TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION) {
      jackUpHeight -= TIE_COLUMN_REDUCTION_SMALL;
    } else {
      tiePossible = false;
    }
  } else {
    while (jackUpHeight >= TIE_COLUMN_REDUCTION_LARGE) {
      jackUpHeight -= TIE_COLUMN_REDUCTION_LARGE;
      reductionLoops++;
    }
  }

  // コマ数計算
  let modulesCount = 4 + (numStages - 1) * 4 + reductionLoops;
  if (railing_count === 3) {
    modulesCount += 2;
  } else if (railing_count === 2) {
    modulesCount += 1;
  }

  // 1層目高さの最終調整
  const finalLeftoverForFirstLayer = standard_height - baseUnit - (numStages - 1) * stageUnit;
  if (finalLeftoverForFirstLayer < FIRST_LAYER_MIN_HEIGHT_THRESHOLD) {
    firstLayerHeight = finalLeftoverForFirstLayer + stageUnit;
  } else {
    firstLayerHeight = finalLeftoverForFirstLayer;
  }

  return {
    ns_total_span: nsResult.total_span,
    ew_total_span: ewResult.total_span,
    ns_span_structure: nsResult.span_parts_text,
    ew_span_structure: ewResult.span_parts_text,
    north_gap: ewResult.right_note,  // EW方向の右=北
    south_gap: ewResult.left_note,   // EW方向の左=南
    east_gap: nsResult.left_note,    // NS方向の左=東
    west_gap: nsResult.right_note,   // NS方向の右=西
    num_stages: numStages,
    modules_count: modulesCount,
    jack_up_height: jackUpHeight,
    first_layer_height: firstLayerHeight,
    tie_ok: tiePossible,
    tie_column_used: tie_column
  };
}

/**
 * 簡易版計算関数（従来のAPIとの互換性のため）
 */
export function calcAll(
  width_NS: number, width_EW: number,
  eaves_N: number, eaves_E: number, eaves_S: number, eaves_W: number,
  boundary_N: number | null, boundary_E: number | null, 
  boundary_S: number | null, boundary_W: number | null,
  standard_height: number, roof_shape: 'フラット' | '勾配軒' | '陸屋根',
  tie_column: boolean, railing_count: number,
  use_355_NS: number = 0, use_300_NS: number = 0, use_150_NS: number = 0,
  use_355_EW: number = 0, use_300_EW: number = 0, use_150_EW: number = 0,
  target_margin_N: number | null = null,
  target_margin_E: number | null = null,
  target_margin_S: number | null = null,
  target_margin_W: number | null = null
): ScaffoldCalculationResult {
  return calculateAll({
    width_NS, width_EW,
    eaves_N, eaves_E, eaves_S, eaves_W,
    boundary_N, boundary_E, boundary_S, boundary_W,
    standard_height, roof_shape, tie_column, railing_count,
    use_355_NS, use_300_NS, use_150_NS,
    use_355_EW, use_300_EW, use_150_EW,
    target_margin_N, target_margin_E, target_margin_S, target_margin_W
  });
}