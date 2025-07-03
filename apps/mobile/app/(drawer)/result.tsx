import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { StatusBar } from 'expo-status-bar';
import { ResultCard } from '../../components/ResultCard';
import { ProjectNameDialog } from '../../components/ProjectNameDialog';
import { SaveCompletionDialog } from '../../components/SaveCompletionDialog';
import { GapAdjustmentControl } from '../../components/GapAdjustmentControl';
import { colors as baseColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { ja } from '../../constants/translations';
import { useScaffold } from '../../context/ScaffoldContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import { HistoryStorage } from '../../utils/storage';

export default function ResultScreen() {
  const { colors, isDark } = useTheme();
  const { isLoading, error, calculationResult, saveToLocal, saveToCloud, isFromHistory, adjustGap, inputData, setCalculationResult, setInputValue } = useScaffold();
  const { user } = useAuthContext();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [showProjectNameDialog, setShowProjectNameDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [saveMode, setSaveMode] = useState<'local' | 'cloud'>('local');
  const [savedProjectName, setSavedProjectName] = useState('');
  const [adjustmentMode, setAdjustmentMode] = useState(false);

  // Debug logging
  console.log('ResultScreen render - isLoading:', isLoading, 'error:', error, 'hasResult:', !!calculationResult);

  // 履歴からの遷移の場合、履歴データを読み込む
  useEffect(() => {
    const loadHistoryData = async () => {
      if (params.fromHistory === 'true' && params.historyId) {
        try {
          console.log('Loading history data for ID:', params.historyId);
          const history = await HistoryStorage.getHistory();
          const historyItem = history.find(item => item.id === params.historyId);
          
          if (historyItem) {
            console.log('Found history item:', historyItem);
            
            // 入力データを設定
            // setInputValue の型に合わせてデータを設定する必要があります
            // 簡単のため、全体的なデータ設定のヘルパー関数が必要かもしれません
            
            // 計算結果を設定
            setCalculationResult(historyItem.result);
            
            console.log('History data loaded successfully');
          } else {
            console.error('History item not found for ID:', params.historyId);
            Alert.alert('エラー', '履歴データが見つかりませんでした');
          }
        } catch (error) {
          console.error('Error loading history data:', error);
          Alert.alert('エラー', '履歴データの読み込みに失敗しました');
        }
      }
    };

    loadHistoryData();
  }, [params.fromHistory, params.historyId, setCalculationResult]);

  // 保存処理関数
  const handleSaveWithProjectName = async (projectName: string) => {
    console.log('🚀 handleSaveWithProjectName called with:', { projectName, saveMode });
    try {
      if (saveMode === 'local') {
        console.log('💾 Starting local save...');
        await saveToLocal(projectName);
        console.log('✅ Local save completed, showing completion dialog...');
      } else {
        console.log('☁️ Starting cloud save...');
        await saveToCloud(projectName);
        console.log('✅ Cloud save completed, showing completion dialog...');
      }
      
      // 保存成功時はカスタムダイアログを表示
      setSavedProjectName(projectName);
      setShowCompletionDialog(true);
      
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert(
        '❌ 保存エラー', 
        `保存に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
        [{ text: 'OK' }]
      );
    }
  };

  // ローカル保存ボタンの処理
  const handleLocalSave = () => {
    setSaveMode('local');
    setShowProjectNameDialog(true);
  };

  // クラウド保存ボタンの処理
  const handleCloudSave = () => {
    setSaveMode('cloud');
    setShowProjectNameDialog(true);
  };

  // キャンセル処理
  const handleSaveCancel = () => {
    // 元の画面に戻る（何もしない）
  };

  // 離れの値を数値として抽出
  const extractGapValue = (gapString: string): number => {
    const match = gapString.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // 軒の出の値を取得（方向ごとに対応）
  const getEavesValue = (direction: string) => {
    switch (direction) {
      case 'north': return inputData.eaveOverhang.north || 0;
      case 'south': return inputData.eaveOverhang.south || 0;
      case 'east': return inputData.eaveOverhang.east || 0;
      case 'west': return inputData.eaveOverhang.west || 0;
      default: return 0;
    }
  };

  // 最小値チェック（軒の出 + 80mm以上が必要）
  const isAtMinimum = (direction: string, currentValue: number): boolean => {
    const minValue = getEavesValue(direction) + 80;
    return currentValue <= minValue;
  };

  // 動的スタイル
  const dynamicStyles = StyleSheet.create({
    loadingContainer: {
      backgroundColor: colors.background.primary,
    },
    loadingText: {
      color: colors.text.primary,
    },
    errorContainer: {
      backgroundColor: colors.background.primary,
    },
    errorText: {
      color: baseColors.error,
    },
    errorButton: {
      backgroundColor: baseColors.primary.main,
    },
    errorButtonText: {
      color: '#FFFFFF',
    },
    emptyContainer: {
      backgroundColor: colors.background.primary,
    },
    emptyText: {
      color: colors.text.primary,
    },
    emptyButton: {
      backgroundColor: baseColors.primary.main,
    },
    emptyButtonText: {
      color: '#FFFFFF',
    },
    container: {
      backgroundColor: colors.background.primary,
    },
    title: {
      color: colors.text.primary,
    },
    localSaveButton: {
      backgroundColor: baseColors.secondary.main,
    },
    localSaveButtonText: {
      color: '#FFFFFF',
    },
    cloudSaveButton: {
      backgroundColor: baseColors.primary.main,
    },
    cloudSaveButtonText: {
      color: '#FFFFFF',
    },
    recalculateButton: {
      backgroundColor: baseColors.accent.orange,
    },
    recalculateButtonText: {
      color: '#FFFFFF',
    },
    noSaveMessage: {
      backgroundColor: colors.background.secondary,
      borderColor: colors.border.main,
    },
    noSaveText: {
      color: colors.text.secondary,
    },
    adjustmentButton: {
      backgroundColor: adjustmentMode ? baseColors.accent.orange : baseColors.secondary.main,
    },
    adjustmentButtonText: {
      color: '#FFFFFF',
    },
    adjustmentSection: {
      backgroundColor: colors.background.secondary,
      borderColor: colors.border.main,
    },
    adjustmentTitle: {
      color: colors.text.primary,
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <AppHeader title={ja.result.title} />
        <View style={[styles.loadingContainer, dynamicStyles.loadingContainer]}>
          <ActivityIndicator size="large" color={baseColors.primary.main} />
          <Text style={[styles.loadingText, dynamicStyles.loadingText]}>{ja.common.loading}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <AppHeader title={ja.result.title} />
        <View style={[styles.errorContainer, dynamicStyles.errorContainer]}>
          <Ionicons name="alert-circle" size={60} color={baseColors.error} />
          <Text style={[styles.errorText, dynamicStyles.errorText]}>{error}</Text>
          <TouchableOpacity
            style={[styles.errorButton, dynamicStyles.errorButton]}
            onPress={() => router.back()}
          >
            <Text style={[styles.errorButtonText, dynamicStyles.errorButtonText]}>{ja.common.retry}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!calculationResult) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <AppHeader title={ja.result.title} />
        <View style={[styles.emptyContainer, dynamicStyles.emptyContainer]}>
          <Text style={[styles.emptyText, dynamicStyles.emptyText]}>{ja.result.noResults}</Text>
          <TouchableOpacity
            style={[styles.emptyButton, dynamicStyles.emptyButton]}
            onPress={() => router.push('/(drawer)/input')}
          >
            <Text style={[styles.emptyButtonText, dynamicStyles.emptyButtonText]}>{ja.input.title}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <AppHeader title={ja.result.title} />
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View>
          <ResultCard
            title={ja.result.totalSpan + " (南北)"}
            value={calculationResult.ns_total_span}
            suffix={ja.common.mm}
            delay={0}
          />
          <ResultCard
            title={ja.result.totalSpan + " (東西)"}
            value={calculationResult.ew_total_span}
            suffix={ja.common.mm}
            delay={100}
          />
          <ResultCard
            title={ja.result.spanComposition + " (南北)"}
            value={calculationResult.ns_span_structure}
            delay={200}
          />
          <ResultCard
            title={ja.result.spanComposition + " (東西)"}
            value={calculationResult.ew_span_structure}
            delay={300}
          />
          <ResultCard
            title={ja.result.endGaps + " (北)"}
            value={calculationResult.north_gap}
            delay={400}
          />
          <ResultCard
            title={ja.result.endGaps + " (南)"}
            value={calculationResult.south_gap}
            delay={500}
          />
          <ResultCard
            title={ja.result.endGaps + " (東)"}
            value={calculationResult.east_gap}
            delay={600}
          />
          <ResultCard
            title={ja.result.endGaps + " (西)"}
            value={calculationResult.west_gap}
            delay={700}
          />
          <ResultCard
            title={ja.result.numberOfLevels}
            value={calculationResult.num_stages}
            suffix={ja.common.units}
            delay={800}
          />
          <ResultCard
            title={ja.result.numberOfUnits}
            value={calculationResult.modules_count}
            suffix={ja.common.pieces}
            delay={900}
          />
          <ResultCard
            title={ja.result.jackupHeight}
            value={calculationResult.jack_up_height}
            suffix={ja.common.mm}
            delay={1000}
          />
          <ResultCard
            title={ja.result.firstLevelHeight}
            value={calculationResult.first_layer_height}
            suffix={ja.common.mm}
            delay={1100}
          />
          <ResultCard
            title="根がらみ支柱の有無"
            value={
              calculationResult.tie_column_used 
                ? (calculationResult.tie_ok ? "設置可能" : "設置不可") 
                : "使用しない"
            }
            isWarning={calculationResult.tie_column_used && !calculationResult.tie_ok}
            delay={1200}
          />

          {/* 離れ調整セクション */}
          <View style={styles.adjustmentToggleContainer}>
            <TouchableOpacity
              style={[styles.adjustmentToggle, dynamicStyles.adjustmentButton]}
              onPress={() => setAdjustmentMode(!adjustmentMode)}
            >
              <Ionicons 
                name={adjustmentMode ? "settings" : "construct"} 
                color="#FFFFFF" 
                size={20} 
              />
              <Text style={[styles.adjustmentToggleText, dynamicStyles.adjustmentButtonText]}>
                {adjustmentMode ? '調整を終了' : '離れを調整'}
              </Text>
            </TouchableOpacity>
          </View>

          {adjustmentMode && calculationResult && (
            <View style={[styles.adjustmentSection, dynamicStyles.adjustmentSection]}>
              <Text style={[styles.adjustmentTitle, dynamicStyles.adjustmentTitle]}>
                離れの手動調整（5mm単位）
              </Text>
              <Text style={[styles.adjustmentNote, dynamicStyles.adjustmentTitle]}>
                ※ 一方を増やすと対面が同じ分だけ減ります
              </Text>
              
              <GapAdjustmentControl
                label="北面の離れ"
                value={extractGapValue(calculationResult.north_gap)}
                onIncrease={() => adjustGap('north', 5)}
                onDecrease={() => adjustGap('north', -5)}
                isDecreaseDisabled={isAtMinimum('north', extractGapValue(calculationResult.north_gap))}
              />
              
              <GapAdjustmentControl
                label="南面の離れ"
                value={extractGapValue(calculationResult.south_gap)}
                onIncrease={() => adjustGap('south', 5)}
                onDecrease={() => adjustGap('south', -5)}
                isDecreaseDisabled={isAtMinimum('south', extractGapValue(calculationResult.south_gap))}
              />
              
              <GapAdjustmentControl
                label="東面の離れ"
                value={extractGapValue(calculationResult.east_gap)}
                onIncrease={() => adjustGap('east', 5)}
                onDecrease={() => adjustGap('east', -5)}
                isDecreaseDisabled={isAtMinimum('east', extractGapValue(calculationResult.east_gap))}
              />
              
              <GapAdjustmentControl
                label="西面の離れ"
                value={extractGapValue(calculationResult.west_gap)}
                onIncrease={() => adjustGap('west', 5)}
                onDecrease={() => adjustGap('west', -5)}
                isDecreaseDisabled={isAtMinimum('west', extractGapValue(calculationResult.west_gap))}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {!isFromHistory && user ? (
        // ログイン済みユーザー：3つのボタン（履歴から来た場合は非表示）
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, dynamicStyles.localSaveButton]}
            onPress={handleLocalSave}
          >
            <Ionicons name="save" color="#FFFFFF" size={20} />
            <Text style={[styles.actionButtonText, dynamicStyles.localSaveButtonText]}>
              ローカル保存
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, dynamicStyles.cloudSaveButton]}
            onPress={handleCloudSave}
          >
            <Ionicons name="cloud-upload" color="#FFFFFF" size={20} />
            <Text style={[styles.actionButtonText, dynamicStyles.cloudSaveButtonText]}>
              クラウド保存
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, dynamicStyles.recalculateButton]}
            onPress={() => router.push('/(drawer)/input')}
          >
            <Ionicons name="refresh" color="#FFFFFF" size={20} />
            <Text style={[styles.actionButtonText, dynamicStyles.recalculateButtonText]}>
              再計算
            </Text>
          </TouchableOpacity>
        </View>
      ) : !isFromHistory ? (
        // 未ログインユーザー：保存不可メッセージと再計算ボタンのみ（履歴から来た場合は非表示）
        <View style={styles.buttonContainer}>
          <View style={[styles.noSaveMessage, dynamicStyles.noSaveMessage]}>
            <Ionicons name="lock-closed" color={colors.text.secondary} size={20} />
            <Text style={[styles.noSaveText, dynamicStyles.noSaveText]}>
              保存するにはログインが必要です
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.recalculateButton, dynamicStyles.recalculateButton]}
            onPress={() => router.push('/(drawer)/input')}
          >
            <Ionicons name="refresh" color="#FFFFFF" size={20} />
            <Text style={[styles.recalculateButtonText, dynamicStyles.recalculateButtonText]}>
              {ja.result.recalculateButton}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* 履歴から来た場合は戻るボタンのみ表示 */}
      {isFromHistory && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.recalculateButton, dynamicStyles.recalculateButton]}
            onPress={() => router.push('/(drawer)/history')}
          >
            <Ionicons name="arrow-back" color="#FFFFFF" size={20} />
            <Text style={[styles.recalculateButtonText, dynamicStyles.recalculateButtonText]}>
              履歴に戻る
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* プロジェクト名入力ダイアログ */}
      <ProjectNameDialog
        visible={showProjectNameDialog}
        onClose={() => setShowProjectNameDialog(false)}
        onSave={handleSaveWithProjectName}
        onCancel={handleSaveCancel}
        title={saveMode === 'local' ? 'ローカル保存' : 'クラウド保存'}
      />

      {/* 保存完了ダイアログ */}
      <SaveCompletionDialog
        visible={showCompletionDialog}
        onClose={() => setShowCompletionDialog(false)}
        onViewHistory={() => {
          setShowCompletionDialog(false);
          router.push('/(drawer)/history');
        }}
        projectName={savedProjectName}
        saveMode={saveMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  buttonContainer: {
    flexDirection: 'column',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  recalculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  recalculateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noSaveMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginBottom: 8,
  },
  noSaveText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  adjustmentToggleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  adjustmentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  adjustmentToggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  adjustmentSection: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  adjustmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  adjustmentNote: {
    fontSize: 12,
    marginBottom: 16,
    fontStyle: 'italic',
  },
});