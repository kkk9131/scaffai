import { create } from 'zustand';
import { calculateAll } from '../calculator/engine';
import { 
  MobileScaffoldInputData, 
  ScaffoldInputData,
  ScaffoldCalculationResult, 
  convertMobileToEngine,
  defaultMobileScaffoldInputData
} from '../calculator/types';
import { validateMobileScaffoldInput } from '../validation';

// Re-export types for external use
export type { MobileScaffoldInputData, ScaffoldCalculationResult };

interface CalculatorState {
  // 入力データ
  inputData: MobileScaffoldInputData;
  
  // 計算結果
  result: ScaffoldCalculationResult | null;
  
  // UI状態
  isCalculating: boolean;
  error: string | null;
  validationErrors: Record<string, string> | null;
  
  // アクション
  updateInput: (data: Partial<MobileScaffoldInputData>) => void;
  calculate: () => Promise<void>;
  reset: () => void;
  validateInput: () => boolean;
}

// デフォルト値を共通パッケージから使用

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  inputData: defaultMobileScaffoldInputData,
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
      // モバイル版データを計算エンジン用データに変換
      const engineData = convertMobileToEngine(inputData);
      const result = await calculateScaffold(engineData);
      set({ result, isCalculating: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '計算エラーが発生しました',
        isCalculating: false 
      });
    }
  },
  
  reset: () => set({
    inputData: defaultMobileScaffoldInputData,
    result: null,
    error: null,
    validationErrors: null,
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