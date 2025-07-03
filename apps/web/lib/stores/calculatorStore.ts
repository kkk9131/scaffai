import { create } from 'zustand';
import { 
  calculateAll,
  convertToScaffoldInputData,
  type InputData,
  type CalculationResult,
  type ScaffoldInputData,
  type ScaffoldCalculationResult,
  defaultInputData
} from '../calculator/mobile-engine';
import { validateMobileScaffoldInput } from '../validation';

// Re-export types for external use
export type { InputData as MobileScaffoldInputData, CalculationResult as ScaffoldCalculationResult };

interface CalculatorState {
  // 入力データ
  inputData: InputData;
  
  // 計算結果
  result: CalculationResult | null;
  
  // UI状態
  isCalculating: boolean;
  error: string | null;
  validationErrors: Record<string, string> | null;
  
  // アクション
  updateInput: (data: Partial<InputData>) => void;
  calculate: () => Promise<void>;
  reset: () => void;
  validateInput: () => boolean;
}

// デフォルト値を使用（モバイル版と完全一致）

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  inputData: defaultInputData,
  result: null,
  isCalculating: false,
  error: null,
  validationErrors: null,
  
  updateInput: (data) => set((state) => ({
    inputData: { ...state.inputData, ...data },
    error: null, // 入力変更時にエラーをクリア
    validationErrors: null, // バリデーションエラーもクリア
  })),
  
  validateInput: () => {
    const { inputData } = get();
    const validation = validateMobileScaffoldInput(inputData);
    
    if (!validation.success) {
      set({ validationErrors: validation.errors });
      return false;
    }
    
    set({ validationErrors: null });
    return true;
  },
  
  calculate: async () => {
    const { inputData, validateInput } = get();
    
    // まずバリデーションを実行
    if (!validateInput()) {
      set({ error: '入力値に誤りがあります。エラーを修正してください。' });
      return;
    }
    
    set({ isCalculating: true, error: null, validationErrors: null });
    
    try {
      console.log('🔍 [DEBUG] 入力データ (Original Input):', JSON.stringify(inputData, null, 2));
      
      // モバイル版データを計算エンジン用データに変換
      const engineData = convertToScaffoldInputData(inputData);
      console.log('🔍 [DEBUG] 変換後データ (Engine Input):', JSON.stringify(engineData, null, 2));
      
      const result = await calculateScaffold(engineData);
      console.log('🔍 [DEBUG] 計算結果 (Calculation Result):', JSON.stringify(result, null, 2));
      
      set({ result, isCalculating: false });
    } catch (error) {
      console.error('❌ [DEBUG] 計算エラー:', error);
      set({ 
        error: error instanceof Error ? error.message : '計算エラーが発生しました',
        isCalculating: false 
      });
    }
  },
  
  reset: () => set({
    inputData: defaultInputData,
    result: null,
    error: null,
    validationErrors: null,
    isCalculating: false,
  }),
}));

// モバイル版計算エンジンを使用
async function calculateScaffold(input: ScaffoldInputData): Promise<CalculationResult> {
  console.log('⚙️ [DEBUG] モバイル版計算エンジン開始 - calculateAll() 呼び出し');
  console.log('⚙️ [DEBUG] エンジン入力検証:', {
    'width_NS': input.width_NS,
    'width_EW': input.width_EW,
    'standard_height': input.standard_height,
    'roof_shape': input.roof_shape,
    'target_margin_N': input.target_margin_N,
    'target_margin_E': input.target_margin_E,
    'target_margin_S': input.target_margin_S,
    'target_margin_W': input.target_margin_W,
    'eaves_N': input.eaves_N,
    'eaves_E': input.eaves_E,
    'eaves_S': input.eaves_S,
    'eaves_W': input.eaves_W,
    'boundary_N': input.boundary_N,
    'boundary_E': input.boundary_E,
    'boundary_S': input.boundary_S,
    'boundary_W': input.boundary_W
  });
  
  // 計算時間をシミュレート
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // モバイル版計算エンジンを呼び出し
  console.log('🔥 [DEBUG] モバイル版計算エンジン直前 - 完全な入力データ:', JSON.stringify(input, null, 2));
  const scaffoldResult = calculateAll(input);
  console.log('🔥 [DEBUG] モバイル版計算エンジン直後 - 完全な結果データ:', JSON.stringify(scaffoldResult, null, 2));
  
  console.log('⚙️ [DEBUG] モバイル版計算エンジン完了 - 主要結果:', {
    'ns_total_span': scaffoldResult.ns_total_span,
    'ew_total_span': scaffoldResult.ew_total_span,
    'ns_span_structure': scaffoldResult.ns_span_structure,
    'ew_span_structure': scaffoldResult.ew_span_structure,
    'num_stages': scaffoldResult.num_stages
  });
  
  return scaffoldResult;
}