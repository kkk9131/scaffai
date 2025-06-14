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
import { HistoryStorage } from '../../utils/storage';
import { CalculationHistory } from '../../types/history';
import { useAuthContext } from '../../context/AuthContext';
import { useScaffold } from '../../context/ScaffoldContext';
import { supabase } from '../../lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  console.log('🏠 [DASHBOARD] HomeScreen component rendering...');
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuthContext();
  const { resetInputData } = useScaffold();
  console.log('🏠 [DASHBOARD] HomeScreen initialized with user:', !!user);
  
  // 統計データの状態
  const [stats, setStats] = useState({
    totalCalculations: 0,
    thisMonthCalculations: 0,
    savedCalculations: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState<CalculationHistory | null>(null);
  
  // 統計データを計算する関数
  const calculateStats = useCallback(async () => {
    try {
      console.log('📊 [DASHBOARD] Starting stats calculation...');
      console.log('📊 [DASHBOARD] Current user:', !!user);
      
      // ローカル履歴を取得
      const localHistory = await HistoryStorage.getHistory();
      console.log('📋 Local history loaded:', localHistory.length, 'items');
      
      // クラウド履歴を取得（ログイン済みの場合）
      let cloudHistory: any[] = [];
      if (user) {
        try {
          const { data, error } = await supabase
            .from('scaffold_calculations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (!error && data) {
            cloudHistory = data;
            console.log('☁️ Cloud history loaded:', cloudHistory.length, 'items');
          }
        } catch (cloudError) {
          console.warn('Cloud history fetch failed:', cloudError);
        }
      }
      
      // 全体の履歴を統合（重複除去は簡単のため省略）
      const allHistory = [...localHistory, ...cloudHistory];
      console.log('📊 Total calculations:', allHistory.length);
      
      // 今月の計算を計算
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthCalculations = allHistory.filter(item => {
        const createdAt = new Date(item.created_at || item.createdAt);
        return createdAt >= thisMonthStart;
      }).length;
      
      // 保存済み計算数（ローカル + クラウド）
      const savedCalculations = localHistory.length + cloudHistory.length;
      
      // 最新のアクティビティを取得
      const latestActivity = allHistory.length > 0 ? allHistory[0] : null;
      
      console.log('📊 [DASHBOARD] Final stats calculated:', {
        total: allHistory.length,
        thisMonth: thisMonthCalculations,
        saved: savedCalculations
      });
      
      console.log('📊 [DASHBOARD] Setting stats state...');
      setStats({
        totalCalculations: allHistory.length,
        thisMonthCalculations: thisMonthCalculations,
        savedCalculations: savedCalculations,
      });
      console.log('📊 [DASHBOARD] Stats state updated!');
      
      if (latestActivity) {
        setRecentActivity(latestActivity);
      }
      
    } catch (error) {
      console.error('Failed to calculate stats:', error);
      // エラー時はデフォルト値を設定
      setStats({
        totalCalculations: 0,
        thisMonthCalculations: 0,
        savedCalculations: 0,
      });
    }
  }, [user]);
  
  // 初期読み込み時に統計を更新
  useEffect(() => {
    console.log('🏠 [DASHBOARD] Component mounted - updating stats');
    calculateStats();
  }, [calculateStats]);
  
  // 画面フォーカス時に統計を更新
  useFocusEffect(
    useCallback(() => {
      console.log('🏠 [DASHBOARD] Screen focused - updating stats');
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
      onPress: () => {
        resetInputData(); // 入力データをリセット
        router.push('/(drawer)/input');
      },
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
      label: '保存済み', 
      value: stats.savedCalculations.toString(), 
      icon: 'bookmark' 
    },
  ];
  
  console.log('📊 [DASHBOARD] Rendering with stats:', stats);
  console.log('📊 [DASHBOARD] StatsCards values:', statsCards.map(s => s.value));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
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
            <Text style={[styles.welcomeText, { color: '#FFFFFF' }]}>おかえりなさい [Debug: Stats={stats.totalCalculations}]</Text>
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

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
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
});