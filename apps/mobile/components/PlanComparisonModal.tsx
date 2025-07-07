import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as baseColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useScaffold } from '../context/ScaffoldContext';
import { usePurchase } from '../context/PurchaseContext';
import { type UserPlan } from '../utils/usageManager';
import { planToProductId } from '../constants/revenueCatPlans';

interface PlanComparisonModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlan?: (plan: UserPlan) => void;
}

const planDetails = {
  free: {
    name: 'Free',
    price: '0円',
    period: '永続無料',
    color: baseColors.secondary.main,
    description: '基本的な足場計算を無料で',
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
    price: '¥500',
    period: '月額',
    color: baseColors.primary.main,
    description: 'お手軽な現場作業プラン',
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
    popular: true
  },
  pro: {
    name: 'Pro',
    price: '¥4,980',
    period: '月額',
    color: baseColors.accent.purple,
    description: '本格的な設計作業プラン',
    features: [
      'Plusの全機能',
      'クラウド保存・同期',
      'Web版アクセス',
      'アプリ内作図機能',
      'プロジェクト管理',
      '無制限履歴保存'
    ],
    limitations: [],
    popular: false
  },
  max: {
    name: 'Max',
    price: '¥12,800', 
    period: '月額',
    color: baseColors.accent.orange,
    description: 'エンタープライズプラン',
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

export const PlanComparisonModal: React.FC<PlanComparisonModalProps> = ({
  visible,
  onClose,
  onSelectPlan
}) => {
  const { colors } = useTheme();
  const { userPlan, upgradePlan } = useScaffold();
  const { offerings, purchasePackage, restorePurchases, isLoading, isConfigured } = usePurchase();

  const dynamicStyles = StyleSheet.create({
    modalContent: {
      backgroundColor: colors.background.primary,
    },
    text: {
      color: colors.text.primary,
    },
    subText: {
      color: colors.text.secondary,
    },
    card: {
      backgroundColor: colors.background.card,
    }
  });

  const handleSelectPlan = async (plan: UserPlan) => {
    if (plan === userPlan) {
      Alert.alert('現在のプラン', `既に${planDetails[plan].name}プランをご利用中です。`);
      return;
    }

    // Freeプランの場合は無料なので直接アップグレード
    if (plan === 'free') {
      await upgradePlan(plan);
      if (onSelectPlan) {
        onSelectPlan(plan);
      }
      onClose();
      return;
    }

    // RevenueCatが設定されていない場合は開発モード
    if (!isConfigured) {
      Alert.alert(
        'プラン変更の確認',
        `${planDetails[plan].name}プラン（${planDetails[plan].price}/${planDetails[plan].period}）にアップグレードしますか？\n\n※開発モード: 実際の決済は行われません。`,
        [
          { text: 'キャンセル', style: 'cancel' },
          { 
            text: 'アップグレード', 
            onPress: async () => {
              try {
                await upgradePlan(plan);
                if (onSelectPlan) {
                  onSelectPlan(plan);
                }
                Alert.alert(
                  'アップグレード完了',
                  `${planDetails[plan].name}プランにアップグレードしました！\n\n※開発モードのため実際の課金は発生していません。`
                );
                onClose();
              } catch (error) {
                Alert.alert('エラー', 'プランの変更に失敗しました。');
              }
            }
          }
        ]
      );
      return;
    }

    // RevenueCatを使用した実際の購入フロー
    try {
      const productId = planToProductId[plan];
      const packageToPurchase = offerings?.availablePackages.find(
        pkg => pkg.product.identifier === productId
      );

      if (!packageToPurchase) {
        Alert.alert('エラー', 'このプランは現在購入できません。');
        return;
      }

      Alert.alert(
        'プラン変更の確認',
        `${planDetails[plan].name}プラン（${packageToPurchase.product.priceString}/${planDetails[plan].period}）を購入しますか？\n\nApp Store/Google Playの決済画面に進みます。`,
        [
          { text: 'キャンセル', style: 'cancel' },
          { 
            text: '購入する', 
            onPress: async () => {
              const success = await purchasePackage(packageToPurchase);
              if (success) {
                if (onSelectPlan) {
                  onSelectPlan(plan);
                }
                onClose();
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('エラー', '購入処理中にエラーが発生しました。');
    }
  };

  const FeatureComparison = () => {
    const allFeatures = [
      { label: '基本計算機能', free: true, plus: true, pro: true, max: true },
      { label: '簡易割付機能', free: true, plus: true, pro: true, max: true },
      { label: 'ローカル保存', free: true, plus: true, pro: true, max: true },
      { label: '無制限使用', free: false, plus: true, pro: true, max: true },
      { label: '電卓機能', free: false, plus: true, pro: true, max: true },
      { label: 'クラウド同期', free: false, plus: false, pro: true, max: true },
      { label: '音声入力', free: false, plus: false, pro: true, max: true },
      { label: 'Web版アクセス', free: false, plus: false, pro: true, max: true },
      { label: '作図機能', free: false, plus: false, pro: true, max: true },
      { label: 'CAD連携', free: false, plus: false, pro: false, max: true },
      { label: 'API連携', free: false, plus: false, pro: false, max: true },
    ];

    return (
      <View style={styles.featureComparison}>
        <Text style={[styles.sectionTitle, dynamicStyles.text]}>機能比較</Text>
        
        <View style={styles.comparisonTable}>
          {/* ヘッダー */}
          <View style={styles.tableHeader}>
            <View style={styles.featureColumn}>
              <Text style={[styles.columnHeader, dynamicStyles.text]}>機能</Text>
            </View>
            {(Object.keys(planDetails) as UserPlan[]).map((plan) => (
              <View key={plan} style={styles.planColumn}>
                <Text style={[styles.columnHeader, { color: planDetails[plan].color }]}>
                  {planDetails[plan].name}
                </Text>
              </View>
            ))}
          </View>

          {/* 機能行 */}
          {allFeatures.map((feature, index) => (
            <View key={index} style={[styles.tableRow, { backgroundColor: colors.background.card }]}>
              <View style={styles.featureColumn}>
                <Text style={[styles.featureLabel, dynamicStyles.text]}>{feature.label}</Text>
              </View>
              <View style={styles.planColumn}>
                <Ionicons 
                  name={feature.free ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={feature.free ? baseColors.success : baseColors.error} 
                />
              </View>
              <View style={styles.planColumn}>
                <Ionicons 
                  name={feature.plus ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={feature.plus ? baseColors.success : baseColors.error} 
                />
              </View>
              <View style={styles.planColumn}>
                <Ionicons 
                  name={feature.pro ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={feature.pro ? baseColors.success : baseColors.error} 
                />
              </View>
              <View style={styles.planColumn}>
                <Ionicons 
                  name={feature.max ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={feature.max ? baseColors.success : baseColors.error} 
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, dynamicStyles.modalContent]}>
        <View style={styles.header}>
          <Text style={[styles.title, dynamicStyles.text]}>プラン比較</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* プランカード */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plansScroll}>
            {(Object.keys(planDetails) as UserPlan[]).map((plan) => {
              const details = planDetails[plan];
              const isCurrentPlan = plan === userPlan;
              
              return (
                <View 
                  key={plan} 
                  style={[
                    styles.planCard,
                    dynamicStyles.card,
                    isCurrentPlan && { borderColor: details.color, borderWidth: 2 }
                  ]}
                >
                  {details.popular && (
                    <View style={[styles.popularBadge, { backgroundColor: details.color }]}>
                      <Text style={styles.popularText}>人気</Text>
                    </View>
                  )}
                  
                  <View style={styles.planHeader}>
                    <Text style={[styles.planName, { color: details.color }]}>
                      {details.name}
                    </Text>
                    <Text style={[styles.planPrice, dynamicStyles.text]}>
                      {details.price}
                    </Text>
                    <Text style={[styles.planPeriod, dynamicStyles.subText]}>
                      {details.period}
                    </Text>
                    <Text style={[styles.planDescription, dynamicStyles.subText]}>
                      {details.description}
                    </Text>
                  </View>

                  <View style={styles.planFeatures}>
                    {details.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Ionicons name="checkmark" size={14} color={baseColors.success} />
                        <Text style={[styles.featureText, dynamicStyles.text]}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      isCurrentPlan 
                        ? { 
                            backgroundColor: colors.background.paper,
                            borderWidth: 2,
                            borderColor: details.color,
                          }
                        : { backgroundColor: details.color }
                    ]}
                    onPress={() => !isCurrentPlan && handleSelectPlan(plan)}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan && (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={16} 
                        color={details.color} 
                        style={{ marginRight: 6 }} 
                      />
                    )}
                    <Text style={[
                      styles.selectButtonText,
                      { color: isCurrentPlan ? details.color : '#FFFFFF' }
                    ]}>
                      {isCurrentPlan ? '使用中' : '選択する'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          <FeatureComparison />
          
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 16,
    marginBottom: 12,
  },
  
  // プランカード
  plansScroll: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  planCard: {
    width: 250,
    padding: 20,
    borderRadius: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    right: 20,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 1,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 14,
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  planFeatures: {
    gap: 8,
    marginBottom: 24,
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
  selectButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // 機能比較テーブル
  featureComparison: {
    margin: 16,
  },
  comparisonTable: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  featureColumn: {
    flex: 2,
    paddingLeft: 16,
    justifyContent: 'center',
  },
  planColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnHeader: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  featureLabel: {
    fontSize: 14,
  },
  
  bottomSpacer: {
    height: 32,
  },
});