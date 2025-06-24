import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as baseColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { useScaffold } from '../context/ScaffoldContext';

interface UsageStatusBarProps {
  onUpgradePress?: () => void;
}

export const UsageStatusBar: React.FC<UsageStatusBarProps> = ({ onUpgradePress }) => {
  const { colors } = useTheme();
  const { 
    userPlan, 
    remainingCalculations, 
    remainingQuickAllocations,
    canUseCalculator 
  } = useScaffold();

  // Free プランでない場合は何も表示しない
  if (userPlan !== 'free') {
    return null;
  }

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.background.card,
      borderBottomColor: colors.border.main,
    },
    text: {
      color: colors.text.primary,
    },
    subText: {
      color: colors.text.secondary,
    },
  });

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'free': return 'Free';
      case 'plus': return 'Plus';
      case 'pro': return 'Pro';
      case 'max': return 'Max';
      default: return plan;
    }
  };

  const isLimitReached = (remaining: number | null) => {
    return remaining !== null && remaining <= 0;
  };

  const getLimitColor = (remaining: number | null) => {
    if (remaining === null) return colors.text.primary; // unlimited
    if (remaining <= 0) return baseColors.error;
    if (remaining <= 5) return baseColors.warning;
    return colors.text.primary;
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <View style={styles.content}>
        <View style={styles.info}>
          <View style={styles.planBadge}>
            <Text style={styles.planText}>{getPlanDisplayName(userPlan)}</Text>
          </View>
          
          <View style={styles.usageInfo}>
            <View style={styles.usageItem}>
              <Text style={[styles.usageLabel, dynamicStyles.subText]}>計算</Text>
              <Text style={[
                styles.usageValue,
                { color: getLimitColor(remainingCalculations) }
              ]}>
                {remainingCalculations !== null ? `${remainingCalculations}回` : '無制限'}
              </Text>
            </View>
            
            <View style={styles.usageItem}>
              <Text style={[styles.usageLabel, dynamicStyles.subText]}>簡易割付</Text>
              <Text style={[
                styles.usageValue,
                { color: getLimitColor(remainingQuickAllocations) }
              ]}>
                {remainingQuickAllocations !== null ? `${remainingQuickAllocations}回` : '無制限'}
              </Text>
            </View>

            {!canUseCalculator && (
              <View style={styles.usageItem}>
                <Text style={[styles.usageLabel, dynamicStyles.subText]}>電卓機能</Text>
                <Text style={[styles.usageValue, { color: baseColors.error }]}>
                  利用不可
                </Text>
              </View>
            )}
          </View>
        </View>

        {onUpgradePress && (
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgradePress}>
            <Ionicons name="arrow-up-circle" size={16} color="#fff" />
            <Text style={styles.upgradeText}>アップグレード</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planBadge: {
    backgroundColor: baseColors.primary.main,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  usageInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  usageItem: {
    alignItems: 'center',
  },
  usageLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  usageValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  upgradeButton: {
    backgroundColor: baseColors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  upgradeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});