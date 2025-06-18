'use client';

import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';
import { InputField } from '../../components/InputField';
import { RadioField } from '../../components/RadioField';
import { colors as baseColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
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


  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <AppHeader title="簡易割付" showBackButton onBackPress={() => router.back()} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.content} 
          showsVerticalScrollIndicator={false}
        >
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