import React, { createContext, useState, useContext, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { calculateAll, type ScaffoldInputData, type ScaffoldCalculationResult } from '@scaffai/core';
import { HistoryStorage } from '../utils/storage';
import { CalculationHistory } from '../types/history';
import { supabase } from '../lib/supabase';
import { useAuthContext } from './AuthContext';

// roofShapeのマッピング
const roofShapeMapping = {
  'flat': 'フラット' as const,
  'sloped': '勾配軒' as const,
  'roofDeck': '陸屋根' as const,
};

// フロントエンド型からcore型への変換
function convertToScaffoldInputData(inputData: InputData): ScaffoldInputData {
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
    target_margin: inputData.targetOffset || 900,
  };
}

// core型からフロントエンド型への変換
function convertFromScaffoldResult(result: ScaffoldCalculationResult): CalculationResult {
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

// 入力データの型定義
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
  targetOffset: number | null;
  propertyLineDistance?: {
    north: number | null;
    east: number | null;
    south: number | null;
    west: number | null;
  };
};

// 計算結果の型定義 (APIのレスポンス構造に合わせて修正済み)
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

// デフォルト値
const defaultInputData: InputData = {
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
  targetOffset: null,
  propertyLineDistance: {
    north: null,
    east: null,
    south: null,
    west: null,
  },
};

// テスト用データ
const testInputData: InputData = {
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
  targetOffset: 900,
  propertyLineDistance: {
    north: null,
    east: null,
    south: null,
    west: null,
  },
};

// コンテキストの型定義
type ScaffoldContextType = {
  inputData: InputData;
  setInputValue: (
    category: keyof InputData,
    field: string,
    value: any
  ) => void;
  resetInputData: () => void;
  calculationResult: CalculationResult | null;
  isLoading: boolean;
  error: string | null;
  calculateScaffold: () => Promise<void>;
  testAPICall: () => Promise<void>; // テスト用のシンプルなAPI呼び出し
  saveCalculationToHistory: (title?: string) => Promise<void>;
};

// コンテキスト作成
const ScaffoldContext = createContext<ScaffoldContextType | undefined>(
  undefined
);

