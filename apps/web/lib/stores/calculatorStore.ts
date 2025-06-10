import { create } from 'zustand';
import { calculateAll } from '../calculator/engine';
import { 
  MobileScaffoldInputData, 
  ScaffoldInputData,
  ScaffoldCalculationResult, 
  convertMobileToEngine 
} from '../calculator/types';

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
  
  // アクション
  updateInput: (data: Partial<MobileScaffoldInputData>) => void;
  calculate: () => Promise<void>;
  reset: () => void;
}

// デフォルト値（モバイル版と同じ）
const defaultInputData: MobileScaffoldInputData = {
  // 躯体幅 - Required, default values matching mobile
  frameWidth: {
    northSouth: 1000,  // モバイル版のdefault placeholder
    eastWest: 1000,
  },
  
  // 軒の出 - Optional, default to 0
  eaveOverhang: {
    north: 0,
    east: 0,
    south: 0,
    west: 0,
  },
  
  // 敷地境界線の有無 - Default: all disabled
  propertyLine: {
    north: false,
    east: false,
    south: false,
    west: false,
  },
  
  // 敷地境界線距離 - Default: all null when disabled
  propertyLineDistance: {
    north: null,
    east: null,
    south: null,
    west: null,
  },
  
  // 基準高さ - Required, default from mobile placeholder
  referenceHeight: 2400,
  
  // 屋根の形状 - Required, default 'flat'
  roofShape: 'flat',
  
  // 根がらみ支柱の有無 - Default: false
  hasTieColumns: false,
  
  // 軒先手摺の本数 - Default: 0
  eavesHandrails: 0,
  
  // 特殊部材数 - Default: all 0
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
  
  // 目標離れ - Default: all disabled
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