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
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { InputField } from '../../components/InputField';
import { SwitchField } from '../../components/SwitchField';
import { RadioField } from '../../components/RadioField';
import { colors } from '../../constants/colors';
import { ja } from '../../constants/translations';
import { useScaffold } from '../../context/ScaffoldContext';
import { ArrowRight, RotateCcw, Info } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function InputScreen() {
  const {
    inputData,
    setInputValue,
    resetInputData,
    calculateScaffold,
    isLoading,
  } = useScaffold();
  
  // 入力検証のエラー状態
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  
  // 計算実行
  const handleCalculate = () => {
    console.log('Calculate button pressed');
    
    try {
      // 基本的な値の設定
      if (!inputData.frameWidth.northSouth) {
        setInputValue('frameWidth', 'northSouth', 1000);
      }
      if (!inputData.frameWidth.eastWest) {
        setInputValue('frameWidth', 'eastWest', 1000);
      }
      if (!inputData.referenceHeight) {
        setInputValue('referenceHeight', '', 2400);
      }
      
      calculateScaffold();
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
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <Animated.View 
          entering={FadeIn.duration(600)}
          style={styles.header}
        >
          <Text style={styles.title}>{ja.input.title}</Text>
        </Animated.View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* 躯体幅 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{ja.input.frameWidth}</Text>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{ja.input.eaveOverhang}</Text>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{ja.input.propertyLine}</Text>
            <View style={styles.propertyLineContainer}>
              <View style={styles.propertyLineItem}>
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
              <View style={styles.propertyLineItem}>
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
              <View style={styles.propertyLineItem}>
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
              <View style={styles.propertyLineItem}>
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
          </View>

          {/* 基準高さ */}
          <View style={styles.section}>
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
          <View style={styles.section}>
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
          <View style={styles.section}>
            <SwitchField
              label={ja.input.tieColumns}
              value={inputData.hasTieColumns}
              onValueChange={(value) => setInputValue('hasTieColumns', '', value)}
            />
          </View>

          {/* 軒手すり */}
          <View style={styles.section}>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{ja.input.specialMaterial}</Text>
            <View style={styles.directionContainer}>
              <View style={styles.directionColumn}>
                <Text style={styles.directionTitle}>{ja.input.northSouth}</Text>
                <InputField
                  label={ja.input.material355}
                  value={inputData.specialMaterial?.northSouth?.material355?.toString() || ''}
                  onChangeText={(value) => handleNumberInput('specialMaterial', 'northSouth.material355', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  suffix={ja.common.items}
                />
                <InputField
                  label={ja.input.material300}
                  value={inputData.specialMaterial?.northSouth?.material300?.toString() || ''}
                  onChangeText={(value) => handleNumberInput('specialMaterial', 'northSouth.material300', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  suffix={ja.common.items}
                />
                <InputField
                  label={ja.input.material150}
                  value={inputData.specialMaterial?.northSouth?.material150?.toString() || ''}
                  onChangeText={(value) => handleNumberInput('specialMaterial', 'northSouth.material150', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  suffix={ja.common.items}
                />
              </View>
              <View style={styles.directionColumn}>
                <Text style={styles.directionTitle}>{ja.input.eastWest}</Text>
                <InputField
                  label={ja.input.material355}
                  value={inputData.specialMaterial?.eastWest?.material355?.toString() || ''}
                  onChangeText={(value) => handleNumberInput('specialMaterial', 'eastWest.material355', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  suffix={ja.common.items}
                />
                <InputField
                  label={ja.input.material300}
                  value={inputData.specialMaterial?.eastWest?.material300?.toString() || ''}
                  onChangeText={(value) => handleNumberInput('specialMaterial', 'eastWest.material300', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  suffix={ja.common.items}
                />
                <InputField
                  label={ja.input.material150}
                  value={inputData.specialMaterial?.eastWest?.material150?.toString() || ''}
                  onChangeText={(value) => handleNumberInput('specialMaterial', 'eastWest.material150', value)}
                  placeholder="0"
                  keyboardType="numeric"
                  suffix={ja.common.items}
                />
              </View>
            </View>
          </View>

          {/* 目標離れ */}
          <View style={styles.section}>
            <InputField
              label={ja.input.targetOffset}
              value={inputData.targetOffset?.toString() || ''}
              onChangeText={(value) => handleNumberInput('targetOffset', '', value)}
              placeholder="900"
              keyboardType="numeric"
              suffix={ja.common.mm}
            />
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetInputData}
          >
            <RotateCcw color={colors.text.secondary} size={20} />
            <Text style={styles.resetButtonText}>{ja.input.resetButton}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.calculateButton, isLoading && styles.disabledButton]}
            onPress={handleCalculate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text.primary} />
            ) : (
              <>
                <Text style={styles.calculateButtonText}>{ja.input.calculateButton}</Text>
                <ArrowRight color={colors.text.primary} size={20} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
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
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  propertyLineContainer: {
    gap: 16,
  },
  propertyLineItem: {
    backgroundColor: colors.background.paper,
    borderRadius: 8,
    padding: 12,
  },
  directionContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  directionColumn: {
    flex: 1,
    backgroundColor: colors.background.paper,
    borderRadius: 8,
    padding: 12,
  },
  directionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
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
    backgroundColor: colors.background.card,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  resetButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  calculateButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  calculateButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});