'use client';

import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';
import { InputField } from '../../components/InputField';
import { RadioField } from '../../components/RadioField';
import { colors as baseColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useScaffold } from '../../context/ScaffoldContext';
import { Ionicons } from '@expo/vector-icons';
import { calculateQuickAllocation, type QuickAllocationInput, type QuickAllocationResult } from '../../utils/quickAllocationCalculator';

type CornerType = 'inside' | 'outside';
type SpecialMaterialUsage = {
  material355: boolean;
  material300: boolean;
  material150: boolean;
};

export default function QuickAllocation() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { calculationResult: inputCalculationResult, inputData } = useScaffold();
  const scrollViewRef = useRef<ScrollView>(null);
  const resultSectionRef = useRef<View>(null);
  
  // 入力値の状態管理
  const [cornerType, setCornerType] = useState<CornerType>('inside');
  const [currentDistance, setCurrentDistance] = useState<string>('');
  const [allocationDistance, setAllocationDistance] = useState<string>('');
  const [eaveOutput, setEaveOutput] = useState<string>('');
  const [boundaryLine, setBoundaryLine] = useState<string>('');
  const [specialMaterials, setSpecialMaterials] = useState<SpecialMaterialUsage>({
    material355: false,
    material300: false,
    material150: false,
  });
  const [targetDistance, setTargetDistance] = useState<string>('');

  // 結果の状態管理
  const [result, setResult] = useState<QuickAllocationResult | null>(null);
  
  // セクションの展開状態
  const [isSpecialMaterialsExpanded, setIsSpecialMaterialsExpanded] = useState(false);
  const [isTargetDistanceExpanded, setIsTargetDistanceExpanded] = useState(false);
  
  // 電卓モードの状態管理
  const [isCalculatorMode, setIsCalculatorMode] = useState(false);
  const [calculatorType, setCalculatorType] = useState<'plan' | 'elevation'>('plan'); // 平面/立面切り替え
  
  // 電卓の計算状態
  const [totalSpan, setTotalSpan] = useState<number>(0);
  const [currentSpan, setCurrentSpan] = useState<number>(0);
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  const [calculationMode, setCalculationMode] = useState<'none' | 'add' | 'subtract'>('none');
  
  // 立面モード用の状態
  const [maxBeamHeight, setMaxBeamHeight] = useState<string>('');
  const [jackUpHeight, setJackUpHeight] = useState<string>('');
  const [isMaxBeamHeightSet, setIsMaxBeamHeightSet] = useState<boolean>(false);
  const [calculationMethod, setCalculationMethod] = useState<'maxBeam' | 'jackUp'>('maxBeam');

  // 動的スタイル
  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.background.primary,
    },
    section: {
      backgroundColor: colors.background.card,
    },
    sectionTitle: {
      color: colors.text.primary,
    },
    calculateButton: {
      backgroundColor: baseColors.primary.main,
    },
    calculateButtonText: {
      color: '#FFFFFF',
    },
    resultSection: {
      backgroundColor: colors.background.card,
    },
    resultTitle: {
      color: colors.text.primary,
    },
    resultCard: {
      backgroundColor: colors.background.paper,
    },
    resultLabel: {
      color: colors.text.secondary,
    },
    resultValue: {
      color: colors.text.primary,
    },
  });

  const handleCalculate = () => {
    console.log('=== 計算開始 ===');
    
    // バリデーション
    if (!currentDistance || !allocationDistance || !eaveOutput) {
      console.log('バリデーションエラー: 必須項目未入力');
      Alert.alert('エラー', '現在の離れ、割付距離、軒の出を入力してください');
      return;
    }

    // 数値変換とバリデーション
    const currentDistanceNum = parseFloat(currentDistance);
    const allocationDistanceNum = parseFloat(allocationDistance);
    const eaveOutputNum = parseFloat(eaveOutput);
    const boundaryLineNum = boundaryLine ? parseFloat(boundaryLine) : undefined;
    const targetDistanceNum = targetDistance ? parseFloat(targetDistance) : undefined;

    console.log('入力値:', {
      currentDistanceNum,
      allocationDistanceNum,
      eaveOutputNum,
      boundaryLineNum,
      targetDistanceNum,
      cornerType,
      specialMaterials
    });

    if (isNaN(currentDistanceNum) || isNaN(allocationDistanceNum) || isNaN(eaveOutputNum)) {
      console.log('数値変換エラー');
      Alert.alert('エラー', '数値が正しく入力されていません');
      return;
    }

    // 境界線の数値バリデーション（入力されている場合のみ）
    if (boundaryLine && (isNaN(boundaryLineNum!) || boundaryLineNum! < 0)) {
      console.log('境界線数値変換エラー');
      Alert.alert('エラー', '境界線が正しく入力されていません');
      return;
    }

    // 目標離れの数値バリデーション
    if (targetDistance && (isNaN(targetDistanceNum!) || targetDistanceNum! < 0)) {
      console.log('目標離れ数値変換エラー');
      Alert.alert('エラー', '目標離れが正しく入力されていません');
      return;
    }

    // 計算実行
    const input: QuickAllocationInput = {
      currentDistance: currentDistanceNum,
      allocationDistance: allocationDistanceNum,
      eaveOutput: eaveOutputNum,
      boundaryLine: boundaryLineNum || 0, // 境界線がない場合は0を設定（計算側で処理）
      cornerType,
      specialMaterials,
      ...(targetDistanceNum && { targetDistance: targetDistanceNum })
    };

    console.log('計算実行中...');
    const calculationResult = calculateQuickAllocation(input);
    console.log('計算結果:', calculationResult);
    
    if (!calculationResult.success) {
      console.log('計算失敗:', calculationResult.errorMessage);
      Alert.alert('計算エラー', calculationResult.errorMessage || '計算に失敗しました');
      setResult(null);
      return;
    }

    console.log('計算成功、結果を設定');
    setResult(calculationResult);
    
    // 結果セクションまで自動スクロール
    setTimeout(() => {
      resultSectionRef.current?.measureLayout(
        scrollViewRef.current?.getInnerViewNode(),
        (x, y) => {
          scrollViewRef.current?.scrollTo({
            y: y - 20, // 少し余裕を持たせる
            animated: true
          });
        },
        () => {} // エラーハンドリング
      );
    }, 100); // 結果が描画されるまで少し待つ
  };

  const toggleSpecialMaterial = (material: keyof SpecialMaterialUsage) => {
    setSpecialMaterials(prev => ({
      ...prev,
      [material]: !prev[material]
    }));
  };

  // 電卓モード切り替え関数
  const toggleCalculatorMode = () => {
    setIsCalculatorMode(!isCalculatorMode);
  };

  // 電卓の計算関数（加算・減算モード対応）
  const handleMaterialPress = (value: number) => {
    // 計算モードに応じた処理
    if (calculationMode === 'add') {
      // 加算モード
      const currentValue = parseFloat(displayValue) || 0;
      const newValue = currentValue + value;
      setDisplayValue(String(newValue));
      setCurrentSpan(newValue);
      
      // 履歴に記録
      setHistory(prev => [...prev, `${currentValue} + ${value} = ${newValue}mm`]);
      
    } else if (calculationMode === 'subtract') {
      // 減算モード
      const currentValue = parseFloat(displayValue) || 0;
      const newValue = currentValue - value;
      setDisplayValue(String(newValue));
      setCurrentSpan(newValue);
      
      // 履歴に記録
      setHistory(prev => [...prev, `${currentValue} - ${value} = ${newValue}mm`]);
      
    } else {
      // 通常モード
      setDisplayValue(String(value));
      setCurrentSpan(value);
    }
  };

  const handleOperationPress = (nextOperation: string) => {
    const inputValue = parseFloat(displayValue);

    if (operation && !waitingForOperand) {
      const newValue = calculate(currentSpan, inputValue, operation);
      setCurrentSpan(newValue);
      setDisplayValue(String(newValue));
    } else {
      setCurrentSpan(inputValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const handleEqualsPress = () => {
    if (operation && !waitingForOperand) {
      const inputValue = parseFloat(displayValue);
      const newValue = calculate(currentSpan, inputValue, operation);
      setCurrentSpan(newValue);
      setDisplayValue(String(newValue));
      setOperation(null);
      setWaitingForOperand(true);
      
      // 履歴に追加
      setHistory(prev => [...prev, `${currentSpan} ${operation} ${inputValue} = ${newValue}`]);
    }
  };

  const calculate = (firstOperand: number, secondOperand: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstOperand + secondOperand;
      case '-':
        return firstOperand - secondOperand;
      case '×':
        return firstOperand * secondOperand;
      case '÷':
        return firstOperand / secondOperand;
      default:
        return secondOperand;
    }
  };

  // 加算モード設定
  const handleAddMode = () => {
    setCalculationMode('add');
  };

  // 減算モード設定
  const handleSubtractMode = () => {
    setCalculationMode('subtract');
  };

  const handleClear = () => {
    setDisplayValue('0');
    setCurrentSpan(0);
    setOperation(null);
    setWaitingForOperand(false);
    setCalculationMode('none');
    if (calculatorType === 'elevation') {
      setMaxBeamHeight('');
      setJackUpHeight('');
      setIsMaxBeamHeightSet(false);
    }
  };

  // input画面の計算結果からスパン情報を取得する関数
  const getSpanFromResult = (direction: 'northSouth' | 'eastWest') => {
    if (!inputCalculationResult) {
      Alert.alert('エラー', '計算結果がありません。先にinput画面で足場計算を実行してください。');
      return;
    }

    // input画面の計算結果から南北・東西のスパン情報を取得
    let totalSpanValue: number;
    let spanStructure: string;
    
    if (direction === 'northSouth') {
      totalSpanValue = inputCalculationResult.ns_total_span;
      spanStructure = inputCalculationResult.ns_span_structure;
    } else {
      totalSpanValue = inputCalculationResult.ew_total_span;
      spanStructure = inputCalculationResult.ew_span_structure;
    }
    
    setTotalSpan(totalSpanValue);
    setDisplayValue(String(totalSpanValue));
    setCurrentSpan(totalSpanValue);
    
    const directionText = direction === 'northSouth' ? '南北' : '東西';
    Alert.alert(
      `${directionText}総スパン設定`, 
      `${directionText}総スパン: ${totalSpanValue}mm\n構成: ${spanStructure}`
    );
    
    // 履歴に記録
    setHistory(prev => [...prev, `${directionText}総スパン設定: ${totalSpanValue}mm (${spanStructure})`]);
  };

  const handleNorthSouthSpan = () => {
    getSpanFromResult('northSouth');
  };

  const handleEastWestSpan = () => {
    getSpanFromResult('eastWest');
  };

  const getRemainingSpan = () => {
    if (calculatorType === 'elevation' && calculationMethod === 'jackUp' && isMaxBeamHeightSet) {
      // ジャッキアップモードでは基準高さまでの残り距離を表示
      return totalSpan - currentSpan;
    }
    return totalSpan - currentSpan;
  };

  // 平面/立面モード切り替え
  const toggleCalculatorType = () => {
    setCalculatorType(prev => prev === 'plan' ? 'elevation' : 'plan');
    handleClear(); // モード切り替え時はクリア
  };

  // 基準高さ取得（立面モード用）
  const getReferenceHeight = () => {
    if (!inputCalculationResult) {
      Alert.alert('エラー', '計算結果がありません。先にinput画面で足場計算を実行してください。');
      return;
    }

    // input画面の基準高さを取得（仮にreferenceHeightフィールドがあると仮定）
    // 実際のデータ構造に合わせて調整が必要
    const referenceHeight = inputData.referenceHeight || 2400; // デフォルト値
    
    setDisplayValue(String(referenceHeight));
    setCurrentSpan(referenceHeight);
    
    Alert.alert(
      '基準高さ設定', 
      `基準高さ: ${referenceHeight}mm`
    );
    
    // 履歴に記録
    setHistory(prev => [...prev, `基準高さ設定: ${referenceHeight}mm`]);
  };

  // 高さ計算を実行（最高アンチ高またはジャッキアップ）
  const setHeightForCalculation = () => {
    const referenceHeight = inputData.referenceHeight || 2400;
    let calculationResult = 0;
    let calculationDescription = '';
    
    if (calculationMethod === 'maxBeam') {
      const heightValue = parseFloat(maxBeamHeight);
      if (isNaN(heightValue) || heightValue <= 0) {
        Alert.alert('エラー', '有効な最高アンチ高を入力してください');
        return;
      }
      
      // 基準高さから最高アンチ高を引く計算
      calculationResult = referenceHeight - heightValue;
      
      if (calculationResult < 0) {
        Alert.alert('エラー', `最高アンチ高(${heightValue}mm)が基準高さ(${referenceHeight}mm)を超えています`);
        return;
      }
      
      calculationDescription = `基準高さ: ${referenceHeight}mm\n最高アンチ高: ${heightValue}mm\n計算結果: ${calculationResult}mm`;
      setHistory(prev => [...prev, `${referenceHeight}mm - ${heightValue}mm = ${calculationResult}mm (最高アンチ高)`]);
      
    } else {
      const jackUpValue = parseFloat(jackUpHeight);
      if (isNaN(jackUpValue) || jackUpValue < 0) {
        Alert.alert('エラー', '有効なジャッキアップ高さを入力してください');
        return;
      }
      
      // ジャッキアップモードでは、ジャッキアップの値を起点として設定
      calculationResult = jackUpValue;
      setTotalSpan(referenceHeight); // 基準高さを目標値として設定
      
      calculationDescription = `ジャッキアップ起点: ${jackUpValue}mm\n基準高さ目標: ${referenceHeight}mm\n基準高さまであと: ${referenceHeight - jackUpValue}mm`;
      setHistory(prev => [...prev, `ジャッキアップ${jackUpValue}mm設定、基準高さ${referenceHeight}mmまであと${referenceHeight - jackUpValue}mm`]);
    }
    
    // 計算結果を電卓の表示値として設定
    setDisplayValue(String(calculationResult));
    setCurrentSpan(calculationResult);
    
    if (calculationMethod === 'maxBeam') {
      setTotalSpan(0); // 最高アンチ高モードでは総スパンの概念をリセット
    }
    
    setIsMaxBeamHeightSet(true);
    
    Alert.alert(
      '高さ計算完了', 
      `${calculationDescription}\n\nこの値から立面計算を開始できます`
    );
  };


  // 電卓モードのボタンスタイル
  const calculatorStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    modeToggleButton: {
      padding: 12,
      borderRadius: 8,
      backgroundColor: baseColors.primary.main,
    },
    display: {
      backgroundColor: colors.background.card,
      margin: 16,
      padding: 20,
      borderRadius: 12,
      minHeight: 120,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    displayValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text.primary,
      textAlign: 'right',
      marginBottom: 8,
    },
    spanInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    spanText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    buttonGrid: {
      padding: 16,
    },
    buttonRow: {
      flexDirection: 'row',
      marginBottom: 12,
      gap: 8,
    },
    materialButton: {
      flex: 1,
      paddingVertical: 16,
      paddingHorizontal: 8,
      backgroundColor: colors.background.card,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.input.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    operatorButton: {
      flex: 1,
      paddingVertical: 16,
      backgroundColor: baseColors.primary.main,
      borderRadius: 8,
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    operatorButtonActive: {
      backgroundColor: baseColors.primary.dark || '#1976D2',
    },
    specialButton: {
      flex: 1,
      paddingVertical: 16,
      backgroundColor: colors.background.paper,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: baseColors.primary.main,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    clearButton: {
      flex: 1,
      paddingVertical: 16,
      backgroundColor: colors.background.paper,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E57373',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    buttonText: {
      color: colors.text.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    operatorText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
    specialButtonText: {
      color: baseColors.primary.main,
      fontSize: 13,
      fontWeight: '600',
    },
    clearButtonText: {
      color: '#E57373',
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <AppHeader 
        title="簡易割付" 
        showBackButton 
        onBackPress={() => router.back()} 
        rightAction={
          <TouchableOpacity
            style={calculatorStyles.modeToggleButton}
            onPress={toggleCalculatorMode}
          >
            <Ionicons 
              name={isCalculatorMode ? "calculator-outline" : "calculator"} 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        }
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {!isCalculatorMode ? (
          /* 通常モード */
          <ScrollView 
            ref={scrollViewRef}
            style={styles.content} 
            showsVerticalScrollIndicator={false}
          >
        ) : null}
        {/* 入隅・出隅選択 */}
        <View style={[styles.section, dynamicStyles.section]}>
          <RadioField
            label="角部の種類"
            options={[
              { label: '入隅（下屋など含む）', value: 'inside' },
              { label: '出隅', value: 'outside' }
            ]}
            selectedValue={cornerType}
            onValueChange={(value) => setCornerType(value as CornerType)}
          />
        </View>

        {/* 現在の離れ */}
        <View style={[styles.section, dynamicStyles.section]}>
          <InputField
            label="現在の離れ"
            value={currentDistance}
            onChangeText={setCurrentDistance}
            placeholder="500"
            keyboardType="numeric"
            suffix="mm"
          />
        </View>

        {/* 割付距離 */}
        <View style={[styles.section, dynamicStyles.section]}>
          <InputField
            label="割付距離"
            value={allocationDistance}
            onChangeText={setAllocationDistance}
            placeholder="4500"
            keyboardType="numeric"
            suffix="mm"
          />
        </View>

        {/* 割付先の軒の出 */}
        <View style={[styles.section, dynamicStyles.section]}>
          <InputField
            label="割付先の軒の出"
            value={eaveOutput}
            onChangeText={setEaveOutput}
            placeholder="600"
            keyboardType="numeric"
            suffix="mm"
          />
        </View>

        {/* 割付先の境界線 */}
        <View style={[styles.section, dynamicStyles.section]}>
          <InputField
            label="割付先の境界線"
            value={boundaryLine}
            onChangeText={setBoundaryLine}
            placeholder="100"
            keyboardType="numeric"
            suffix="mm"
          />
        </View>

        {/* 特殊部材の使用 */}
        <View style={[styles.section, dynamicStyles.section]}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => setIsSpecialMaterialsExpanded(!isSpecialMaterialsExpanded)}
          >
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>特殊部材の使用</Text>
            <Ionicons 
              name={isSpecialMaterialsExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={colors.text.primary} 
            />
          </TouchableOpacity>
          
          {isSpecialMaterialsExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.checkboxGroup}>
            {[
              { key: 'material355' as const, label: '355mm部材' },
              { key: 'material300' as const, label: '300mm部材' },
              { key: 'material150' as const, label: '150mm部材' }
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.checkboxOption, { backgroundColor: colors.background.paper }]}
                onPress={() => toggleSpecialMaterial(item.key)}
              >
                <View style={[
                  styles.checkbox, 
                  { borderColor: colors.input.border },
                  specialMaterials[item.key] && { backgroundColor: baseColors.primary.main, borderColor: baseColors.primary.main }
                ]}>
                  {specialMaterials[item.key] && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={[styles.checkboxText, { color: colors.text.primary }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
              </View>
            </View>
          )}
        </View>

        {/* 目標離れ */}
        <View style={[styles.section, dynamicStyles.section]}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => setIsTargetDistanceExpanded(!isTargetDistanceExpanded)}
          >
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>目標離れ</Text>
            <Ionicons 
              name={isTargetDistanceExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={colors.text.primary} 
            />
          </TouchableOpacity>
          
          {isTargetDistanceExpanded && (
            <View style={styles.expandedContent}>
              <InputField
                label="目標離れ"
                value={targetDistance}
                onChangeText={setTargetDistance}
                placeholder="900"
                keyboardType="numeric"
                suffix="mm"
              />
            </View>
          )}
        </View>

        {/* 計算ボタン */}
        <TouchableOpacity style={[styles.calculateButton, dynamicStyles.calculateButton]} onPress={handleCalculate}>
          <Ionicons name="calculator" size={20} color="#fff" />
          <Text style={[styles.calculateButtonText, dynamicStyles.calculateButtonText]}>計算実行</Text>
        </TouchableOpacity>

        {/* 結果表示 */}
        {result && (
          <View 
            ref={resultSectionRef}
            style={[styles.resultSection, dynamicStyles.resultSection]}
          >
            <Text style={[styles.resultTitle, dynamicStyles.resultTitle]}>計算結果</Text>
            
            <View style={[styles.resultCard, dynamicStyles.resultCard]}>
              <Text style={[styles.resultLabel, dynamicStyles.resultLabel]}>割付先の離れ</Text>
              <Text style={[styles.resultValue, dynamicStyles.resultValue]}>
                {result.resultDistance}mm
                {result.correctionAmount && ` (+${result.correctionAmount}mm)`}
              </Text>
            </View>

            <View style={[styles.resultCard, dynamicStyles.resultCard]}>
              <Text style={[styles.resultLabel, dynamicStyles.resultLabel]}>割付スパン構成</Text>
              <Text style={[styles.resultValue, dynamicStyles.resultValue]}>{result.spanComposition}</Text>
            </View>

            {result.needsCorrection && result.correctionMessage && (
              <View style={[styles.resultCard, dynamicStyles.resultCard, { backgroundColor: baseColors.warning + '20' }]}>
                <Text style={[styles.resultLabel, { color: baseColors.warning }]}>補正が必要</Text>
                <Text style={[styles.resultValue, { color: baseColors.warning }]}>{result.correctionMessage}</Text>
              </View>
            )}

          </View>
        )}

            <View style={styles.bottomSpacer} />
          </ScrollView>
        ) : (
          /* 電卓モード */
          <View style={calculatorStyles.container}>
            {/* 電卓ディスプレイ */}
            <View style={calculatorStyles.display}>
              <Text style={calculatorStyles.displayValue}>{displayValue}</Text>
              <View style={calculatorStyles.spanInfo}>
                {calculatorType === 'plan' ? (
                  <>
                    <Text style={calculatorStyles.spanText}>
                      総スパン: {totalSpan}mm
                    </Text>
                    <Text style={calculatorStyles.spanText}>
                      現在: {currentSpan}mm
                    </Text>
                    <Text style={calculatorStyles.spanText}>
                      残り: {getRemainingSpan()}mm
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={calculatorStyles.spanText}>
                      基準高さ: {inputData.referenceHeight || 2400}mm
                    </Text>
                    <Text style={calculatorStyles.spanText}>
                      {calculationMethod === 'maxBeam' ? '最高アンチ高' : 'ジャッキアップ'}: 
                      {(calculationMethod === 'maxBeam' ? maxBeamHeight : jackUpHeight) || '未入力'}mm 
                      {isMaxBeamHeightSet ? '(計算済み)' : ''}
                    </Text>
                    <Text style={calculatorStyles.spanText}>
                      現在値: {currentSpan}mm
                    </Text>
                    {isMaxBeamHeightSet && calculationMethod === 'jackUp' && (
                      <Text style={calculatorStyles.spanText}>
                        基準高さまであと: {getRemainingSpan()}mm
                      </Text>
                    )}
                    {isMaxBeamHeightSet && calculationMethod === 'maxBeam' && (
                      <Text style={calculatorStyles.spanText}>
                        ※基準高さ - 最高アンチ高の計算結果を表示中
                      </Text>
                    )}
                  </>
                )}
              </View>
            </View>

            <ScrollView style={calculatorStyles.buttonGrid}>
              {/* 平面/立面切り替えボタン */}
              <View style={calculatorStyles.buttonRow}>
                <TouchableOpacity 
                  style={[
                    calculatorStyles.specialButton,
                    calculatorType === 'plan' && calculatorStyles.operatorButtonActive
                  ]}
                  onPress={toggleCalculatorType}
                >
                  <Text style={[
                    calculatorStyles.specialButtonText,
                    calculatorType === 'plan' && { color: '#FFFFFF' }
                  ]}>平面モード</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    calculatorStyles.specialButton,
                    calculatorType === 'elevation' && calculatorStyles.operatorButtonActive
                  ]}
                  onPress={toggleCalculatorType}
                >
                  <Text style={[
                    calculatorStyles.specialButtonText,
                    calculatorType === 'elevation' && { color: '#FFFFFF' }
                  ]}>立面モード</Text>
                </TouchableOpacity>
              </View>

              {/* 高さ計算入力フォーム（立面モードのみ） */}
              {calculatorType === 'elevation' && (
                <View style={[calculatorStyles.display, { marginBottom: 16 }]}>
                  {/* 計算方法選択ボタン */}
                  <View style={calculatorStyles.buttonRow}>
                    <TouchableOpacity 
                      style={[
                        calculatorStyles.specialButton,
                        calculationMethod === 'maxBeam' && calculatorStyles.operatorButtonActive
                      ]}
                      onPress={() => setCalculationMethod('maxBeam')}
                    >
                      <Text style={[
                        calculatorStyles.specialButtonText,
                        calculationMethod === 'maxBeam' && { color: '#FFFFFF' }
                      ]}>最高アンチ高</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        calculatorStyles.specialButton,
                        calculationMethod === 'jackUp' && calculatorStyles.operatorButtonActive
                      ]}
                      onPress={() => setCalculationMethod('jackUp')}
                    >
                      <Text style={[
                        calculatorStyles.specialButtonText,
                        calculationMethod === 'jackUp' && { color: '#FFFFFF' }
                      ]}>ジャッキアップ</Text>
                    </TouchableOpacity>
                  </View>

                  {/* 入力フォーム */}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[calculatorStyles.spanText, { marginBottom: 4 }]}>
                        {calculationMethod === 'maxBeam' ? '最高アンチ高 (mm)' : 'ジャッキアップ (mm)'}
                      </Text>
                      <View style={styles.section}>
                        <InputField
                          label=""
                          value={calculationMethod === 'maxBeam' ? maxBeamHeight : jackUpHeight}
                          onChangeText={calculationMethod === 'maxBeam' ? setMaxBeamHeight : setJackUpHeight}
                          placeholder={calculationMethod === 'maxBeam' ? "1800" : "200"}
                          keyboardType="numeric"
                          suffix="mm"
                        />
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={[calculatorStyles.specialButton, { alignSelf: 'flex-end', paddingHorizontal: 16 }]}
                      onPress={setHeightForCalculation}
                    >
                      <Text style={calculatorStyles.specialButtonText}>設定</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={[calculatorStyles.spanText, { fontSize: 12, marginTop: 4, fontStyle: 'italic' }]}>
                    {calculationMethod === 'maxBeam' 
                      ? '※基準高さ - 最高アンチ高を計算' 
                      : '※基準高さ + ジャッキアップを計算'}
                  </Text>
                </View>
              )}

              {/* 現在のモード表示 */}
              <View style={[calculatorStyles.display, { marginBottom: 16, minHeight: 60 }]}>
                <Text style={[calculatorStyles.spanText, { textAlign: 'center', fontSize: 16 }]}>
                  {calculatorType === 'plan' ? '平面モード' : '立面モード'} - {
                    calculationMode === 'add' ? '加算モード (+)' : 
                    calculationMode === 'subtract' ? '減算モード (−)' : 
                    '通常モード'
                  }
                </Text>
              </View>
              
              {/* 数値ボタン - 平面モード */}
              {calculatorType === 'plan' && (
                <>
                  {/* 足場部材ボタン第1行 */}
                  <View style={calculatorStyles.buttonRow}>
                    <TouchableOpacity 
                      style={calculatorStyles.materialButton}
                      onPress={() => handleMaterialPress(150)}
                    >
                      <Text style={calculatorStyles.buttonText}>150mm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={calculatorStyles.materialButton}
                      onPress={() => handleMaterialPress(300)}
                    >
                      <Text style={calculatorStyles.buttonText}>300mm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={calculatorStyles.materialButton}
                      onPress={() => handleMaterialPress(355)}
                    >
                      <Text style={calculatorStyles.buttonText}>355mm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={calculatorStyles.materialButton}
                      onPress={() => handleMaterialPress(600)}
                    >
                      <Text style={calculatorStyles.buttonText}>600mm</Text>
                    </TouchableOpacity>
                  </View>

                  {/* 足場部材ボタン第2行 */}
                  <View style={calculatorStyles.buttonRow}>
                    <TouchableOpacity 
                      style={calculatorStyles.materialButton}
                      onPress={() => handleMaterialPress(900)}
                    >
                      <Text style={calculatorStyles.buttonText}>900mm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={calculatorStyles.materialButton}
                      onPress={() => handleMaterialPress(1200)}
                    >
                      <Text style={calculatorStyles.buttonText}>1200mm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={calculatorStyles.materialButton}
                      onPress={() => handleMaterialPress(1500)}
                    >
                      <Text style={calculatorStyles.buttonText}>1500mm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={calculatorStyles.materialButton}
                      onPress={() => handleMaterialPress(1800)}
                    >
                      <Text style={calculatorStyles.buttonText}>1800mm</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* 数値ボタン - 立面モード */}
              {calculatorType === 'elevation' && (
                <>
                  {/* 立面部材ボタン第1行 */}
                  <View style={calculatorStyles.buttonRow}>
                    <TouchableOpacity 
                      style={calculatorStyles.materialButton}
                      onPress={() => handleMaterialPress(3800)}
                    >
                      <Text style={calculatorStyles.buttonText}>3800mm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={calculatorStyles.materialButton}
                      onPress={() => handleMaterialPress(1900)}
                    >
                      <Text style={calculatorStyles.buttonText}>1900mm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={calculatorStyles.materialButton}
                      onPress={() => handleMaterialPress(1425)}
                    >
                      <Text style={calculatorStyles.buttonText}>1425mm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={calculatorStyles.materialButton}
                      onPress={() => handleMaterialPress(1230)}
                    >
                      <Text style={calculatorStyles.buttonText}>1230mm</Text>
                    </TouchableOpacity>
                  </View>

                  {/* 立面部材ボタン第2行 */}
                  <View style={calculatorStyles.buttonRow}>
                    <TouchableOpacity 
                      style={calculatorStyles.materialButton}
                      onPress={() => handleMaterialPress(950)}
                    >
                      <Text style={calculatorStyles.buttonText}>950mm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={calculatorStyles.materialButton}
                      onPress={() => handleMaterialPress(475)}
                    >
                      <Text style={calculatorStyles.buttonText}>475mm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={calculatorStyles.materialButton}
                      onPress={() => handleMaterialPress(130)}
                    >
                      <Text style={calculatorStyles.buttonText}>130mm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={calculatorStyles.clearButton}
                      onPress={handleClear}
                    >
                      <Text style={calculatorStyles.clearButtonText}>C</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* 演算子・機能ボタン */}
              <View style={calculatorStyles.buttonRow}>
                <TouchableOpacity 
                  style={[
                    calculatorStyles.operatorButton,
                    calculationMode === 'add' && calculatorStyles.operatorButtonActive
                  ]}
                  onPress={handleAddMode}
                >
                  <Text style={calculatorStyles.operatorText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    calculatorStyles.operatorButton,
                    calculationMode === 'subtract' && calculatorStyles.operatorButtonActive
                  ]}
                  onPress={handleSubtractMode}
                >
                  <Text style={calculatorStyles.operatorText}>−</Text>
                </TouchableOpacity>
                {calculatorType === 'plan' && (
                  <TouchableOpacity 
                    style={calculatorStyles.clearButton}
                    onPress={handleClear}
                  >
                    <Text style={calculatorStyles.clearButtonText}>C</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* 平面モード専用ボタン */}
              {calculatorType === 'plan' && (
                <View style={calculatorStyles.buttonRow}>
                  <TouchableOpacity 
                    style={calculatorStyles.specialButton}
                    onPress={handleNorthSouthSpan}
                  >
                    <Text style={calculatorStyles.specialButtonText}>南北総スパン</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={calculatorStyles.specialButton}
                    onPress={handleEastWestSpan}
                  >
                    <Text style={calculatorStyles.specialButtonText}>東西総スパン</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 立面モード専用ボタン */}
              {calculatorType === 'elevation' && (
                <View style={calculatorStyles.buttonRow}>
                  <TouchableOpacity 
                    style={calculatorStyles.specialButton}
                    onPress={getReferenceHeight}
                  >
                    <Text style={calculatorStyles.specialButtonText}>基準高さ</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 履歴表示 */}
              {history.length > 0 && (
                <View style={[calculatorStyles.display, { marginTop: 16 }]}>
                  <Text style={[calculatorStyles.spanText, { marginBottom: 8 }]}>計算履歴:</Text>
                  {history.slice(-3).map((item, index) => (
                    <Text key={index} style={calculatorStyles.spanText}>
                      {item}
                    </Text>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  checkboxGroup: {
    gap: 8,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxText: {
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  expandedContent: {
    marginTop: 8,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 32,
    marginHorizontal: 16,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultSection: {
    marginTop: 32,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  resultCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  resultLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 32,
  },
});