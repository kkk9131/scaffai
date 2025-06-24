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

const planDetails = {
  free: {
    name: 'Free',
    price: '0円',
    period: '永続無料',
    color: baseColors.secondary.main,
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
    popular: false
  },
  plus: {
    name: 'Plus',
    price: '4,980円',
    period: '月額',
    color: baseColors.primary.main,
    features: [
      '無制限計算・簡易割付',
      '電卓機能（平面・立面）',
      'クラウド保存・同期',
      '基本的な音声入力',
      '無制限履歴保存'
    ],
    limitations: [],
    popular: true
  },
  pro: {
    name: 'Pro',
    price: '12,800円',
    period: '月額',
    color: baseColors.accent.purple,
    features: [
      'Plusの全機能',
      'Web版アクセス',
      'アプリ内作図機能',
      'プロジェクト管理',
      '高度な計算機能'
    ],
    limitations: [],
    popular: false
  },
  max: {
    name: 'Max',
    price: '24,800円',
    period: '月額',
    color: baseColors.accent.orange,
    features: [
      'Proの全機能',
      'CAD連携・出力',
      'API連携',
      '優先技術サポート',
      '企業向け機能'
    ],
    limitations: [],
    popular: false
  }
};

export default function PlanManagement() {
  const router = useRouter();
  const { colors } = useTheme();
  const { 
    userPlan, 
    remainingCalculations, 
    remainingQuickAllocations,
    upgradePlan
  } = useScaffold();
  
  const { restorePurchases, isLoading, isConfigured } = usePurchase();

  const [selectedPlan, setSelectedPlan] = useState<UserPlan>(userPlan);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  useEffect(() => {
    setSelectedPlan(userPlan);
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

  const handlePlanUpgrade = async (newPlan: UserPlan) => {
    if (newPlan === userPlan) {
      Alert.alert('現在のプラン', `既に${planDetails[newPlan].name}プランをご利用中です。`);
      return;
    }

    Alert.alert(
      'プラン変更の確認',
      `${planDetails[newPlan].name}プラン（${planDetails[newPlan].price}/${planDetails[newPlan].period}）にアップグレードしますか？\n\n※実際の決済は後日実装予定です。テスト用に変更します。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'アップグレード', 
          onPress: async () => {
            try {
              await upgradePlan(newPlan);
              Alert.alert(
                'アップグレード完了',
                `${planDetails[newPlan].name}プランにアップグレードしました！\n\n新しい機能をお楽しみください。`
              );
            } catch (error) {
              Alert.alert('エラー', 'プランの変更に失敗しました。');
            }
          }
        }
      ]
    );
  };

  const UsageSection = () => (
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

  const CurrentPlanSection = () => (
    <View style={[styles.section, dynamicStyles.section]}>
      <Text style={[styles.sectionTitle, dynamicStyles.text]}>現在のプラン</Text>
      
      <View style={[
        styles.currentPlanCard,
        { borderColor: planDetails[userPlan].color }
      ]}>
        <View style={styles.planHeader}>
          <View style={[
            styles.planBadge,
            { backgroundColor: planDetails[userPlan].color }
          ]}>
            <Text style={styles.planBadgeText}>{planDetails[userPlan].name}</Text>
          </View>
          <View style={styles.planPricing}>
            <Text style={[styles.planPrice, dynamicStyles.text]}>
              {planDetails[userPlan].price}
            </Text>
            <Text style={[styles.planPeriod, dynamicStyles.subText]}>
              {planDetails[userPlan].period}
            </Text>
          </View>
        </View>

        <View style={styles.planFeatures}>
          {planDetails[userPlan].features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={baseColors.success} />
              <Text style={[styles.featureText, dynamicStyles.text]}>{feature}</Text>
            </View>
          ))}
          
          {planDetails[userPlan].limitations?.map((limitation, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="close-circle" size={16} color={baseColors.error} />
              <Text style={[styles.featureText, dynamicStyles.subText]}>{limitation}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const PlanComparisonSection = () => (
    <View style={[styles.section, dynamicStyles.section]}>
      <Text style={[styles.sectionTitle, dynamicStyles.text]}>プラン比較</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plansScroll}>
        {(Object.keys(planDetails) as UserPlan[]).map((plan) => {
          const details = planDetails[plan];
          const isCurrentPlan = plan === userPlan;
          
          return (
            <View 
              key={plan} 
              style={[
                styles.planComparisonCard,
                { backgroundColor: colors.background.paper },
                isCurrentPlan && { borderColor: details.color, borderWidth: 2 }
              ]}
            >
              {details.popular && (
                <View style={[styles.popularBadge, { backgroundColor: details.color }]}>
                  <Text style={styles.popularText}>人気</Text>
                </View>
              )}
              
              <View style={styles.planComparisonHeader}>
                <Text style={[styles.planComparisonName, dynamicStyles.text]}>
                  {details.name}
                </Text>
                <Text style={[styles.planComparisonPrice, { color: details.color }]}>
                  {details.price}
                </Text>
                <Text style={[styles.planComparisonPeriod, dynamicStyles.subText]}>
                  {details.period}
                </Text>
              </View>

              <View style={styles.planComparisonFeatures}>
                {details.features.slice(0, 3).map((feature, index) => (
                  <View key={index} style={styles.comparisonFeatureItem}>
                    <Ionicons name="checkmark" size={14} color={baseColors.success} />
                    <Text style={[styles.comparisonFeatureText, dynamicStyles.text]}>
                      {feature}
                    </Text>
                  </View>
                ))}
                {details.features.length > 3 && (
                  <Text style={[styles.moreFeatures, dynamicStyles.subText]}>
                    +{details.features.length - 3}つの機能
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.planActionButton,
                  isCurrentPlan 
                    ? { backgroundColor: colors.border.main }
                    : { backgroundColor: details.color }
                ]}
                onPress={() => !isCurrentPlan && handlePlanUpgrade(plan)}
                disabled={isCurrentPlan}
              >
                <Text style={[
                  styles.planActionText,
                  { color: isCurrentPlan ? colors.text.secondary : '#FFFFFF' }
                ]}>
                  {isCurrentPlan ? '現在のプラン' : 'アップグレード'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

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
          
          {/* 詳細比較ボタン */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: baseColors.primary.main }]}
            onPress={() => setShowComparisonModal(true)}
          >
            <Ionicons name="list" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>詳細機能比較を見る</Text>
          </TouchableOpacity>
          
          {/* 購入復元ボタン（RevenueCat設定時のみ表示） */}
          {isConfigured && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: baseColors.secondary.main }]}
              onPress={() => restorePurchases()}
              disabled={isLoading}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>
                {isLoading ? '復元中...' : '購入を復元'}
              </Text>
            </TouchableOpacity>
          )}
          
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
    width: 200,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 16,
    right: 16,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 1,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planComparisonHeader: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  planComparisonName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planComparisonPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  planComparisonPeriod: {
    fontSize: 12,
  },
  planComparisonFeatures: {
    gap: 6,
    marginBottom: 16,
    minHeight: 80,
  },
  comparisonFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  comparisonFeatureText: {
    fontSize: 12,
    flex: 1,
  },
  moreFeatures: {
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  planActionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  planActionText: {
    fontSize: 14,
    fontWeight: '600',
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
});