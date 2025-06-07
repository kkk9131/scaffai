import { ScaffoldInputData } from './types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * 足場計算入力データのバリデーション
 */
export function validateScaffoldInput(input: ScaffoldInputData): ValidationResult {
  const errors: ValidationError[] = [];

  // 躯体寸法の検証
  if (!input.width_NS || input.width_NS <= 0) {
    errors.push({ field: 'width_NS', message: '南北方向の躯体寸法は正の値である必要があります' });
  }
  if (input.width_NS > 50000) {
    errors.push({ field: 'width_NS', message: '南北方向の躯体寸法が大きすぎます（最大50m）' });
  }

  if (!input.width_EW || input.width_EW <= 0) {
    errors.push({ field: 'width_EW', message: '東西方向の躯体寸法は正の値である必要があります' });
  }
  if (input.width_EW > 50000) {
    errors.push({ field: 'width_EW', message: '東西方向の躯体寸法が大きすぎます（最大50m）' });
  }

  // 軒の出の検証
  const eavesFields = ['eaves_N', 'eaves_E', 'eaves_S', 'eaves_W'] as const;
  for (const field of eavesFields) {
    const value = input[field];
    if (value < 0) {
      errors.push({ field, message: '軒の出は0以上である必要があります' });
    }
    if (value > 5000) {
      errors.push({ field, message: '軒の出が大きすぎます（最大5m）' });
    }
  }

  // 境界線距離の検証
  const boundaryFields = ['boundary_N', 'boundary_E', 'boundary_S', 'boundary_W'] as const;
  for (const field of boundaryFields) {
    const value = input[field];
    if (value !== null) {
      if (value < 0) {
        errors.push({ field, message: '境界線距離は0以上である必要があります' });
      }
      if (value > 20000) {
        errors.push({ field, message: '境界線距離が大きすぎます（最大20m）' });
      }
    }
  }

  // 基準高さの検証
  if (!input.standard_height || input.standard_height <= 0) {
    errors.push({ field: 'standard_height', message: '基準高さは正の値である必要があります' });
  }
  if (input.standard_height < 1000) {
    errors.push({ field: 'standard_height', message: '基準高さが低すぎます（最小1m）' });
  }
  if (input.standard_height > 30000) {
    errors.push({ field: 'standard_height', message: '基準高さが高すぎます（最大30m）' });
  }

  // 屋根形状の検証
  const validRoofShapes = ['フラット', '勾配軒', '陸屋根'] as const;
  if (!validRoofShapes.includes(input.roof_shape)) {
    errors.push({ 
      field: 'roof_shape', 
      message: '屋根形状は「フラット」「勾配軒」「陸屋根」のいずれかである必要があります' 
    });
  }

  // 軒先手すりの検証
  if (input.railing_count < 0 || input.railing_count > 4) {
    errors.push({ field: 'railing_count', message: '軒先手すりの個数は0〜4の範囲である必要があります' });
  }

  // 特殊部材の検証
  const specialPartFields = [
    'use_355_NS', 'use_300_NS', 'use_150_NS',
    'use_355_EW', 'use_300_EW', 'use_150_EW'
  ] as const;
  
  for (const field of specialPartFields) {
    const value = input[field];
    if (value < 0) {
      errors.push({ field, message: '特殊部材の個数は0以上である必要があります' });
    }
    if (value > 10) {
      errors.push({ field, message: '特殊部材の個数が多すぎます（最大10個）' });
    }
  }

  // 目標離れの検証（4面個別）
  const targetMargins = [
    { value: input.target_margin_N, name: '北面目標離れ' },
    { value: input.target_margin_E, name: '東面目標離れ' },
    { value: input.target_margin_S, name: '南面目標離れ' },
    { value: input.target_margin_W, name: '西面目標離れ' }
  ];
  
  targetMargins.forEach(({ value, name }) => {
    if (value !== null) {
      if (value < 0) {
        errors.push({ field: 'target_margin', message: `${name}は0以上である必要があります` });
      }
      if (value > 5000) {
        errors.push({ field: 'target_margin', message: `${name}が大きすぎます（最大5m）` });
      }
    }
  });

  // 論理的整合性の検証
  const totalSpecialNS = (input.use_355_NS || 0) + (input.use_300_NS || 0) + (input.use_150_NS || 0);
  const totalSpecialEW = (input.use_355_EW || 0) + (input.use_300_EW || 0) + (input.use_150_EW || 0);
  
  if (totalSpecialNS > 8) {
    errors.push({ 
      field: 'special_parts_NS', 
      message: '南北方向の特殊部材の合計が多すぎます（最大8個）' 
    });
  }
  
  if (totalSpecialEW > 8) {
    errors.push({ 
      field: 'special_parts_EW', 
      message: '東西方向の特殊部材の合計が多すぎます（最大8個）' 
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 入力値を正規化（型変換・範囲制限）
 */
export function normalizeScaffoldInput(input: Partial<ScaffoldInputData>): ScaffoldInputData {
  return {
    width_NS: Math.max(0, Number(input.width_NS) || 0),
    width_EW: Math.max(0, Number(input.width_EW) || 0),
    eaves_N: Math.max(0, Number(input.eaves_N) || 0),
    eaves_E: Math.max(0, Number(input.eaves_E) || 0),
    eaves_S: Math.max(0, Number(input.eaves_S) || 0),
    eaves_W: Math.max(0, Number(input.eaves_W) || 0),
    boundary_N: input.boundary_N !== null ? Math.max(0, Number(input.boundary_N)) : null,
    boundary_E: input.boundary_E !== null ? Math.max(0, Number(input.boundary_E)) : null,
    boundary_S: input.boundary_S !== null ? Math.max(0, Number(input.boundary_S)) : null,
    boundary_W: input.boundary_W !== null ? Math.max(0, Number(input.boundary_W)) : null,
    standard_height: Math.max(0, Number(input.standard_height) || 0),
    roof_shape: input.roof_shape || 'フラット',
    tie_column: Boolean(input.tie_column),
    railing_count: Math.max(0, Math.min(4, Number(input.railing_count) || 0)),
    use_355_NS: Math.max(0, Number(input.use_355_NS) || 0),
    use_300_NS: Math.max(0, Number(input.use_300_NS) || 0),
    use_150_NS: Math.max(0, Number(input.use_150_NS) || 0),
    use_355_EW: Math.max(0, Number(input.use_355_EW) || 0),
    use_300_EW: Math.max(0, Number(input.use_300_EW) || 0),
    use_150_EW: Math.max(0, Number(input.use_150_EW) || 0),
    target_margin_N: input.target_margin_N !== null ? Math.max(0, Number(input.target_margin_N)) : null,
    target_margin_E: input.target_margin_E !== null ? Math.max(0, Number(input.target_margin_E)) : null,
    target_margin_S: input.target_margin_S !== null ? Math.max(0, Number(input.target_margin_S)) : null,
    target_margin_W: input.target_margin_W !== null ? Math.max(0, Number(input.target_margin_W)) : null
  };
}