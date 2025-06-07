import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { colors as baseColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { ja } from '../../constants/translations';
import { AppHeader } from '../../components/AppHeader';
import { HistoryStorage, CalculationStatsStorage } from '../../utils/storage';
import { CalculationHistory } from '../../types/history';
import { useAuthContext } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  console.log('🏠 [HOME] HomeScreen component rendering...');
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, signOut } = useAuthContext();
  console.log('🏠 [HOME] HomeScreen initialized with user:', !!user);

  
  // 統計データの状態
  const [stats, setStats] = useState({
    totalCalculations: 0,
    thisMonthCalculations: 0,
    savedCalculations: 0,
    localCalculations: 0,
    cloudCalculations: 0,
    thisMonthSaves: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState<CalculationHistory | null>(null);
  
  // 統計データを計算する関数
  const calculateStats = useCallback(async () => {
    try {
      console.log('📊 [HOME] Starting stats calculation...');
      console.log('📊 [HOME] Current user:', !!user);
      
      // 計算統計を取得（計算実行回数）
      const calculationStats = await CalculationStatsStorage.getStats();
      const thisMonthCalculationsFromStats = await CalculationStatsStorage.getThisMonthCalculations();
      console.log('📊 [HOME] Calculation stats loaded:', calculationStats);
      
      // ローカル履歴を取得（保存済み回数）
      console.log('📊 [HOME] About to call HistoryStorage.getHistory()...');
      let localHistory: CalculationHistory[] = [];
      try {
        localHistory = await HistoryStorage.getHistory();
        console.log('📋 [HOME] Local history loaded:', localHistory.length, 'items');
      } catch (localError) {
        console.error('📋 [HOME] Error loading local history:', localError);
        localHistory = [];
      }
      
      // クラウド履歴を取得（ログイン済みの場合） - バックグラウンドで取得
      let cloudHistory: any[] = [];
      if (user) {
        console.log('📊 [HOME] User logged in, attempting background cloud history fetch...');
        // クラウドデータをバックグラウンドで取得（失敗してもメイン処理を継続）
        Promise.resolve()
          .then(async () => {
            try {
              const { data, error } = await supabase
                .from('scaffold_calculations')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);
              
              if (!error && data && data.length > 0) {
                console.log('☁️ [HOME] Background cloud history loaded:', data.length, 'items');
                // 後でstatsを更新する場合はここで再計算可能
              } else {
                console.log('☁️ [HOME] No cloud data or error:', error?.message || 'No data');
              }
            } catch (bgError) {
              console.log('☁️ [HOME] Background cloud fetch failed:', bgError instanceof Error ? bgError.message : String(bgError));
            }
          });
      } else {
        console.log('📊 [HOME] User not logged in, skipping cloud history');
      }
      
      // 今月の保存数を計算（ローカル履歴から）
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      let thisMonthSaves = 0;
      try {
        thisMonthSaves = localHistory.filter(item => {
          const createdAt = new Date(item.createdAt);
          return createdAt >= thisMonthStart;
        }).length;
        console.log('📊 [HOME] This month saves (local only):', thisMonthSaves);
      } catch (dateError) {
        console.error('📊 [HOME] Error calculating this month saves:', dateError);
        thisMonthSaves = 0;
      }
      
      const newStats = {
        totalCalculations: calculationStats.totalCalculations,  // 総計算回数（実行回数）
        thisMonthCalculations: thisMonthCalculationsFromStats,  // 今月の計算回数（実行回数）
        savedCalculations: localHistory.length,  // 総保存数（ローカルのみ）
        localCalculations: localHistory.length,  // ローカル保存数
        cloudCalculations: 0,  // クラウド保存数（後で更新可能）
        thisMonthSaves: thisMonthSaves,  // 今月の保存数
      };
      
      console.log('📊 [HOME] Final calculated stats:', newStats);
      setStats(newStats);
      console.log('📊 [HOME] Stats updated with correct values');
      
      // 最新のアクティビティを取得（ローカル履歴から）
      const latestActivity = localHistory.length > 0 ? localHistory[0] : null;
      console.log('📊 [HOME] Latest activity:', !!latestActivity);
      
      if (latestActivity) {
        setRecentActivity(latestActivity);
      }
      
    } catch (error) {
      console.error('📊 [HOME] ERROR calculating stats:', error);
      console.error('📊 [HOME] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      // エラー時はデフォルト値を設定
      setStats({
        totalCalculations: 0,
        thisMonthCalculations: 0,
        savedCalculations: 0,
        localCalculations: 0,
        cloudCalculations: 0,
        thisMonthSaves: 0,
      });
    }
  }, [user]);
  
  // 初期読み込み時に統計を更新
  useEffect(() => {
    console.log('🏠 [HOME] Component mounted - updating stats');
    calculateStats();
  }, [calculateStats]);
  
  // 画面フォーカス時に統計を更新
  useFocusEffect(
    useCallback(() => {
      console.log('🏠 [HOME] Screen focused - updating stats');
      calculateStats();
    }, [calculateStats])
  );

  const quickActions = [
    {
      id: 'calculate',
      title: '新規計算',
      subtitle: '足場の計算を開始',
      icon: 'calculator',
      color: baseColors.primary.main,
      onPress: () => router.push('/(drawer)/input'),
    },
    {
      id: 'history',
      title: '履歴確認',
      subtitle: '過去の計算結果',
      icon: 'time',
      color: baseColors.secondary.main,
      onPress: () => router.push('/(drawer)/history'),
    },
    {
      id: 'profile',
      title: 'プロフィール',
      subtitle: 'アカウント設定',
      icon: 'person',
      color: baseColors.accent.orange,
      onPress: () => router.push('/(drawer)/profile'),
    },
  ];

  // 統計カードのデータ（実データを使用）
  const statsCards = [
    { 
      label: '総計算回数', 
      value: stats.totalCalculations.toString(), 
      icon: 'analytics' 
    },
    { 
      label: '今月の計算', 
      value: stats.thisMonthCalculations.toString(), 
      icon: 'calendar' 
    },
    { 
      label: '今月の保存', 
      value: stats.thisMonthSaves.toString(), 
      icon: 'bookmark' 
    },
  ];
  
  console.log('📊 [HOME] Rendering with stats:', stats);
  console.log('📊 [HOME] StatsCards values:', statsCards.map(s => s.value));
  console.log('📊 [HOME] Current component state - totalCalculations:', stats.totalCalculations);
  console.log('📊 [HOME] Stats object full:', JSON.stringify(stats));

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <AppHeader title="ホーム" />
      
      {/* ヘッダーグラデーション */}
      <LinearGradient
        colors={isDark 
          ? [baseColors.primary.dark, baseColors.primary.main, colors.background.primary]
          : [baseColors.primary.light, baseColors.primary.main, colors.background.primary]
        }
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={[styles.welcomeText, { color: '#FFFFFF' }]}>おかえりなさい</Text>
            <Text style={[styles.appTitle, { color: '#FFFFFF' }]}>{ja.appName}</Text>
            <Text style={[styles.tagline, { color: 'rgba(255,255,255,0.8)' }]}>プロフェッショナル足場計算ツール</Text>
          </View>
          
          {/* アプリアイコン/ロゴエリア */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="construct" size={32} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 統計カード */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>概要</Text>
          <View style={styles.statsGrid}>
            {statsCards.map((stat, index) => (
              <View key={index} style={[styles.statsCard, { backgroundColor: colors.background.card }]}>
                <Ionicons name={stat.icon as any} size={24} color={baseColors.secondary.main} />
                <Text style={[styles.statsValue, { color: colors.text.primary }]}>{stat.value}</Text>
                <Text style={[styles.statsLabel, { color: colors.text.secondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* クイックアクション */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>クイックアクション</Text>
          <View style={styles.actionsList}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { backgroundColor: colors.background.card }]}
                onPress={action.onPress}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                  <Ionicons name={action.icon as any} size={28} color={action.color} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionTitle, { color: colors.text.primary }]}>{action.title}</Text>
                  <Text style={[styles.actionSubtitle, { color: colors.text.secondary }]}>{action.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* メインCTAボタン */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.primaryCTA}
            onPress={() => router.push('/(drawer)/input')}
          >
            <LinearGradient
              colors={[baseColors.secondary.main, baseColors.secondary.dark]}
              style={styles.ctaGradient}
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.ctaText}>新しい計算を開始</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 最近の活動 */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>最近の活動</Text>
            <TouchableOpacity onPress={() => router.push('/(drawer)/history')}>
              <Text style={[styles.seeAllText, { color: baseColors.primary.main }]}>すべて見る</Text>
            </TouchableOpacity>
          </View>
          
          {recentActivity ? (
            <View style={[styles.recentCard, { backgroundColor: colors.background.card }]}>
              <View style={styles.recentItem}>
                <Ionicons name="checkmark-circle" size={20} color={baseColors.secondary.main} />
                <View style={styles.recentContent}>
                  <Text style={[styles.recentTitle, { color: colors.text.primary }]}>
                    {HistoryStorage.getFrameSizeText(recentActivity.inputData)} 計算完了
                  </Text>
                  <Text style={[styles.recentTime, { color: colors.text.secondary }]}>
                    {HistoryStorage.formatDate(recentActivity.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={[styles.recentCard, { backgroundColor: colors.background.card }]}>
              <View style={styles.recentItem}>
                <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
                <View style={styles.recentContent}>
                  <Text style={[styles.recentTitle, { color: colors.text.secondary }]}>
                    まだ計算履歴がありません
                  </Text>
                  <Text style={[styles.recentTime, { color: colors.text.secondary }]}>
                    新しい計算を開始してください
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>


        {/* 認証状態デバッグ表示 */}
        <View style={styles.debugSection}>
          <View style={[styles.debugInfo, { backgroundColor: colors.background.card }]}>
            <Text style={[styles.debugInfoText, { color: colors.text.primary }]}>
              🔍 認証状態デバッグ情報
            </Text>
            <Text style={[styles.debugInfoText, { color: colors.text.secondary }]}>
              ユーザー: {!!user ? '✅ 認証済み' : '❌ 未認証'}
            </Text>
            <Text style={[styles.debugInfoText, { color: colors.text.secondary }]}>
              signOut: {typeof signOut === 'function' ? '✅ 関数あり' : '❌ 関数なし'}
            </Text>
            <Text style={[styles.debugInfoText, { color: colors.text.secondary }]}>
              ユーザーID: {user?.id || 'なし'}
            </Text>
          </View>
        </View>

        {/* デバッグ用テストボタン */}
        <View style={styles.debugSection}>
          <TouchableOpacity
            style={[styles.debugButton, { backgroundColor: baseColors.secondary.main }]}
            onPress={() => {
              console.log('🧪 [DEBUG] Test button pressed!');
              Alert.alert('テスト', 'ボタンが正常に動作しています');
            }}
          >
            <Text style={styles.debugButtonText}>🧪 テスト: ボタン動作確認</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.debugButton, { backgroundColor: baseColors.warning }]}
            onPress={() => {
              console.log('🧪 [DEBUG] Auth context check...');
              console.log('🧪 [DEBUG] User exists:', !!user);
              console.log('🧪 [DEBUG] signOut function:', typeof signOut);
              Alert.alert('認証状態', `ユーザー: ${!!user ? '認証済み' : '未認証'}\nsignOut関数: ${typeof signOut}`);
            }}
          >
            <Text style={styles.debugButtonText}>🧪 テスト: 認証状態確認</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.debugButton, { backgroundColor: baseColors.error }]}
            onPress={async () => {
              console.log('🧪 [DEBUG] Direct logout test...');
              try {
                if (signOut) {
                  const result = await signOut();
                  console.log('🧪 [DEBUG] Logout result:', result);
                  Alert.alert('ログアウトテスト', `結果: ${result?.error ? 'エラー' : '成功'}`);
                } else {
                  Alert.alert('エラー', 'signOut関数が利用できません');
                }
              } catch (error) {
                console.error('🧪 [DEBUG] Logout error:', error);
                Alert.alert('エラー', `ログアウトエラー: ${error}`);
              }
            }}
          >
            <Text style={styles.debugButtonText}>🧪 テスト: 直接ログアウト</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.debugButton, { backgroundColor: '#FF6B6B' }]}
            onPress={async () => {
              console.log('💥 [DEBUG] Force logout test...');
              try {
                // AsyncStorage を直接クリア
                await AsyncStorage.removeItem('supabase.auth.token');
                console.log('💥 [DEBUG] AsyncStorage auth token cleared');
                
                // 強制的に認証状態をリセット
                window.location.reload();
              } catch (error) {
                console.error('💥 [DEBUG] Force logout error:', error);
                Alert.alert('エラー', `強制ログアウトエラー: ${error}`);
              }
            }}
          >
            <Text style={styles.debugButtonText}>💥 強制ログアウト</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // ヘッダー
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '400',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // スクロール
  scrollView: {
    flex: 1,
  },

  // 統計セクション
  statsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statsCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
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
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    textAlign: 'center',
  },

  // アクションセクション
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  actionsList: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
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
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
  },

  // CTAセクション
  ctaSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  primaryCTA: {
    borderRadius: 16,
    overflow: 'hidden',
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
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // 最近のセクション
  recentSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  recentCard: {
    padding: 16,
    borderRadius: 12,
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
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentContent: {
    marginLeft: 12,
    flex: 1,
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  recentTime: {
    fontSize: 13,
  },

  // その他
  bottomPadding: {
    height: 32,
  },

  // デバッグ用スタイル
  debugSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
  },
  debugInfo: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  debugInfoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  debugButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});