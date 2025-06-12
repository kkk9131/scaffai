import React, { createContext, useState, useContext, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { calculateAll } from '@scaffai/core';
import { type ScaffoldInputData, type ScaffoldCalculationResult } from '../lib/types';
import { HistoryStorage, CalculationStatsStorage } from '../utils/storage';
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
    target_margin_N: inputData.targetOffset?.north?.enabled ? (inputData.targetOffset.north.value ?? 900) : null,
    target_margin_E: inputData.targetOffset?.east?.enabled ? (inputData.targetOffset.east.value ?? 900) : null,
    target_margin_S: inputData.targetOffset?.south?.enabled ? (inputData.targetOffset.south.value ?? 900) : null,
    target_margin_W: inputData.targetOffset?.west?.enabled ? (inputData.targetOffset.west.value ?? 900) : null,
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
  targetOffset: {
    north: { enabled: boolean; value: number | null };
    east: { enabled: boolean; value: number | null };
    south: { enabled: boolean; value: number | null };
    west: { enabled: boolean; value: number | null };
  };
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
  targetOffset: {
    north: { enabled: false, value: null },
    east: { enabled: false, value: null },
    south: { enabled: false, value: null },
    west: { enabled: false, value: null },
  },
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
  targetOffset: {
    north: { enabled: true, value: 900 },
    east: { enabled: true, value: 900 },
    south: { enabled: true, value: 900 },
    west: { enabled: true, value: 900 },
  },
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
  setCalculationResult: (result: CalculationResult | null) => void;
  isFromHistory: boolean;
  setIsFromHistory: (value: boolean) => void;
  calculationResult: CalculationResult | null;
  isLoading: boolean;
  error: string | null;
  calculateScaffold: () => Promise<void>;
  testAPICall: () => Promise<void>; // テスト用のシンプルなAPI呼び出し
  saveToLocal: (title?: string) => Promise<void>; // ローカル保存専用
  saveToCloud: (title?: string) => Promise<void>; // クラウド保存専用
  saveCalculationToHistory: (title?: string) => Promise<void>; // 後方互換性のため追加
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
  const [isFromHistory, setIsFromHistory] = useState<boolean>(false);
  const router = useRouter();
  const { user } = useAuthContext();

  // 入力値の更新 (ネスト階層対応済)
  const setInputValue = useCallback((
    category: keyof InputData,
    field: string, // 例: 'northSouth' または 'northSouth.material355' または 'north.enabled'
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

        // カテゴリが存在しない場合は初期化
        if (!currentLevel && category === 'targetOffset') {
          newData[category] = {
            north: { enabled: false, value: null },
            east: { enabled: false, value: null },
            south: { enabled: false, value: null },
            west: { enabled: false, value: null },
          } as any;
          currentLevel = newData[category];
        }

        // targetOffsetの場合、ネストされた構造を特別処理
        if (category === 'targetOffset' && fieldParts.length === 2) {
          const direction = fieldParts[0];
          const property = fieldParts[1];
          
          if (!currentLevel[direction]) {
            currentLevel[direction] = { enabled: false, value: null };
          }
          
          if (property === 'value' && typeof value === 'string') {
            currentLevel[direction][property] = value === '' ? null : Number(value);
          } else {
            currentLevel[direction][property] = value;
          }
        } else {
          // 通常のネスト処理
          for (let i = 0; i < fieldParts.length - 1; i++) {
            if (!currentLevel[fieldParts[i]]) {
              currentLevel[fieldParts[i]] = {};
            }
            currentLevel = currentLevel[fieldParts[i]];
          }
          currentLevel[fieldParts[fieldParts.length - 1]] = value;
        }
      }
      
      console.log('Updated inputData:', JSON.stringify(newData, null, 2));
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

  // 計算結果の設定
  const setCalculationResultValue = useCallback((result: CalculationResult | null) => {
    setCalculationResult(result);
    setIsFromHistory(!!result); // 結果が設定された場合は履歴から来たことを示す
  }, []);

  // 履歴フラグの設定
  const setIsFromHistoryValue = useCallback((value: boolean) => {
    setIsFromHistory(value);
  }, []);

  // テスト用のローカル計算テスト
  const testAPICall = useCallback(async () => {
    console.log('testAPICall - Testing local calculation engine');
    try {
      // まず計算エンジンが正常にインポートされているかテスト
      const testInput = convertToScaffoldInputData(testInputData);
      console.log('Test input for calculation engine:', testInput);
      
      const testResult = calculateAll(testInput);
      console.log('Test calculation result:', testResult);
      
      // 計算用のテストデータを設定
      setInputData(testInputData);
      Alert.alert('テストデータ設定完了', '計算用のテストデータを設定しました。ローカル計算エンジンが正常に動作しています。');
    } catch (error) {
      console.error('Test local calculation failed:', error);
      Alert.alert('テストエラー', `計算エンジンのテストに失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  // ローカル計算エンジンを使用した計算
  const calculateScaffold = useCallback(async () => {
    console.log('calculateScaffold called - using local calculation engine');
    console.log('Current input data:', JSON.stringify(inputData, null, 2));
    
    setIsLoading(true);
    setError(null);

    try {
      // 計算エンジンが利用可能かチェック
      if (typeof calculateAll !== 'function') {
        throw new Error('計算エンジンが正しくインポートされていません');
      }

      // フロントエンド型からcore型への変換
      const scaffoldInputData = convertToScaffoldInputData(inputData);
      
      console.log('Local calculation input data:', JSON.stringify(scaffoldInputData, null, 2));

      // ローカル計算エンジンで計算実行
      const scaffoldResult = calculateAll(scaffoldInputData);
      
      if (!scaffoldResult) {
        throw new Error('計算結果が取得できませんでした');
      }
      
      console.log('Local calculation result:', scaffoldResult);
      
      // core型からフロントエンド型への変換
      const result = convertFromScaffoldResult(scaffoldResult);

      if (!result) {
        throw new Error('計算結果の変換に失敗しました');
      }

      setCalculationResult(result);
      
      console.log('Setting calculation result:', result);
      
      // 計算統計をインクリメント（計算実行回数をカウント）
      try {
        await CalculationStatsStorage.incrementCalculation();
        console.log('✅ Calculation stats incremented');
      } catch (statsError) {
        console.warn('Failed to update calculation stats:', statsError);
      }
      
      // ローディング状態を先に解除
      setIsLoading(false);
      
      console.log('Navigating to result screen...');
      
      // 結果画面へ即座に遷移
      router.push('/(drawer)/result');
      console.log('Navigation initiated');
      
      // 自動保存は無効化 - ユーザーが手動で保存する必要がある
      console.log('ℹ️ Auto-save disabled - user must manually save');
      
      // 計算実行時は履歴からではないことを明示
      setIsFromHistory(false);

    } catch (err) {
      console.error('Local calculation failed:', err);
      const errorMessage = err instanceof Error ? err.message : '計算処理中にエラーが発生しました。入力データを確認してください。';
      setError(errorMessage);
      setIsLoading(false);
      Alert.alert('計算エラー', `${errorMessage}\n\nデバッグ情報: ${err instanceof Error ? err.stack : String(err)}`);
    }
  }, [inputData, router]);

  // バックグラウンドで履歴保存を行う関数（ナビゲーションをブロックしない）
  const saveToHistoryInBackground = useCallback(async (inputData: InputData, result: CalculationResult) => {
    console.log('💾 saveToHistoryInBackground called');
    try {
      const historyItem: CalculationHistory = {
        id: HistoryStorage.generateId(),
        createdAt: new Date().toISOString(),
        inputData: inputData,
        result: result,
      };
      
      console.log('📦 Created history item:', historyItem.id);
      console.log('📊 Input data keys:', Object.keys(historyItem.inputData));
      console.log('📈 Result data keys:', Object.keys(historyItem.result));
      
      // ローカルストレージに保存
      console.log('💾 Attempting to save to local storage...');
      await HistoryStorage.saveCalculation(historyItem);
      console.log('✅ Calculation automatically saved to local history');
      
      // Supabaseにも保存（認証済みで、プロフィールが存在する場合）
      if (user) {
        try {
          // プロフィールが存在することを確認
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // プロフィールが存在しない場合はローカル保存のみ
            console.log('Profile not found for user:', user.id, 'Skipping Supabase save');
            return;
          } else if (profileError) {
            console.error('Error checking profile:', profileError);
            console.log('Profile check failed, skipping Supabase save');
            return;
          }

          // プロフィールが存在する場合のみSupabaseに保存
          const { error: supabaseError } = await supabase
            .from('scaffold_calculations')
            .insert({
              user_id: user.id,
              title: `計算結果 ${new Date().toLocaleDateString('ja-JP')}`,
              // 入力データをJSONとして保存
              input_data: JSON.stringify(inputData),
              // 計算結果をJSONとして保存
              result_data: JSON.stringify(result),
            } as any);
            
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
  }, [user]);

  // ローカル保存専用関数
  const saveToLocal = useCallback(async (title?: string) => {
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

      console.log('💾 Saving to local storage only...');
      await HistoryStorage.saveCalculation(historyItem);
    } catch (error) {
      console.error('Failed to save to local:', error);
      throw error; // エラーを上位に投げる
    }
  }, [calculationResult, inputData]);

  // クラウド保存専用関数
  const saveToCloud = useCallback(async (title?: string) => {
    if (!calculationResult) {
      Alert.alert('エラー', '保存する計算結果がありません');
      return;
    }

    if (!user) {
      Alert.alert('エラー', 'クラウド保存にはログインが必要です');
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

      console.log('☁️ Saving to cloud only...');
      
      // プロフィールが存在することを確認
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        Alert.alert('エラー', 'ユーザープロフィールが見つかりません');
        return;
      } else if (profileError) {
        console.error('Error checking profile:', profileError);
        Alert.alert('エラー', 'プロフィール確認に失敗しました');
        return;
      }

      const { error: supabaseError } = await supabase
        .from('scaffold_calculations')
        .insert({
          user_id: user.id,
          title: title || `計算結果 ${new Date().toLocaleDateString('ja-JP')}`,
          // 入力データをJSONとして保存
          input_data: JSON.stringify(inputData),
          // 計算結果をJSONとして保存
          result_data: JSON.stringify(calculationResult),
        } as any);

      if (supabaseError) {
        console.error('Failed to save to Supabase:', supabaseError);
        throw new Error(`クラウド保存に失敗しました: ${supabaseError.message}`);
      } else {
        console.log('✅ Successfully saved to cloud');
      }
    } catch (error) {
      console.error('Cloud save error:', error);
      throw error; // エラーを上位に投げる
    }
  }, [calculationResult, inputData, user]);

  // 計算結果を履歴に保存（後方互換性のため残す）
  const saveCalculationToHistory = useCallback(async (title?: string) => {
    if (!calculationResult) {
      Alert.alert('エラー', '保存する計算結果がありません');
      return;
    }

    console.log('💾 Manual save requested - user:', !!user);

    try {
      const historyItem: CalculationHistory = {
        id: HistoryStorage.generateId(),
        createdAt: new Date().toISOString(),
        inputData: inputData,
        result: calculationResult,
        title: title,
      };

      if (user) {
        // ログイン済みの場合はクラウドのみに保存
        console.log('☁️ User logged in - saving to cloud only...');
      } else {
        // 未ログインの場合はローカルのみに保存
        console.log('💾 User not logged in - saving to local storage...');
        await HistoryStorage.saveCalculation(historyItem);
      }
      
      // Supabaseに保存（認証済みで、プロフィールが存在する場合）
      if (user) {
        try {
          // プロフィールが存在することを確認
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // プロフィールが存在しない場合はローカル保存のみ
            console.log('Profile not found for user:', user.id, 'Skipping Supabase save');
            Alert.alert('保存完了', 'ローカル履歴に保存しました');
            return;
          } else if (profileError) {
            console.error('Error checking profile:', profileError);
            console.log('Profile check failed, skipping Supabase save');
            Alert.alert('保存完了', 'ローカル履歴に保存しました');
            return;
          }

          const { error: supabaseError } = await supabase
            .from('scaffold_calculations')
            .insert({
              user_id: user.id as string,
              title: title || `計算結果 ${new Date().toLocaleDateString('ja-JP')}`,
              // 入力データをJSONとして保存
              input_data: JSON.stringify(inputData),
              // 計算結果をJSONとして保存
              result_data: JSON.stringify(calculationResult),
            } as any);
            
          if (supabaseError) {
            console.error('Failed to save to Supabase:', supabaseError);
            // クラウド保存に失敗した場合はローカルに保存
            console.log('💾 Cloud save failed, falling back to local storage...');
            await HistoryStorage.saveCalculation(historyItem);
            Alert.alert('保存完了', 'クラウド保存に失敗したため、ローカルに保存しました');
          } else {
            console.log('✅ Successfully saved to cloud only');
            Alert.alert('✅ クラウド保存完了', '計算結果をクラウドに保存しました');
          }
        } catch (error) {
          console.error('Supabase save error:', error);
          // クラウド保存エラー時はローカルに保存
          console.log('💾 Cloud save error, falling back to local storage...');
          await HistoryStorage.saveCalculation(historyItem);
          Alert.alert('保存完了', 'クラウド保存でエラーが発生したため、ローカルに保存しました');
        }
      } else {
        Alert.alert('保存完了', 'ローカルに保存しました');
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
        setCalculationResult: setCalculationResultValue,
        isFromHistory,
        setIsFromHistory: setIsFromHistoryValue,
        calculationResult,
        isLoading,
        error,
        calculateScaffold,
        testAPICall,
        saveToLocal,
        saveToCloud,
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