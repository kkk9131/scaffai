'use client';

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';
import { colors as baseColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useScaffold } from '../../context/ScaffoldContext';
import { usePurchase } from '../../context/PurchaseContext';
import { Ionicons } from '@expo/vector-icons';
import { PLAN_LIMITS, type UserPlan } from '../../utils/usageManager';
import { PlanComparisonModal } from '../../components/PlanComparisonModal';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInRight,
  BounceIn,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';

const planDetails = {
  free: {
    name: 'Free',
    price: '0円',
    period: '永続無料',
    color: baseColors.secondary.main,
    gradient: ['#6B7280', '#9CA3AF'],
    features: [
      '基本足場計算',
      '簡易割付機能',
      'ローカル保存',
      '月15回の計算制限',
      '月30回の簡易割付制限'
    ],
    limitations: [
      '電卓機能なし',
      'クラウド同期なし',
      'Web版アクセスなし'
    ],
    popular: false,
    subtitle: 'お試し版',
    icon: 'gift-outline'
  },
  plus: {
    name: 'Plus',
    price: '¥500',
    period: '月額',
    color: baseColors.primary.main,
    gradient: ['#3B82F6', '#60A5FA'],
    features: [
      '無制限計算・簡易割付',
      '基本的な電卓機能',
      'ローカル保存',
      '履歴保存（30日間）'
    ],
    limitations: [
      'クラウド同期なし',
      'Web版アクセスなし'
    ],
    popular: true,
    subtitle: 'お手軽プラン',
    icon: 'flash'
  },
  pro: {
    name: 'Pro',
    price: '¥4,980',
    period: '月額',
    color: baseColors.accent.purple,
    gradient: ['#8B5CF6', '#A78BFA'],
    features: [
      'Plusの全機能',
      'クラウド保存・同期',
      'Web版アクセス',
      'アプリ内作図機能',
      'プロジェクト管理',
      '無制限履歴保存'
    ],
    limitations: [],
    popular: false,
    subtitle: 'プロフェッショナル',
    icon: 'business'
  },
  max: {
    name: 'Max',
    price: '¥12,800',
    period: '月額',
    color: baseColors.accent.orange,
    gradient: ['#F59E0B', '#FBBF24'],
    features: [
      'Proの全機能',
      'CAD連携・出力',
      'API連携',
      '優先技術サポート',
      '企業向け機能'
    ],
    limitations: [],
    popular: false,
    subtitle: 'エンタープライズ',
    icon: 'diamond'
  }
};

