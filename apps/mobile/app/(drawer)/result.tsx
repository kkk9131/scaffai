import React, { useState } from 'react';
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
import { colors as baseColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { ja } from '../../constants/translations';
import { useScaffold } from '../../context/ScaffoldContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';

export default function ResultScreen() {
  const { colors, isDark } = useTheme();
  const { isLoading, error, calculationResult, saveToLocal, saveToCloud, isFromHistory } = useScaffold();
  const { user } = useAuthContext();
  const router = useRouter();
  
  const [showProjectNameDialog, setShowProjectNameDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [saveMode, setSaveMode] = useState<'local' | 'cloud'>('local');
  const [savedProjectName, setSavedProjectName] = useState('');

  // Debug logging
  console.log('ResultScreen render - isLoading:', isLoading, 'error:', error, 'hasResult:', !!calculationResult);

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
});