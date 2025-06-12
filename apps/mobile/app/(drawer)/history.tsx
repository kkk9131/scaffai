import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppHeader } from '../../components/AppHeader';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors as baseColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { ja } from '../../constants/translations';
import { CalculationHistory, HistoryFilter } from '../../types/history';
import { HistoryStorage } from '../../utils/storage';
import { HistoryCard } from '../../components/HistoryCard';
import { LoadCompletionDialog } from '../../components/LoadCompletionDialog';
import { useScaffold } from '../../context/ScaffoldContext';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../context/AuthContext';

export default function HistoryScreen() {
  const { colors, isDark } = useTheme();
  const [localHistory, setLocalHistory] = useState<CalculationHistory[]>([]);
  const [cloudHistory, setCloudHistory] = useState<any[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCloudHistory, setShowCloudHistory] = useState(false);
  const [showLoadCompletionDialog, setShowLoadCompletionDialog] = useState(false);
  const [filter, setFilter] = useState<HistoryFilter>({
    searchTerm: '',
    sortBy: 'date',
    filterBy: 'all',
  });

  const router = useRouter();
  const { setInputValue, resetInputData, setCalculationResult } = useScaffold();
  const { user } = useAuthContext();

  // 動的スタイル
  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.background.primary,
    },
    loadingContainer: {
      backgroundColor: colors.background.primary,
    },
    loadingText: {
      color: colors.text.primary,
    },
    title: {
      color: colors.text.primary,
    },
    subtitle: {
      color: colors.text.secondary,
    },
    searchContainer: {
      backgroundColor: colors.input.background,
      borderColor: colors.input.border,
    },
    searchInput: {
      color: colors.text.primary,
    },
    controlsContainer: {
      backgroundColor: colors.background.secondary,
    },
    switchButton: {
      backgroundColor: colors.background.card,
    },
    switchButtonText: {
      color: colors.text.primary,
    },
    filterButton: {
      backgroundColor: colors.background.card,
      borderColor: colors.border.main,
    },
    filterButtonText: {
      color: colors.text.primary,
    },
    emptyContainer: {
      backgroundColor: colors.background.primary,
    },
    emptyText: {
      color: colors.text.primary,
    },
    emptySubtext: {
      color: colors.text.secondary,
    },
    emptyButton: {
      backgroundColor: baseColors.primary.main,
    },
    emptyButtonText: {
      color: '#FFFFFF',
    },
  });

  // ローカル履歴を読み込む
  const loadLocalHistory = useCallback(async () => {
    try {
      console.log('🔄 loadLocalHistory called');
      const historyData = await HistoryStorage.getHistory();
      console.log('📋 loadLocalHistory result:', historyData.length, 'items');
      console.log('📋 First item ID:', historyData[0]?.id);
      console.log('📋 Latest 3 items:', historyData.slice(0, 3).map(item => ({ id: item.id, createdAt: item.createdAt })));
      setLocalHistory(historyData);
      console.log('✅ setLocalHistory completed');
    } catch (error) {
      console.error('Failed to load local history:', error);
    }
  }, []);

  // Supabaseデータをローカル形式に変換
  const convertCloudToLocal = (cloudItem: any) => {
    // 新しいJSON形式の場合
    if (cloudItem.input_data && cloudItem.result_data) {
      try {
        return {
          id: cloudItem.id,
          title: cloudItem.title,
          createdAt: cloudItem.created_at,
          input_data: JSON.parse(cloudItem.input_data),
          calculation_result: JSON.parse(cloudItem.result_data),
        };
      } catch (e) {
        console.error('Failed to parse JSON data from cloud:', e);
      }
    }
    
    // 古い個別フィールド形式の場合（後方互換性）
    return {
      id: cloudItem.id,
      title: cloudItem.title,
      createdAt: cloudItem.created_at,
      input_data: {
        frameWidth: {
          northSouth: cloudItem.frame_width_ns,
          eastWest: cloudItem.frame_width_ew,
        },
        eaveOverhang: {
          north: cloudItem.eaves_north,
          east: cloudItem.eaves_east,
          south: cloudItem.eaves_south,
          west: cloudItem.eaves_west,
        },
        propertyLine: {
          north: cloudItem.property_line_north,
          east: cloudItem.property_line_east,
          south: cloudItem.property_line_south,
          west: cloudItem.property_line_west,
        },
        propertyLineDistance: {
          north: cloudItem.property_line_distance_north,
          east: cloudItem.property_line_distance_east,
          south: cloudItem.property_line_distance_south,
          west: cloudItem.property_line_distance_west,
        },
        referenceHeight: cloudItem.reference_height,
        roofShape: cloudItem.roof_shape,
        hasTieColumns: cloudItem.has_tie_columns,
        eavesHandrails: cloudItem.eaves_handrails,
        specialMaterial: {
          northSouth: {
            material355: cloudItem.special_material_ns_355,
            material300: cloudItem.special_material_ns_300,
            material150: cloudItem.special_material_ns_150,
          },
          eastWest: {
            material355: cloudItem.special_material_ew_355,
            material300: cloudItem.special_material_ew_300,
            material150: cloudItem.special_material_ew_150,
          },
        },
        targetOffset: cloudItem.target_offset,
      },
      calculation_result: {
        ns_total_span: cloudItem.ns_total_span,
        ew_total_span: cloudItem.ew_total_span,
        ns_span_structure: cloudItem.ns_span_structure,
        ew_span_structure: cloudItem.ew_span_structure,
        north_gap: cloudItem.north_gap,
        south_gap: cloudItem.south_gap,
        east_gap: cloudItem.east_gap,
        west_gap: cloudItem.west_gap,
        num_stages: cloudItem.num_stages,
        modules_count: cloudItem.modules_count,
        jack_up_height: cloudItem.jack_up_height,
        first_layer_height: cloudItem.first_layer_height,
        tie_ok: cloudItem.tie_ok,
        tie_column_used: cloudItem.tie_column_used,
      },
    };
  };

  // クラウド履歴を読み込む
  const loadCloudHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('scaffold_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load cloud history:', error);
      } else {
        // クラウドデータをローカル形式に変換
        const convertedData = (data || []).map(convertCloudToLocal);
        setCloudHistory(convertedData);
      }
    } catch (error) {
      console.error('Failed to load cloud history:', error);
    }
  }, [user]);

  // 履歴を読み込む
  const loadHistory = useCallback(async () => {
    try {
      console.log('📥 Starting loadHistory...');
      // ローカル履歴は常に読み込む
      await loadLocalHistory();
      console.log('✅ Local history loaded');
      
      // クラウド履歴は5秒でタイムアウト
      if (user) {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Cloud history timeout')), 5000)
        );
        
        try {
          await Promise.race([loadCloudHistory(), timeoutPromise]);
          console.log('✅ Cloud history loaded');
        } catch (cloudError) {
          console.warn('Cloud history failed or timed out:', cloudError);
          // クラウド履歴が失敗してもローカル履歴は表示する
        }
      }
      console.log('✅ loadHistory completed');
    } catch (error) {
      console.error('Failed to load history:', error);
      Alert.alert(ja.common.error, '履歴の読み込みに失敗しました');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadLocalHistory, loadCloudHistory, user]);

  // フィルターを適用
  const applyFilters = useCallback((data: CalculationHistory[], currentFilter: HistoryFilter) => {
    console.log('🔍 applyFilters called with:', data.length, 'items');
    let filtered = [...data];

    // 検索フィルター
    if (currentFilter.searchTerm) {
      const searchLower = currentFilter.searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const frameSize = HistoryStorage.getFrameSizeText(item.inputData);
        const date = HistoryStorage.formatDate(item.createdAt);
        const roofShape = ja.input.roofShapes[item.inputData.roofShape];
        
        return (
          frameSize.toLowerCase().includes(searchLower) ||
          date.toLowerCase().includes(searchLower) ||
          roofShape.toLowerCase().includes(searchLower) ||
          (item.title && item.title.toLowerCase().includes(searchLower))
        );
      });
    }

    // 期間フィルター
    if (currentFilter.filterBy === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(item => 
        new Date(item.createdAt) >= oneWeekAgo
      );
    }

    // ソート
    if (currentFilter.sortBy === 'date') {
      filtered.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (currentFilter.sortBy === 'size') {
      filtered.sort((a, b) => {
        const aSize = (a.inputData.frameWidth?.northSouth || 0) + (a.inputData.frameWidth?.eastWest || 0);
        const bSize = (b.inputData.frameWidth?.northSouth || 0) + (b.inputData.frameWidth?.eastWest || 0);
        return bSize - aSize;
      });
    }

    console.log('📋 Filtered result:', filtered.length, 'items');
    setFilteredHistory(filtered);
  }, []);

  // デバッグ用：ローカルストレージを直接確認
  const debugStorage = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        console.log('🔍 Web localStorage debug:');
        console.log('All localStorage keys:', Object.keys(localStorage));
        console.log('Target key:', '@scaffai_calculation_history');
        const data = localStorage.getItem('@scaffai_calculation_history');
        console.log('Raw data:', data);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            console.log('Parsed data:', parsed.length, 'items');
            console.log('All IDs:', parsed.map((item: any) => item.id));
          } catch (e) {
            console.log('Parse error:', e);
          }
        }
      } else {
        console.log('🔍 React Native storage debug - using AsyncStorage');
      }
    } catch (error) {
      console.warn('Debug storage failed:', error);
    }
  }, []);

  // 初期読み込み
  useEffect(() => {
    console.log('🚀 History screen initial load');
    debugStorage(); // ストレージ状態をデバッグ
    loadHistory();
  }, [loadHistory, debugStorage]);

  // 画面フォーカス時に履歴を再読み込み
  useFocusEffect(
    useCallback(() => {
      console.log('👀 History screen focused - reloading history');
      loadHistory();
    }, [loadHistory])
  );

  // フィルター変更時の処理
  useEffect(() => {
    console.log('🔧 Filter effect triggered');
    const currentHistory = showCloudHistory ? cloudHistory : localHistory;
    console.log('📊 Current history for filtering:', {
      showCloudHistory,
      cloudHistoryCount: cloudHistory.length,
      localHistoryCount: localHistory.length,
      usingHistoryCount: currentHistory.length
    });
    
    // 履歴が存在する場合のみフィルタリングを実行
    if (currentHistory && Array.isArray(currentHistory)) {
      applyFilters(currentHistory, filter);
    } else {
      console.log('📊 History not ready, setting empty filtered list');
      setFilteredHistory([]);
    }
  }, [localHistory, cloudHistory, showCloudHistory, filter, applyFilters]);

  // リフレッシュ
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHistory();
  }, [loadHistory]);

  // 履歴アイテムを読み込む
  const handleLoadHistory = useCallback(async (item: CalculationHistory | any) => {
    try {
      // 入力データをリセットしてから新しいデータを設定
      resetInputData();
      
      // クラウドの場合は input_data、ローカルの場合は inputData
      const inputData = item.input_data || item.inputData;
      
      if (!inputData) {
        throw new Error('入力データが見つかりません');
      }

      // 各フィールドを正確に設定
      // frameWidth
      if (inputData.frameWidth) {
        setInputValue('frameWidth', 'northSouth', inputData.frameWidth.northSouth);
        setInputValue('frameWidth', 'eastWest', inputData.frameWidth.eastWest);
      }

      // eaveOverhang
      if (inputData.eaveOverhang) {
        setInputValue('eaveOverhang', 'north', inputData.eaveOverhang.north);
        setInputValue('eaveOverhang', 'east', inputData.eaveOverhang.east);
        setInputValue('eaveOverhang', 'south', inputData.eaveOverhang.south);
        setInputValue('eaveOverhang', 'west', inputData.eaveOverhang.west);
      }

      // propertyLine
      if (inputData.propertyLine) {
        setInputValue('propertyLine', 'north', inputData.propertyLine.north);
        setInputValue('propertyLine', 'east', inputData.propertyLine.east);
        setInputValue('propertyLine', 'south', inputData.propertyLine.south);
        setInputValue('propertyLine', 'west', inputData.propertyLine.west);
      }

      // propertyLineDistance
      if (inputData.propertyLineDistance) {
        setInputValue('propertyLineDistance', 'north', inputData.propertyLineDistance.north);
        setInputValue('propertyLineDistance', 'east', inputData.propertyLineDistance.east);
        setInputValue('propertyLineDistance', 'south', inputData.propertyLineDistance.south);
        setInputValue('propertyLineDistance', 'west', inputData.propertyLineDistance.west);
      }

      // targetOffset - 特別な処理が必要
      if (inputData.targetOffset) {
        setInputValue('targetOffset', 'north.enabled', inputData.targetOffset.north?.enabled || false);
        setInputValue('targetOffset', 'north.value', inputData.targetOffset.north?.value || null);
        setInputValue('targetOffset', 'east.enabled', inputData.targetOffset.east?.enabled || false);
        setInputValue('targetOffset', 'east.value', inputData.targetOffset.east?.value || null);
        setInputValue('targetOffset', 'south.enabled', inputData.targetOffset.south?.enabled || false);
        setInputValue('targetOffset', 'south.value', inputData.targetOffset.south?.value || null);
        setInputValue('targetOffset', 'west.enabled', inputData.targetOffset.west?.enabled || false);
        setInputValue('targetOffset', 'west.value', inputData.targetOffset.west?.value || null);
      }

      // specialMaterial
      if (inputData.specialMaterial) {
        setInputValue('specialMaterial', 'northSouth.material355', inputData.specialMaterial.northSouth?.material355);
        setInputValue('specialMaterial', 'northSouth.material300', inputData.specialMaterial.northSouth?.material300);
        setInputValue('specialMaterial', 'northSouth.material150', inputData.specialMaterial.northSouth?.material150);
        setInputValue('specialMaterial', 'eastWest.material355', inputData.specialMaterial.eastWest?.material355);
        setInputValue('specialMaterial', 'eastWest.material300', inputData.specialMaterial.eastWest?.material300);
        setInputValue('specialMaterial', 'eastWest.material150', inputData.specialMaterial.eastWest?.material150);
      }

      // 単一の値
      setInputValue('referenceHeight', '', inputData.referenceHeight);
      setInputValue('roofShape', '', inputData.roofShape);
      setInputValue('hasTieColumns', '', inputData.hasTieColumns);
      setInputValue('eavesHandrails', '', inputData.eavesHandrails);

      // カスタムダイアログを表示
      setShowLoadCompletionDialog(true);
    } catch (error) {
      console.error('Failed to load history item:', error);
      Alert.alert(ja.common.error, '履歴の読み込みに失敗しました');
    }
  }, [resetInputData, setInputValue, router]);

  // 計算結果を表示する
  const handleShowResult = useCallback(async (item: CalculationHistory | any) => {
    try {
      // 計算結果を設定
      const result = item.calculation_result || item.result;
      
      if (!result) {
        Alert.alert('エラー', '計算結果が見つかりません');
        return;
      }

      console.log('📊 Setting calculation result for display:', result);
      setCalculationResult(result);
      
      // 直接結果画面に遷移（確認ダイアログなし）
      router.push('/(drawer)/result');
    } catch (error) {
      console.error('Failed to show result:', error);
      Alert.alert('エラー', '結果表示に失敗しました');
    }
  }, [setCalculationResult, router]);

  // 履歴アイテムを削除
  const handleDeleteHistory = useCallback(async (id: string, item?: any) => {
    console.log('🔥 handleDeleteHistory called with ID:', id);
    
    if (!id) {
      console.log('❌ ID is invalid:', id);
      Alert.alert('エラー', '削除対象のIDが無効です');
      return;
    }

    console.log('✅ ID is valid, starting deletion immediately');
    
    // 削除確認を省略して直接削除を実行（テスト用）
    try {
      console.log('🚀 Starting deletion process...');
      console.log('Deleting history item:', { id, showCloudHistory, user: !!user });
      
      if (showCloudHistory && user) {
        // クラウド履歴の削除
        console.log('Deleting from Supabase, ID:', id);
        const { error } = await supabase
          .from('scaffold_calculations')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Supabase delete error:', error);
          Alert.alert('エラー', `クラウド履歴の削除に失敗しました: ${error.message}`);
          return;
        }
        console.log('Successfully deleted from Supabase');
      } else {
        // ローカル履歴の削除
        console.log('🗂️ Deleting from local storage, ID:', id);
        await HistoryStorage.deleteCalculation(id);
        console.log('✅ Successfully deleted from local storage');
      }
      
      // 履歴を再読み込み
      console.log('🔄 Reloading history after deletion');
      await loadHistory();
      console.log('✅ History reloaded successfully');
      
      Alert.alert('削除完了', '計算履歴を削除しました');
    } catch (error) {
      console.error('❌ Failed to delete history item:', error);
      Alert.alert(ja.common.error, `削除に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [loadHistory, showCloudHistory, user, cloudHistory, localHistory, filter, applyFilters]);

  // 検索文字列の更新
  const handleSearchChange = useCallback((text: string) => {
    setFilter(prev => ({ ...prev, searchTerm: text }));
  }, []);

  // ソート変更
  const toggleSort = useCallback(() => {
    setFilter(prev => ({
      ...prev,
      sortBy: prev.sortBy === 'date' ? 'size' : 'date',
    }));
  }, []);

  // フィルター変更
  const toggleFilter = useCallback(() => {
    setFilter(prev => ({
      ...prev,
      filterBy: prev.filterBy === 'all' ? 'recent' : 'all',
    }));
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <AppHeader title={ja.history.title} />
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={[styles.loadingContainer, dynamicStyles.loadingContainer]}>
          <ActivityIndicator size="large" color={baseColors.primary.main} />
          <Text style={[styles.loadingText, dynamicStyles.loadingText]}>{ja.common.loading}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <AppHeader title={ja.history.title} />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
          {filteredHistory.length}件の計算履歴
        </Text>
        
        {user && (
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !showCloudHistory && styles.toggleButtonActive
              ]}
              onPress={() => setShowCloudHistory(false)}
            >
              <Ionicons 
                name="phone-portrait" 
                size={16} 
                color={!showCloudHistory ? colors.text.primary : colors.text.secondary} 
              />
              <Text style={[
                styles.toggleButtonText,
                dynamicStyles.switchButtonText,
                !showCloudHistory && styles.toggleButtonTextActive,
                { color: colors.text.primary }
              ]}>
                ローカル ({localHistory.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.toggleButton,
                showCloudHistory && styles.toggleButtonActive
              ]}
              onPress={() => setShowCloudHistory(true)}
            >
              <Ionicons 
                name="cloud" 
                size={16} 
                color={showCloudHistory ? colors.text.primary : colors.text.secondary} 
              />
              <Text style={[
                styles.toggleButtonText,
                dynamicStyles.switchButtonText,
                showCloudHistory && styles.toggleButtonTextActive,
                { color: colors.text.primary }
              ]}>
                クラウド ({cloudHistory.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 検索・フィルター */}
      <View style={styles.controls}>
        <View style={[styles.searchContainer, dynamicStyles.searchContainer]}>
          <Ionicons name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={[styles.searchInput, dynamicStyles.searchInput]}
            placeholder={ja.history.searchPlaceholder}
            placeholderTextColor={colors.text.secondary}
            value={filter.searchTerm}
            onChangeText={handleSearchChange}
          />
        </View>
        
        <View style={styles.filterButtons}>
          <TouchableOpacity style={[styles.filterButton, dynamicStyles.filterButton]} onPress={toggleSort}>
            <Ionicons 
              name={filter.sortBy === 'date' ? 'time' : 'resize'} 
              size={16} 
              color={colors.text.primary} 
            />
            <Text style={[styles.filterButtonText, dynamicStyles.filterButtonText, { color: colors.text.primary }]}>
              {filter.sortBy === 'date' ? ja.history.sortByDate : ja.history.sortBySize}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.filterButton, dynamicStyles.filterButton]} onPress={toggleFilter}>
            <Ionicons 
              name={filter.filterBy === 'all' ? 'list' : 'time'} 
              size={16} 
              color={colors.text.primary} 
            />
            <Text style={[styles.filterButtonText, dynamicStyles.filterButtonText, { color: colors.text.primary }]}>
              {filter.filterBy === 'all' ? ja.history.filterAll : ja.history.filterRecent}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 履歴リスト */}
      {filteredHistory.length === 0 ? (
        <View style={[styles.emptyContainer, dynamicStyles.emptyContainer]}>
          <Ionicons name="time-outline" size={64} color={colors.text.secondary} />
          <Text style={[styles.emptyTitle, dynamicStyles.emptyText]}>{ja.history.noHistory}</Text>
          <Text style={[styles.emptyDescription, dynamicStyles.emptySubtext]}>
            {ja.history.noHistoryDescription}
          </Text>
          <TouchableOpacity
            style={[styles.startButton, dynamicStyles.emptyButton]}
            onPress={() => router.push('/(drawer)/input')}
          >
            <Text style={[styles.startButtonText, dynamicStyles.emptyButtonText]}>計算を始める</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <HistoryCard
              item={item}
              onLoad={handleLoadHistory}
              onDelete={handleDeleteHistory}
              onShowResult={handleShowResult}
              isCloudItem={showCloudHistory}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[baseColors.primary.main]}
              tintColor={baseColors.primary.main}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 履歴読み込み完了ダイアログ */}
      <LoadCompletionDialog
        visible={showLoadCompletionDialog}
        onClose={() => setShowLoadCompletionDialog(false)}
        onGoToInput={() => {
          setShowLoadCompletionDialog(false);
          router.push('/(drawer)/input');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  toggleButtonActive: {
  },
  toggleButtonText: {
    fontSize: 12,
    marginLeft: 6,
  },
  toggleButtonTextActive: {
    fontWeight: '600',
  },
  controls: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});