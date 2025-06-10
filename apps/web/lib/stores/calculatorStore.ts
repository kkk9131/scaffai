import { create } from 'zustand';
import { calculateAll } from '../calculator/engine';
import { ScaffoldInputData, ScaffoldCalculationResult } from '../calculator/types';

// Re-export types for external use
export type { ScaffoldInputData, ScaffoldCalculationResult };

interface CalculatorState {
  // 入力データ
  inputData: ScaffoldInputData;
  
  // 計算結果
  result: ScaffoldCalculationResult | null;
  
  // UI状態
  isCalculating: boolean;
  error: string | null;
  
  // アクション
  updateInput: (data: Partial<ScaffoldInputData>) => void;
  calculate: () => Promise<void>;
  reset: () => void;
}

// デフォルト値
const defaultInputData: ScaffoldInputData = {
  width_NS: 10000,
  width_EW: 9000,
  eaves_N: 500,
  eaves_E: 500,
  eaves_S: 500,
  eaves_W: 500,
  boundary_N: null,
  boundary_E: null,
  boundary_S: null,
  boundary_W: null,
  standard_height: 2400,
  roof_shape: 'フラット',
  tie_column: true,
  railing_count: 0,
  use_355_NS: 0,
  use_300_NS: 0,
  use_150_NS: 0,
  use_355_EW: 0,
  use_300_EW: 0,
  use_150_EW: 0,
  target_margin_N: 900,
  target_margin_E: 900,
  target_margin_S: 900,
  target_margin_W: 900,
};

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  inputData: defaultInputData,
  result: null,
  isCalculating: false,
  error: null,
  
  updateInput: (data) => set((state) => ({
    inputData: { ...state.inputData, ...data },
    error: null, // 入力変更時にエラーをクリア
  })),
  
  calculate: async () => {
    const { inputData } = get();
    
    set({ isCalculating: true, error: null });
    
    try {
      // 計算エンジンを呼び出し（後で実装）
      const result = await calculateScaffold(inputData);
      set({ result, isCalculating: false });
    } catch (error) {
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
    isCalculating: false,
  }),
}));

// 実際の計算エンジンを使用
async function calculateScaffold(input: ScaffoldInputData): Promise<ScaffoldCalculationResult> {
  // 計算時間をシミュレート
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 実際の計算エンジンを呼び出し
  return calculateAll(input);
}