// プロバイダーコンポーネント
export const ScaffoldProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [inputData, setInputData] = useState<InputData>(defaultInputData);
  const [calculationResult, setCalculationResult] =
    useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuthContext();

  // 入力値の更新 (ネスト階層対応済)
  const setInputValue = useCallback((
    category: keyof InputData,
    field: string, // 例: 'northSouth' または 'northSouth.material355'
    value: any
  ) => {
    console.log('setInputValue called:', { category, field, value });
    
    setInputData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev)) as InputData; // ディープコピー

      if (field === '') { // カテゴリ自体が値 (例: referenceHeight, roofShape)
        (newData[category] as any) = value;
      } else {
        const fieldParts = field.split('.');
        let currentLevel: any = newData[category];

        for (let i = 0; i < fieldParts.length - 1; i++) {
          if (!currentLevel[fieldParts[i]]) {
            currentLevel[fieldParts[i]] = {};
          }
          currentLevel = currentLevel[fieldParts[i]];
        }
        currentLevel[fieldParts[fieldParts.length - 1]] = value;
      }
      return newData;
    });
  }, []);

  // 入力データのリセット
  const resetInputData = useCallback(() => {
    console.log('resetInputData called');
    setInputData(defaultInputData);
    setCalculationResult(null);
    setError(null);
  }, []);

  // テスト用のローカル計算テスト
  const testAPICall = useCallback(async () => {
    console.log('testAPICall - Testing local calculation engine');
    try {
      // 計算用のテストデータを設定
      setInputData(testInputData);
      Alert.alert('テストデータ設定完了', '計算用のテストデータを設定しました。ローカル計算エンジンを使用します。');
    } catch (error) {
      console.error('Test local calculation failed:', error);
      Alert.alert('テストエラー', `テストに失敗しました: ${error}`);
    }
  }, []);

  // ローカル計算エンジンを使用した計算
  const calculateScaffold = useCallback(async () => {
    console.log('calculateScaffold called - using local calculation engine');
    setIsLoading(true);
    setError(null);

    try {
      // フロントエンド型からcore型への変換
      const scaffoldInputData = convertToScaffoldInputData(inputData);
      
      console.log('Local calculation input data:', JSON.stringify(scaffoldInputData, null, 2));

      // ローカル計算エンジンで計算実行
      const scaffoldResult = calculateAll(scaffoldInputData);
      
      console.log('Local calculation result:', scaffoldResult);
      
      // core型からフロントエンド型への変換
      const result = convertFromScaffoldResult(scaffoldResult);

      setCalculationResult(result);
      
      console.log('Setting calculation result:', result);
      console.log('Navigating to result screen...');
      
      // 自動的に履歴に保存（ローカル + Supabase）
      try {
        const historyItem: CalculationHistory = {
          id: HistoryStorage.generateId(),
          createdAt: new Date().toISOString(),
          inputData: inputData,
          result: result,
        };
        
        // ローカルストレージに保存
        await HistoryStorage.saveCalculation(historyItem);
        console.log('Calculation automatically saved to local history');
        
        // Supabaseにも保存（認証済みの場合）
        if (user) {
          try {
            const { error: supabaseError } = await supabase
              .from('scaffold_calculations')
              .insert({
                user_id: user.id,
                title: `計算結果 ${new Date().toLocaleDateString('ja-JP')}`,
                // 入力データの個別フィールド
                frame_width_ns: inputData.frameWidth.northSouth,
                frame_width_ew: inputData.frameWidth.eastWest,
                eaves_north: inputData.eaveOverhang.north,
                eaves_east: inputData.eaveOverhang.east,
                eaves_south: inputData.eaveOverhang.south,
                eaves_west: inputData.eaveOverhang.west,
                property_line_north: inputData.propertyLine.north,
                property_line_east: inputData.propertyLine.east,
                property_line_south: inputData.propertyLine.south,
                property_line_west: inputData.propertyLine.west,
                property_line_distance_north: inputData.propertyLineDistance?.north,
                property_line_distance_east: inputData.propertyLineDistance?.east,
                property_line_distance_south: inputData.propertyLineDistance?.south,
                property_line_distance_west: inputData.propertyLineDistance?.west,
                reference_height: inputData.referenceHeight,
                roof_shape: inputData.roofShape,
                has_tie_columns: inputData.hasTieColumns,
                eaves_handrails: inputData.eavesHandrails,
                special_material_ns_355: inputData.specialMaterial.northSouth.material355,
                special_material_ns_300: inputData.specialMaterial.northSouth.material300,
                special_material_ns_150: inputData.specialMaterial.northSouth.material150,
                special_material_ew_355: inputData.specialMaterial.eastWest.material355,
                special_material_ew_300: inputData.specialMaterial.eastWest.material300,
                special_material_ew_150: inputData.specialMaterial.eastWest.material150,
                target_offset: inputData.targetOffset,
                // 計算結果の個別フィールド
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
              });
              
            if (supabaseError) {
              console.error('Failed to save to Supabase:', supabaseError);
            } else {
              console.log('Calculation saved to Supabase database');
            }
          } catch (supabaseError) {
            console.error('Supabase save error:', supabaseError);
          }
        }
      } catch (historyError) {
        console.error('Failed to auto-save to history:', historyError);
      }
      
      // 結果画面へ遷移
      setTimeout(() => {
        try {
          router.push('/(tabs)/result');
          console.log('Navigation complete');
        } catch (navError) {
          console.error('Navigation error:', navError);
          Alert.alert('画面遷移エラー', 'ルーティングに問題が発生しました。');
        }
      }, 500);  // 少し遅延を入れて状態更新が完了するのを待つ

    } catch (err) {
      console.error('Local calculation failed:', err);
      const errorMessage = err instanceof Error ? err.message : '計算処理中にエラーが発生しました。入力データを確認してください。';
      setError(errorMessage);
      Alert.alert('計算エラー', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [inputData, router]);

  // 計算結果を履歴に保存
  const saveCalculationToHistory = useCallback(async (title?: string) => {
    if (!calculationResult) {
      Alert.alert('エラー', '保存する計算結果がありません');
      return;
    }

    try {
      const historyItem: CalculationHistory = {
        id: HistoryStorage.generateId(),
        createdAt: new Date().toISOString(),
        inputData: inputData,
        result: calculationResult,
        title: title,
      };

      // ローカルストレージに保存
      await HistoryStorage.saveCalculation(historyItem);
      
      // Supabaseにも保存（認証済みの場合）
      if (user) {
        const { error: supabaseError } = await supabase
          .from('scaffold_calculations')
          .insert({
            user_id: user.id,
            title: title || `計算結果 ${new Date().toLocaleDateString('ja-JP')}`,
            // 入力データの個別フィールド
            frame_width_ns: inputData.frameWidth.northSouth,
            frame_width_ew: inputData.frameWidth.eastWest,
            eaves_north: inputData.eaveOverhang.north,
            eaves_east: inputData.eaveOverhang.east,
            eaves_south: inputData.eaveOverhang.south,
            eaves_west: inputData.eaveOverhang.west,
            property_line_north: inputData.propertyLine.north,
            property_line_east: inputData.propertyLine.east,
            property_line_south: inputData.propertyLine.south,
            property_line_west: inputData.propertyLine.west,
            property_line_distance_north: inputData.propertyLineDistance?.north,
            property_line_distance_east: inputData.propertyLineDistance?.east,
            property_line_distance_south: inputData.propertyLineDistance?.south,
            property_line_distance_west: inputData.propertyLineDistance?.west,
            reference_height: inputData.referenceHeight,
            roof_shape: inputData.roofShape,
            has_tie_columns: inputData.hasTieColumns,
            eaves_handrails: inputData.eavesHandrails,
            special_material_ns_355: inputData.specialMaterial.northSouth.material355,
            special_material_ns_300: inputData.specialMaterial.northSouth.material300,
            special_material_ns_150: inputData.specialMaterial.northSouth.material150,
            special_material_ew_355: inputData.specialMaterial.eastWest.material355,
            special_material_ew_300: inputData.specialMaterial.eastWest.material300,
            special_material_ew_150: inputData.specialMaterial.eastWest.material150,
            target_offset: inputData.targetOffset,
            // 計算結果の個別フィールド
            ns_total_span: calculationResult.ns_total_span,
            ew_total_span: calculationResult.ew_total_span,
            ns_span_structure: calculationResult.ns_span_structure,
            ew_span_structure: calculationResult.ew_span_structure,
            north_gap: calculationResult.north_gap,
            south_gap: calculationResult.south_gap,
            east_gap: calculationResult.east_gap,
            west_gap: calculationResult.west_gap,
            num_stages: calculationResult.num_stages,
            modules_count: calculationResult.modules_count,
            jack_up_height: calculationResult.jack_up_height,
            first_layer_height: calculationResult.first_layer_height,
            tie_ok: calculationResult.tie_ok,
            tie_column_used: calculationResult.tie_column_used,
          });
          
        if (supabaseError) {
          console.error('Failed to save to Supabase:', supabaseError);
          Alert.alert('保存完了', 'ローカル履歴に保存しました（クラウド同期は失敗）');
        } else {
          Alert.alert('保存完了', '計算結果をローカル・クラウド両方に保存しました');
        }
      } else {
        Alert.alert('保存完了', 'ローカル履歴に保存しました');
      }
    } catch (error) {
      console.error('Failed to save calculation to history:', error);
      Alert.alert('保存エラー', '履歴の保存に失敗しました');
    }
  }, [calculationResult, inputData, user]);

  return (
    <ScaffoldContext.Provider
      value={{
        inputData,
        setInputValue,
        resetInputData,
        calculationResult,
        isLoading,
        error,
        calculateScaffold,
        testAPICall,
        saveCalculationToHistory,
      }}
    >
      {children}
    </ScaffoldContext.Provider>
  );
};

// カスタムフックで使いやすくする
export const useScaffold = () => {
  const context = useContext(ScaffoldContext);
  if (context === undefined) {
    throw new Error('useScaffold must be used within a ScaffoldProvider');
  }
  return context;
};