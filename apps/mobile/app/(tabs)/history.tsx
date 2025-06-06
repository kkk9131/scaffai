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
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { ja } from '../../constants/translations';
import { CalculationHistory, HistoryFilter } from '../../types/history';
import { HistoryStorage } from '../../utils/storage';
import { HistoryCard } from '../../components/HistoryCard';
import { useScaffold } from '../../context/ScaffoldContext';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../context/AuthContext';

export default function HistoryScreen() {
  const [localHistory, setLocalHistory] = useState<CalculationHistory[]>([]);
  const [cloudHistory, setCloudHistory] = useState<any[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCloudHistory, setShowCloudHistory] = useState(false);
  const [filter, setFilter] = useState<HistoryFilter>({
    searchTerm: '',
    sortBy: 'date',
    filterBy: 'all',
  });

  const router = useRouter();
  const { setInputValue, resetInputData } = useScaffold();
  const { user } = useAuthContext();

  // ローカル履歴を読み込む
  const loadLocalHistory = useCallback(async () => {
    try {
      const historyData = await HistoryStorage.getHistory();
      setLocalHistory(historyData);
    } catch (error) {
      console.error('Failed to load local history:', error);
    }
  }, []);

  // Supabaseデータをローカル形式に変換
  const convertCloudToLocal = (cloudItem: any) => {
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
      await Promise.all([loadLocalHistory(), loadCloudHistory()]);
    } catch (error) {
      console.error('Failed to load history:', error);
      Alert.alert(ja.common.error, '履歴の読み込みに失敗しました');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadLocalHistory, loadCloudHistory]);

  // フィルターを適用
  const applyFilters = useCallback((data: CalculationHistory[], currentFilter: HistoryFilter) => {
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

    setFilteredHistory(filtered);
  }, []);

  // 初期読み込み
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // フィルター変更時の処理
  useEffect(() => {
    const currentHistory = showCloudHistory ? cloudHistory : localHistory;
    applyFilters(currentHistory, filter);
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
      
      // 各フィールドを設定
      Object.entries(inputData).forEach(([category, value]) => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          Object.entries(value).forEach(([field, fieldValue]) => {
            setInputValue(category as any, field, fieldValue);
          });
        } else {
          setInputValue(category as any, '', value);
        }
      });

      Alert.alert(
        '履歴読み込み完了',
        '入力データが復元されました。入力画面で確認できます。',
        [
          {
            text: '入力画面へ',
            onPress: () => router.push('/(tabs)/input'),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Failed to load history item:', error);
      Alert.alert(ja.common.error, '履歴の読み込みに失敗しました');
    }
  }, [resetInputData, setInputValue, router]);

  // 履歴アイテムを削除
  const handleDeleteHistory = useCallback(async (id: string, item?: any) => {
    Alert.alert(
      '削除確認',
      'この計算履歴を削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              if (showCloudHistory && user) {
                // クラウド履歴の削除
                const { error } = await supabase
                  .from('scaffold_calculations')
                  .delete()
                  .eq('id', id);

                if (error) {
                  Alert.alert('エラー', '削除に失敗しました');
                  return;
                }
              } else {
                // ローカル履歴の削除
                await HistoryStorage.deleteCalculation(id);
              }
              
              await loadHistory();
              Alert.alert('削除完了', '計算履歴を削除しました');
            } catch (error) {
              console.error('Failed to delete history item:', error);
              Alert.alert(ja.common.error, '削除に失敗しました');
            }
          },
        },
      ]
    );
  }, [loadHistory, showCloudHistory, user]);

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
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>{ja.common.loading}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>{ja.history.title}</Text>
        <Text style={styles.subtitle}>
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
                !showCloudHistory && styles.toggleButtonTextActive
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
                showCloudHistory && styles.toggleButtonTextActive
              ]}>
                クラウド ({cloudHistory.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 検索・フィルター */}
      <View style={styles.controls}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={ja.history.searchPlaceholder}
            placeholderTextColor={colors.text.secondary}
            value={filter.searchTerm}
            onChangeText={handleSearchChange}
          />
        </View>
        
        <View style={styles.filterButtons}>
          <TouchableOpacity style={styles.filterButton} onPress={toggleSort}>
            <Ionicons 
              name={filter.sortBy === 'date' ? 'time' : 'resize'} 
              size={16} 
              color={colors.text.primary} 
            />
            <Text style={styles.filterButtonText}>
              {filter.sortBy === 'date' ? ja.history.sortByDate : ja.history.sortBySize}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.filterButton} onPress={toggleFilter}>
            <Ionicons 
              name={filter.filterBy === 'all' ? 'list' : 'time'} 
              size={16} 
              color={colors.text.primary} 
            />
            <Text style={styles.filterButtonText}>
              {filter.filterBy === 'all' ? ja.history.filterAll : ja.history.filterRecent}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 履歴リスト */}
      {filteredHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color={colors.text.secondary} />
          <Text style={styles.emptyTitle}>{ja.history.noHistory}</Text>
          <Text style={styles.emptyDescription}>
            {ja.history.noHistoryDescription}
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/(tabs)/input')}
          >
            <Text style={styles.startButtonText}>計算を始める</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => showCloudHistory ? item.id.toString() : item.id}
          renderItem={({ item }) => (
            <HistoryCard
              item={item}
              onLoad={handleLoadHistory}
              onDelete={handleDeleteHistory}
              isCloudItem={showCloudHistory}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary.main]}
              tintColor={colors.primary.main}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.dark,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
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
    backgroundColor: colors.primary.main,
  },
  toggleButtonText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 6,
  },
  toggleButtonTextActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  controls: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text.primary,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border.main,
  },
  filterButtonText: {
    fontSize: 12,
    color: colors.text.primary,
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
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  startButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});