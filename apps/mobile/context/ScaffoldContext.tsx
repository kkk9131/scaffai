import React, { createContext, useState, useContext, useCallback } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Alert } from 'react-native';

// APIのベースURL
const API_URL = 'https://scaffai-app-production.up.railway.app';

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

  // テスト用の単純なAPI呼び出し
  const testAPICall = useCallback(async () => {
    console.log('testAPICall - Testing simple API call');
    try {
      // 単純なGETリクエスト
      const response = await axios.get(`${API_URL}/health`);
      console.log('Health check response:', response.data);
      Alert.alert('API接続成功', 'ヘルスチェックに成功しました');
      
      // 計算用のテストデータを設定
      setInputData(testInputData);
      Alert.alert('テストデータ設定完了', '計算用のテストデータを設定しました');
    } catch (error) {
      console.error('Test API call failed:', error);
      Alert.alert('API接続エラー', `API接続に失敗しました: ${error}`);
    }
  }, []);

  // APIを使用した計算
  const calculateScaffold = useCallback(async () => {
    console.log('calculateScaffold called');
    setIsLoading(true);
    setError(null);

    try {
      // 単純なAPIリクエストデータに変換
      const requestData = {
        width_NS: inputData.frameWidth.northSouth || 1000,
        width_EW: inputData.frameWidth.eastWest || 1000,
        eaves_N: inputData.eaveOverhang.north || 0,
        eaves_E: inputData.eaveOverhang.east || 0,
        eaves_S: inputData.eaveOverhang.south || 0,
        eaves_W: inputData.eaveOverhang.west || 0,
        boundary_N: inputData.propertyLine.north ? inputData.propertyLineDistance?.north : null,
        boundary_E: inputData.propertyLine.east ? inputData.propertyLineDistance?.east : null,
        boundary_S: inputData.propertyLine.south ? inputData.propertyLineDistance?.south : null,
        boundary_W: inputData.propertyLine.west ? inputData.propertyLineDistance?.west : null,
        standard_height: inputData.referenceHeight || 2400,
        roof_shape: inputData.roofShape,
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

      console.log('Sending request to API:', JSON.stringify(requestData, null, 2));
      console.log('API URL:', `${API_URL}/calculate`);

      // APIへのPOSTリクエスト
      try {
        const response = await axios.post(`${API_URL}/calculate`, requestData);
        console.log('API response:', response.data);
        
        // レスポンスデータの変換
        const result: CalculationResult = {
          ns_total_span: response.data.ns_total_span,
          ew_total_span: response.data.ew_total_span,
          ns_span_structure: response.data.ns_span_structure,
          ew_span_structure: response.data.ew_span_structure,
          north_gap: response.data.north_gap,
          east_gap: response.data.east_gap,
          south_gap: response.data.south_gap,
          west_gap: response.data.west_gap,
          num_stages: response.data.num_stages,
          modules_count: response.data.modules_count,
          jack_up_height: response.data.jack_up_height,
          first_layer_height: response.data.first_layer_height,
          tie_ok: response.data.tie_ok,
          tie_column_used: response.data.tie_column_used,
        };

        setCalculationResult(result);
        
        console.log('Setting calculation result:', result);
        console.log('Navigating to result screen...');
        
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

      } catch (axiosError) {
        // Axiosエラー詳細ログ
        console.error('Axios error details:', axiosError);
        if (axios.isAxiosError(axiosError) && axiosError.response) {
          console.error('Response status:', axiosError.response.status);
          console.error('Response data:', axiosError.response.data);
          
          if (axiosError.response.data && axiosError.response.data.detail) {
            if (Array.isArray(axiosError.response.data.detail)) {
              const message = axiosError.response.data.detail.map((d: any) => {
                const loc = d.loc && d.loc.length > 1 ? d.loc.slice(1).join('.') : '入力値';
                return `${loc}: ${d.msg}`;
              }).join('\n');
              setError(message);
              Alert.alert('APIエラー', message);
            } else {
              setError(axiosError.response.data.detail);
              Alert.alert('APIエラー', axiosError.response.data.detail);
            }
          } else {
            setError('サーバーで不明なエラーが発生しました。');
            Alert.alert('APIエラー', 'サーバーで不明なエラーが発生しました。');
          }
        } else {
          setError('API通信中にエラーが発生しました。ネットワーク接続を確認してください。');
          Alert.alert('通信エラー', 'API通信中にエラーが発生しました。ネットワーク接続を確認してください。');
        }
        throw axiosError; // エラーを再スロー
      }

    } catch (err) {
      console.error('Calculation failed:', err);
      if (!error) { // エラーメッセージがまだ設定されていない場合
        setError('計算処理中にエラーが発生しました。入力データやネットワーク接続を確認してください。');
        Alert.alert('エラー', '計算処理中にエラーが発生しました。');
      }
    } finally {
      setIsLoading(false);
    }
  }, [inputData, router, error]);

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