export default function PlanManagement() {
  const router = useRouter();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<UserPlan>('free');
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Get contexts directly (this is the proper way to use hooks)
  const { 
    userPlan, 
    remainingCalculations, 
    remainingQuickAllocations,
    upgradePlan
  } = useScaffold();
  
  const { restorePurchases, isLoading: purchaseLoading, isConfigured } = usePurchase();

  // Initialize with error handling
  useEffect(() => {
    try {
      console.log('🔧 [PlanManagement] Initializing contexts...');
      console.log('🔧 [PlanManagement] Current user plan:', userPlan);
      if (userPlan) {
        setSelectedPlan(userPlan);
      }
      setIsLoading(false);
    } catch (err) {
      console.error('❌ [PlanManagement] Context initialization error:', err);
      setError(`Context initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [userPlan]);

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.background.primary,
    },
    section: {
      backgroundColor: colors.background.card,
    },
    text: {
      color: colors.text.primary,
    },
    subText: {
      color: colors.text.secondary,
    }
  });

  // プランの階層を定義
  const planHierarchy: Record<UserPlan, number> = {
    free: 0,
    plus: 1,
    pro: 2,
    max: 3,
  };

  // プランが上位か下位かを判定
  const isUpgrade = (fromPlan: UserPlan, toPlan: UserPlan) => {
    return planHierarchy[toPlan] > planHierarchy[fromPlan];
  };

  const handlePlanChange = async (newPlan: UserPlan) => {
    try {
      if (!upgradePlan) {
        throw new Error('プラン変更機能が利用できません');
      }

      if (newPlan === userPlan) {
        Alert.alert('現在のプラン', `既に${planDetails[newPlan].name}プランをご利用中です。`);
        return;
      }

      const isUpgradeAction = isUpgrade(userPlan || 'free', newPlan);
      const actionText = isUpgradeAction ? 'アップグレード' : 'ダウングレード';
      const warningText = !isUpgradeAction ? 
        '\n\n⚠️ ダウングレードすると一部機能が制限されます。' : '';

      Alert.alert(
        `プラン${actionText}の確認`,
        `${planDetails[newPlan].name}プラン（${planDetails[newPlan].price}/${planDetails[newPlan].period}）に${actionText}しますか？${warningText}\n\n※実際の決済は後日実装予定です。テスト用に変更します。`,
        [
          { text: 'キャンセル', style: 'cancel' },
          { 
            text: actionText, 
            style: isUpgradeAction ? 'default' : 'destructive',
            onPress: async () => {
              try {
                await upgradePlan(newPlan);
                setSelectedPlan(newPlan);
                Alert.alert(
                  `${actionText}完了`,
                  `${planDetails[newPlan].name}プランに${actionText}しました！\n\n${isUpgradeAction ? '新しい機能をお楽しみください。' : '制限された機能については、再度アップグレードすることで利用できます。'}`
                );
              } catch (error) {
                console.error('Plan change error:', error);
                Alert.alert('エラー', 'プランの変更に失敗しました。');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Handle plan change error:', error);
      Alert.alert('エラー', 'プランの変更処理でエラーが発生しました。');
    }
  };

  const UsageSection = () => {
    // Freeプラン以外では使用状況セクションを非表示
    if (userPlan !== 'free') {
      return null;
    }

    return (
      <View style={[styles.section, dynamicStyles.section]}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>今月の使用状況</Text>
        
        <View style={styles.usageGrid}>
          <View style={styles.usageCard}>
            <Text style={[styles.usageLabel, dynamicStyles.subText]}>計算実行</Text>
            <Text style={[styles.usageValue, dynamicStyles.text]}>
              {remainingCalculations !== null ? `残り${remainingCalculations}回` : '無制限'}
            </Text>
            <View style={[
              styles.usageBar,
              { backgroundColor: colors.border.main }
            ]}>
              {remainingCalculations !== null && (
                <View style={[
                  styles.usageBarFill,
                  { 
                    backgroundColor: remainingCalculations > 5 ? baseColors.success : baseColors.warning,
                    width: `${(remainingCalculations / 15) * 100}%`
                  }
                ]} />
              )}
            </View>
          </View>

          <View style={styles.usageCard}>
            <Text style={[styles.usageLabel, dynamicStyles.subText]}>簡易割付</Text>
            <Text style={[styles.usageValue, dynamicStyles.text]}>
              {remainingQuickAllocations !== null ? `残り${remainingQuickAllocations}回` : '無制限'}
            </Text>
            <View style={[
              styles.usageBar,
              { backgroundColor: colors.border.main }
            ]}>
              {remainingQuickAllocations !== null && (
                <View style={[
                  styles.usageBarFill,
                  { 
                    backgroundColor: remainingQuickAllocations > 10 ? baseColors.success : baseColors.warning,
                    width: `${(remainingQuickAllocations / 30) * 100}%`
                  }
                ]} />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

    const CurrentPlanSection = () => {
    // userPlanが有効でない場合のデフォルト値
    const currentPlan = userPlan && planDetails[userPlan as keyof typeof planDetails] ? userPlan : 'free';
    const currentPlanDetails = planDetails[currentPlan as keyof typeof planDetails];
    
    return (
      <View style={[styles.section, dynamicStyles.section]}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>現在のプラン</Text>
        
        <View style={[
          styles.currentPlanCard,
          { borderColor: currentPlanDetails.color }
        ]}>
          <View style={styles.planHeader}>
            <View style={[
              styles.planBadge,
              { backgroundColor: currentPlanDetails.color }
            ]}>
              <Text style={styles.planBadgeText}>{currentPlanDetails.name}</Text>
            </View>
            <View style={styles.planPricing}>
              <Text style={[styles.planPrice, dynamicStyles.text]}>
                {currentPlanDetails.price}
              </Text>
              <Text style={[styles.planPeriod, dynamicStyles.subText]}>
                {currentPlanDetails.period}
              </Text>
            </View>
          </View>

          <View style={styles.planFeatures}>
            {currentPlanDetails.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={baseColors.success} />
                <Text style={[styles.featureText, dynamicStyles.text]}>{feature}</Text>
              </View>
            ))}
            
            {currentPlanDetails.limitations?.map((limitation, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="close-circle" size={16} color={baseColors.error} />
                <Text style={[styles.featureText, dynamicStyles.subText]}>{limitation}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const PlanComparisonSection = () => {
    // アニメーション用の共有値
    const popularBadgeScale = useSharedValue(1);
    const popularBadgeRotation = useSharedValue(0);
    
    // 人気バッジのアニメーション
    React.useEffect(() => {
      popularBadgeScale.value = withRepeat(
        withSequence(
          withSpring(1.1, { duration: 1000 }),
          withSpring(1, { duration: 1000 })
        ),
        -1,
        true
      );
      
      popularBadgeRotation.value = withRepeat(
        withSequence(
          withSpring(-2, { duration: 500 }),
          withSpring(2, { duration: 500 }),
          withSpring(0, { duration: 500 })
        ),
        -1,
        true
      );
    }, []);
    
    const popularBadgeStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { scale: popularBadgeScale.value },
          { rotate: `${popularBadgeRotation.value}deg` }
        ],
      };
    });
    
    return (
      <Animated.View 
        entering={FadeInUp.delay(200).duration(800)}
        style={[styles.section, dynamicStyles.section]}
      >
        <Animated.Text 
          entering={FadeInDown.delay(100).duration(600)}
          style={[styles.sectionTitle, dynamicStyles.text]}
        >
          プラン比較
        </Animated.Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plansScroll}>
          {(Object.keys(planDetails) as UserPlan[]).map((plan, index) => {
            const details = planDetails[plan];
            const isCurrentPlan = plan === userPlan;
            
            // プランごとの入場アニメーション遅延
            const delay = index * 150;
            
            return (
              <Animated.View 
                key={plan}
                entering={SlideInRight.delay(delay + 300).duration(700).springify()}
                style={[
                  styles.planComparisonCard,
                  { backgroundColor: colors.background.paper },
                  isCurrentPlan && { 
                    borderColor: details.color, 
                    borderWidth: 3,
                    shadowColor: details.color,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 8,
                  },
                  details.popular && !isCurrentPlan && {
                    borderColor: details.color,
                    borderWidth: 2,
                    shadowColor: details.color,
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.2,
                    shadowRadius: 10,
                    elevation: 6,
                  }
                ]}
              >
                {details.popular && (
                  <Animated.View 
                    style={[
                      styles.popularBadge, 
                      { 
                        backgroundColor: details.color,
                        shadowColor: details.color,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 6,
                      },
                      popularBadgeStyle
                    ]}
                  >
                    <Animated.View 
                      entering={BounceIn.delay(delay + 800).duration(1000)}
                      style={styles.popularBadgeContent}
                    >
                      <Ionicons name="star" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.popularText}>人気</Text>
                    </Animated.View>
                  </Animated.View>
                )}
                
                {isCurrentPlan && (
                  <Animated.View 
                    entering={FadeInDown.delay(delay + 600).duration(800)}
                    style={[
                      styles.currentPlanBadge, 
                      { backgroundColor: details.color }
                    ]}
                  >
                    <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.currentPlanText}>利用中</Text>
                  </Animated.View>
                )}
                
                <Animated.View 
                  entering={FadeInUp.delay(delay + 500).duration(600)}
                  style={styles.planComparisonHeader}
                >
                  <Animated.View 
                    entering={BounceIn.delay(delay + 400).duration(1000)}
                    style={[
                      styles.planIconContainer,
                      { backgroundColor: details.color }
                    ]}
                  >
                    <Ionicons 
                      name={details.icon as any} 
                      size={24} 
                      color="#FFFFFF" 
                    />
                  </Animated.View>
                  
                  <Text style={[styles.planComparisonName, dynamicStyles.text]}>
                    {details.name}
                  </Text>
                  
                  <Text style={[styles.planSubtitle, { color: details.color }]}>
                    {details.subtitle}
                  </Text>
                  
                  <Animated.Text 
                    entering={BounceIn.delay(delay + 700).duration(800)}
                    style={[
                      styles.planComparisonPrice, 
                      { 
                        color: details.color,
                        fontWeight: '900',
                        fontSize: details.popular ? 28 : 24,
                        textShadowColor: details.color,
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }
                    ]}
                  >
                    {details.price}
                  </Animated.Text>
                  <Text style={[styles.planComparisonPeriod, dynamicStyles.subText]}>
                    {details.period}
                  </Text>
                </Animated.View>

                <Animated.View 
                  entering={FadeInUp.delay(delay + 800).duration(600)}
                  style={styles.planComparisonFeatures}
                >
                  {details.features.slice(0, 3).map((feature, featureIndex) => (
                    <Animated.View 
                      key={featureIndex}
                      entering={FadeInRight.delay(delay + 900 + featureIndex * 100).duration(500)}
                      style={styles.comparisonFeatureItem}
                    >
                      <Ionicons name="checkmark-circle" size={14} color={baseColors.success} />
                      <Text style={[styles.comparisonFeatureText, dynamicStyles.text]}>
                        {feature}
                      </Text>
                    </Animated.View>
                  ))}
                  {details.features.length > 3 && (
                    <Animated.Text 
                      entering={FadeInUp.delay(delay + 1200).duration(500)}
                      style={[styles.moreFeatures, dynamicStyles.subText]}
                    >
                      +{details.features.length - 3}つの機能
                    </Animated.Text>
                  )}
                </Animated.View>

                <Animated.View
                  entering={BounceIn.delay(delay + 1000).duration(800)}
                >
                  <TouchableOpacity
                    style={[
                      styles.planActionButton,
                      isCurrentPlan 
                        ? { 
                            backgroundColor: colors.background.paper,
                            borderWidth: 2,
                            borderColor: details.color,
                          }
                        : { 
                            backgroundColor: details.color,
                            shadowColor: details.color,
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.4,
                            shadowRadius: 10,
                            elevation: 6,
                          }
                    ]}
                    onPress={() => !isCurrentPlan && handlePlanChange(plan)}
                    disabled={isCurrentPlan}
                    activeOpacity={isCurrentPlan ? 1 : 0.8}
                  >
                    {!isCurrentPlan && (
                      <Ionicons 
                        name={isUpgrade(userPlan || 'free', plan) ? 'arrow-up' : 'arrow-down'} 
                        size={16} 
                        color="#FFFFFF" 
                        style={{ marginRight: 6 }} 
                      />
                    )}
                    <Text style={[
                      styles.planActionText,
                      { 
                        color: isCurrentPlan ? details.color : '#FFFFFF',
                        fontWeight: '700',
                      }
                    ]}>
                      {isCurrentPlan ? '利用中' : 
                       isUpgrade(userPlan || 'free', plan) ? 'アップグレード' : 'ダウングレード'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>
            );
          })}
        </ScrollView>
      </Animated.View>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <AppHeader 
          title="プラン管理" 
          showBackButton 
          onBackPress={() => router.back()} 
        />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, dynamicStyles.text]}>読み込み中...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, dynamicStyles.container]}>
        <AppHeader 
          title="プラン管理" 
          showBackButton 
          onBackPress={() => router.back()} 
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={baseColors.error} />
          <Text style={[styles.errorTitle, { color: baseColors.error }]}>エラーが発生しました</Text>
          <Text style={[styles.errorText, dynamicStyles.subText]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: baseColors.primary.main }]}
            onPress={() => {
              setError(null);
              setIsLoading(true);
              // Retry initialization
              setTimeout(() => {
                setIsLoading(false);
              }, 1000);
            }}
          >
            <Text style={styles.retryButtonText}>再試行</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <AppHeader 
        title="プラン管理" 
        showBackButton 
        onBackPress={() => router.back()} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <UsageSection />
        <CurrentPlanSection />
        <PlanComparisonSection />
        
        {/* アクション・設定セクション */}
        <View style={[styles.section, dynamicStyles.section]}>
          <Text style={[styles.sectionTitle, dynamicStyles.text]}>アクション</Text>
          
          {/* ホームに戻るボタン */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: baseColors.success }]}
            onPress={() => router.push('/(drawer)')}
          >
            <Ionicons name="home" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>ホームに戻る</Text>
          </TouchableOpacity>
          
          {/* 詳細比較ボタン */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: baseColors.primary.main }]}
            onPress={() => setShowComparisonModal(true)}
          >
            <Ionicons name="list" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>詳細機能比較を見る</Text>
          </TouchableOpacity>
          
          
          {/* 設定状態表示 */}
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Ionicons 
                name={isConfigured ? "checkmark-circle" : "alert-circle"} 
                size={16} 
                color={isConfigured ? baseColors.success : baseColors.warning} 
              />
              <Text style={[styles.statusText, dynamicStyles.subText]}>
                決済システム: {isConfigured ? '設定済み' : '開発モード'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* プラン比較モーダル */}
      <PlanComparisonModal
        visible={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        onSelectPlan={(plan) => {
          setSelectedPlan(plan);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  
  // Usage Section
  usageGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  usageCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  usageLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  usageValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  usageBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  usageBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  
  // Current Plan Section
  currentPlanCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  planPeriod: {
    fontSize: 12,
  },
  planFeatures: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  
  // Plan Comparison Section
  plansScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  planComparisonCard: {
    width: 220,
    padding: 20,
    borderRadius: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
    minHeight: 300,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 12,
    right: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 20,
    alignItems: 'center',
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  popularBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  currentPlanBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  currentPlanText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  planComparisonHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 16,
  },
  planIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  planComparisonName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  planSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
    letterSpacing: 0.3,
  },
  planComparisonPrice: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  planComparisonPeriod: {
    fontSize: 11,
    opacity: 0.7,
  },
  planComparisonFeatures: {
    gap: 8,
    marginBottom: 20,
    minHeight: 100,
    paddingHorizontal: 4,
  },
  comparisonFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  comparisonFeatureText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  moreFeatures: {
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 6,
    opacity: 0.7,
    fontWeight: '500',
  },
  planActionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
    minHeight: 48,
  },
  planActionText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  
  bottomSpacer: {
    height: 32,
  },
  
  // アクションボタン
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // 設定状態表示
  statusContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
  },
  
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 24,
  },
  retryButton: {
    padding: 16,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});