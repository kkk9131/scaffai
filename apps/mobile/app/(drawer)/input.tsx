import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { StatusBar } from 'expo-status-bar';
import { InputField } from '../../components/InputField';
import { RadioField } from '../../components/RadioField';
import { SwitchField } from '../../components/SwitchField';
import { colors as baseColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { ja } from '../../constants/translations';
import { useScaffold } from '../../context/ScaffoldContext';
import { Ionicons } from '@expo/vector-icons';

export default function InputScreen() {
  const { colors, isDark } = useTheme();
  const {
    inputData,
    setInputValue,
    resetInputData,
    calculateScaffold,
    isLoading,
  } = useScaffold();
  
  // 入力検証のエラー状態
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  
  // セクションの展開状態管理
  const [isPropertyLineExpanded, setIsPropertyLineExpanded] = useState(false);
  const [isSpecialMaterialExpanded, setIsSpecialMaterialExpanded] = useState(false);
  const [isTargetOffsetExpanded, setIsTargetOffsetExpanded] = useState(false);

  // 動的スタイル
  const dynamicStyles = StyleSheet.create({
    title: {
      color: colors.text.primary,
    },
    section: {
      backgroundColor: colors.background.card,
    },
    sectionTitle: {
      color: colors.text.primary,
    },
    directionColumn: {
      backgroundColor: colors.background.paper,
    },
    directionTitle: {
      color: colors.text.primary,
    },
    propertyLineItem: {
      backgroundColor: colors.background.paper,
    },
    resetButton: {
      backgroundColor: colors.background.card,
    },
    resetButtonText: {
      color: colors.text.secondary,
    },
    calculateButton: {
      backgroundColor: baseColors.primary.main,
    },
    calculateButtonText: {
      color: colors.text.primary,
    },
  });
  
  // 計算実行
  const handleCalculate = async () => {
    console.log('Calculate button pressed');
    
    try {
      // 基本的な値の設定（同期的に更新されたデータを作成）
      const currentData = { ...inputData };
      
      if (!currentData.frameWidth.northSouth) {
        currentData.frameWidth.northSouth = 1000;
        setInputValue('frameWidth', 'northSouth', 1000);
      }
      if (!currentData.frameWidth.eastWest) {
        currentData.frameWidth.eastWest = 1000;
        setInputValue('frameWidth', 'eastWest', 1000);
      }
      if (!currentData.referenceHeight) {
        currentData.referenceHeight = 2400;
        setInputValue('referenceHeight', '', 2400);
      }
      
      console.log('Current input data before calculation:', currentData);
      
      // 少し待ってから計算を実行（状態更新が確実に反映されるように）
      setTimeout(() => {
        calculateScaffold();
      }, 100);
      
    } catch (error) {
      console.error('Error in handleCalculate:', error);
      Alert.alert('エラー', 'ボタン処理中にエラーが発生しました');
    }
  };
  
  // 数値入力を処理する関数
  const handleNumberInput = (
    category: keyof typeof inputData,
    field: string,
    value: string
  ) => {
    const numValue = value === '' ? null : Number(value);
    setInputValue(category, field, numValue);
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
      <AppHeader title={ja.input.title} />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* 躯体幅 */}
          <View style={[styles.section, dynamicStyles.section]}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{ja.input.frameWidth}</Text>
            <InputField
              label={ja.input.northSouth}
              value={inputData.frameWidth.northSouth?.toString() || ''}
              onChangeText={(value) => handleNumberInput('frameWidth', 'northSouth', value)}
              placeholder="1000"
              keyboardType="numeric"
              suffix={ja.common.mm}
              error={errors['frameWidth.northSouth']}
            />
            <InputField
              label={ja.input.eastWest}
              value={inputData.frameWidth.eastWest?.toString() || ''}
              onChangeText={(value) => handleNumberInput('frameWidth', 'eastWest', value)}
              placeholder="1000"
              keyboardType="numeric"
              suffix={ja.common.mm}
              error={errors['frameWidth.eastWest']}
            />
          </View>

          {/* 軒の出 */}
          <View style={[styles.section, dynamicStyles.section]}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{ja.input.eaveOverhang}</Text>
            <InputField
              label={ja.input.north}
              value={inputData.eaveOverhang.north?.toString() || ''}
              onChangeText={(value) => handleNumberInput('eaveOverhang', 'north', value)}
              placeholder="0"
              keyboardType="numeric"
              suffix={ja.common.mm}
            />
            <InputField
              label={ja.input.east}
              value={inputData.eaveOverhang.east?.toString() || ''}
              onChangeText={(value) => handleNumberInput('eaveOverhang', 'east', value)}
              placeholder="0"
              keyboardType="numeric"
              suffix={ja.common.mm}
            />
            <InputField
              label={ja.input.south}
              value={inputData.eaveOverhang.south?.toString() || ''}
              onChangeText={(value) => handleNumberInput('eaveOverhang', 'south', value)}
              placeholder="0"
              keyboardType="numeric"
              suffix={ja.common.mm}
            />
            <InputField
              label={ja.input.west}
              value={inputData.eaveOverhang.west?.toString() || ''}
              onChangeText={(value) => handleNumberInput('eaveOverhang', 'west', value)}
              placeholder="0"
              keyboardType="numeric"
              suffix={ja.common.mm}
            />
          </View>

          {/* 境界線設定 */}
          <View style={[styles.section, dynamicStyles.section]}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setIsPropertyLineExpanded(!isPropertyLineExpanded)}
            >
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{ja.input.propertyLine}</Text>
              <Ionicons 
                name={isPropertyLineExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={colors.text.primary} 
              />
            </TouchableOpacity>
            {isPropertyLineExpanded && (
              <View style={styles.propertyLineContainer}>
                <View style={[styles.propertyLineItem, dynamicStyles.propertyLineItem]}>
                  <SwitchField
                    label={ja.input.north}
                    value={inputData.propertyLine?.north || false}
                    onValueChange={(value) => setInputValue('propertyLine', 'north', value)}
                  />
                  {inputData.propertyLine?.north && (
                    <InputField
                      label={`${ja.input.north}距離`}
                      value={inputData.propertyLineDistance?.north?.toString() || ''}
                      onChangeText={(value) => handleNumberInput('propertyLineDistance', 'north', value)}
                      placeholder="1000"
                      keyboardType="numeric"
                      suffix={ja.common.mm}
                    />
                  )}
                </View>
                <View style={[styles.propertyLineItem, dynamicStyles.propertyLineItem]}>
                  <SwitchField
                    label={ja.input.east}
                    value={inputData.propertyLine?.east || false}
                    onValueChange={(value) => setInputValue('propertyLine', 'east', value)}
                  />
                  {inputData.propertyLine?.east && (
                    <InputField
                      label={`${ja.input.east}距離`}
                      value={inputData.propertyLineDistance?.east?.toString() || ''}
                      onChangeText={(value) => handleNumberInput('propertyLineDistance', 'east', value)}
                      placeholder="1000"
                      keyboardType="numeric"
                      suffix={ja.common.mm}
                    />
                  )}
                </View>
                <View style={[styles.propertyLineItem, dynamicStyles.propertyLineItem]}>
                  <SwitchField
                    label={ja.input.south}
                    value={inputData.propertyLine?.south || false}
                    onValueChange={(value) => setInputValue('propertyLine', 'south', value)}
                  />
                  {inputData.propertyLine?.south && (
                    <InputField
                      label={`${ja.input.south}距離`}
                      value={inputData.propertyLineDistance?.south?.toString() || ''}
                      onChangeText={(value) => handleNumberInput('propertyLineDistance', 'south', value)}
                      placeholder="1000"
                      keyboardType="numeric"
                      suffix={ja.common.mm}
                    />
                  )}
                </View>
                <View style={[styles.propertyLineItem, dynamicStyles.propertyLineItem]}>
                  <SwitchField
                    label={ja.input.west}
                    value={inputData.propertyLine?.west || false}
                    onValueChange={(value) => setInputValue('propertyLine', 'west', value)}
                  />
                  {inputData.propertyLine?.west && (
                    <InputField
                      label={`${ja.input.west}距離`}
                      value={inputData.propertyLineDistance?.west?.toString() || ''}
                      onChangeText={(value) => handleNumberInput('propertyLineDistance', 'west', value)}
                      placeholder="1000"
                      keyboardType="numeric"
                      suffix={ja.common.mm}
                    />
                  )}
                </View>
              </View>
            )}
          </View>

          {/* 基準高さ */}
          <View style={[styles.section, dynamicStyles.section]}>
            <InputField
              label={ja.input.referenceHeight}
              value={inputData.referenceHeight?.toString() || ''}
              onChangeText={(value) => handleNumberInput('referenceHeight', '', value)}
              placeholder="2400"
              keyboardType="numeric"
              suffix={ja.common.mm}
              error={errors['referenceHeight']}
            />
          </View>

          {/* 屋根の形状 */}
          <View style={[styles.section, dynamicStyles.section]}>
            <RadioField
              label={ja.input.roofShape}
              options={[
                { label: ja.input.roofShapes.flat, value: 'flat' },
                { label: ja.input.roofShapes.sloped, value: 'sloped' },
                { label: ja.input.roofShapes.roofDeck, value: 'roofDeck' },
              ]}
              selectedValue={inputData.roofShape}
              onValueChange={(value) => setInputValue('roofShape', '', value)}
            />
          </View>

          {/* 根がらみ支柱 */}
          <View style={[styles.section, dynamicStyles.section]}>
            <SwitchField
              label={ja.input.tieColumns}
              value={inputData.hasTieColumns}
              onValueChange={(value) => setInputValue('hasTieColumns', '', value)}
            />
          </View>

          {/* 軒手すり */}
          <View style={[styles.section, dynamicStyles.section]}>
            <InputField
              label={ja.input.eavesHandrails}
              value={inputData.eavesHandrails?.toString() || ''}
              onChangeText={(value) => handleNumberInput('eavesHandrails', '', value)}
              placeholder="0"
              keyboardType="numeric"
              suffix={ja.common.items}
            />
          </View>

          {/* 特殊資材 */}
          <View style={[styles.section, dynamicStyles.section]}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setIsSpecialMaterialExpanded(!isSpecialMaterialExpanded)}
            >
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{ja.input.specialMaterial}</Text>
              <Ionicons 
                name={isSpecialMaterialExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={colors.text.primary} 
              />
            </TouchableOpacity>
            
            {isSpecialMaterialExpanded && (
            <View style={styles.directionContainer}>
              <View style={[styles.directionColumn, dynamicStyles.directionColumn]}>
                <Text style={[styles.directionTitle, dynamicStyles.directionTitle]}>{ja.input.northSouth}</Text>
                <RadioField
                  label={ja.input.material355}
                  options={[
                    { label: 'なし', value: '0' },
                    { label: '1本', value: '1' },
                    { label: '2本', value: '2' }
                  ]}
                  selectedValue={inputData.specialMaterial?.northSouth?.material355?.toString() || '0'}
                  onValueChange={(value) => handleNumberInput('specialMaterial', 'northSouth.material355', value)}
                />
                <RadioField
                  label={ja.input.material300}
                  options={[
                    { label: 'なし', value: '0' },
                    { label: '1本', value: '1' },
                    { label: '2本', value: '2' }
                  ]}
                  selectedValue={inputData.specialMaterial?.northSouth?.material300?.toString() || '0'}
                  onValueChange={(value) => handleNumberInput('specialMaterial', 'northSouth.material300', value)}
                />
                <RadioField
                  label={ja.input.material150}
                  options={[
                    { label: 'なし', value: '0' },
                    { label: '1本', value: '1' },
                    { label: '2本', value: '2' }
                  ]}
                  selectedValue={inputData.specialMaterial?.northSouth?.material150?.toString() || '0'}
                  onValueChange={(value) => handleNumberInput('specialMaterial', 'northSouth.material150', value)}
                />
              </View>
              <View style={[styles.directionColumn, dynamicStyles.directionColumn]}>
                <Text style={[styles.directionTitle, dynamicStyles.directionTitle]}>{ja.input.eastWest}</Text>
                <RadioField
                  label={ja.input.material355}
                  options={[
                    { label: 'なし', value: '0' },
                    { label: '1本', value: '1' },
                    { label: '2本', value: '2' }
                  ]}
                  selectedValue={inputData.specialMaterial?.eastWest?.material355?.toString() || '0'}
                  onValueChange={(value) => handleNumberInput('specialMaterial', 'eastWest.material355', value)}
                />
                <RadioField
                  label={ja.input.material300}
                  options={[
                    { label: 'なし', value: '0' },
                    { label: '1本', value: '1' },
                    { label: '2本', value: '2' }
                  ]}
                  selectedValue={inputData.specialMaterial?.eastWest?.material300?.toString() || '0'}
                  onValueChange={(value) => handleNumberInput('specialMaterial', 'eastWest.material300', value)}
                />
                <RadioField
                  label={ja.input.material150}
                  options={[
                    { label: 'なし', value: '0' },
                    { label: '1本', value: '1' },
                    { label: '2本', value: '2' }
                  ]}
                  selectedValue={inputData.specialMaterial?.eastWest?.material150?.toString() || '0'}
                  onValueChange={(value) => handleNumberInput('specialMaterial', 'eastWest.material150', value)}
                />
              </View>
            </View>
            )}
          </View>

          {/* 目標離れ（4面個別設定） */}
          <View style={[styles.section, dynamicStyles.section]}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setIsTargetOffsetExpanded(!isTargetOffsetExpanded)}
            >
              <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>{ja.input.targetOffset}</Text>
              <Ionicons 
                name={isTargetOffsetExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={colors.text.primary} 
              />
            </TouchableOpacity>
            
            {isTargetOffsetExpanded && (
              <View>
            <Text style={[styles.sectionDescription, dynamicStyles.sectionTitle]}>{ja.input.targetOffsetDescription}</Text>
            
            {/* 北面 */}
            <View style={[styles.propertyLineItem, dynamicStyles.propertyLineItem]}>
              <SwitchField
                label={`${ja.input.north} - ${ja.input.targetOffsetEnabled}`}
                value={inputData.targetOffset?.north?.enabled || false}
                onValueChange={(value) => setInputValue('targetOffset', 'north.enabled', value)}
              />
              <InputField
                label={`${ja.input.north}目標離れ`}
                value={inputData.targetOffset?.north?.value !== null ? String(inputData.targetOffset.north.value) : ''}
                onChangeText={(value) => handleNumberInput('targetOffset', 'north.value', value)}
                placeholder="900"
                keyboardType="numeric"
                suffix={ja.common.mm}
                editable={inputData.targetOffset?.north?.enabled || false}
              />
            </View>
            {/* 東面 */}
            <View style={[styles.propertyLineItem, dynamicStyles.propertyLineItem]}>
              <SwitchField
                label={`${ja.input.east} - ${ja.input.targetOffsetEnabled}`}
                value={inputData.targetOffset?.east?.enabled || false}
                onValueChange={(value) => setInputValue('targetOffset', 'east.enabled', value)}
              />
              <InputField
                label={`${ja.input.east}目標離れ`}
                value={inputData.targetOffset?.east?.value !== null ? String(inputData.targetOffset.east.value) : ''}
                onChangeText={(value) => handleNumberInput('targetOffset', 'east.value', value)}
                placeholder="900"
                keyboardType="numeric"
                suffix={ja.common.mm}
                editable={inputData.targetOffset?.east?.enabled || false}
              />
            </View>
            {/* 南面 */}
            <View style={[styles.propertyLineItem, dynamicStyles.propertyLineItem]}>
              <SwitchField
                label={`${ja.input.south} - ${ja.input.targetOffsetEnabled}`}
                value={inputData.targetOffset?.south?.enabled || false}
                onValueChange={(value) => setInputValue('targetOffset', 'south.enabled', value)}
              />
              <InputField
                label={`${ja.input.south}目標離れ`}
                value={inputData.targetOffset?.south?.value !== null ? String(inputData.targetOffset.south.value) : ''}
                onChangeText={(value) => handleNumberInput('targetOffset', 'south.value', value)}
                placeholder="900"
                keyboardType="numeric"
                suffix={ja.common.mm}
                editable={inputData.targetOffset?.south?.enabled || false}
              />
            </View>
            {/* 西面 */}
            <View style={[styles.propertyLineItem, dynamicStyles.propertyLineItem]}>
              <SwitchField
                label={`${ja.input.west} - ${ja.input.targetOffsetEnabled}`}
                value={inputData.targetOffset?.west?.enabled || false}
                onValueChange={(value) => setInputValue('targetOffset', 'west.enabled', value)}
              />
              <InputField
                label={`${ja.input.west}目標離れ`}
                value={inputData.targetOffset?.west?.value !== null ? String(inputData.targetOffset.west.value) : ''}
                onChangeText={(value) => handleNumberInput('targetOffset', 'west.value', value)}
                placeholder="900"
                keyboardType="numeric"
                suffix={ja.common.mm}
                editable={inputData.targetOffset?.west?.enabled || false}
              />
            </View>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.resetButton, dynamicStyles.resetButton]}
            onPress={resetInputData}
          >
            <Ionicons name="refresh" color={colors.text.secondary} size={20} />
            <Text style={[styles.resetButtonText, dynamicStyles.resetButtonText]}>{ja.input.resetButton}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.calculateButton, dynamicStyles.calculateButton, isLoading && styles.disabledButton]}
            onPress={handleCalculate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text.primary} />
            ) : (
              <>
                <Text style={[styles.calculateButtonText, dynamicStyles.calculateButtonText]}>{ja.input.calculateButton}</Text>
                <Ionicons name="arrow-forward" color={colors.text.primary} size={20} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  section: {
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  propertyLineContainer: {
    gap: 16,
  },
  propertyLineItem: {
    borderRadius: 8,
    padding: 12,
  },
  directionContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  directionColumn: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
  },
  directionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  calculateButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
    lineHeight: 20,
  },
});