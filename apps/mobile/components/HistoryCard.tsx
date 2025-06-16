import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as baseColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { ja } from '../constants/translations';
import { CalculationHistory } from '../types/history';
import { HistoryStorage } from '../utils/storage';

interface HistoryCardProps {
  item: CalculationHistory | any;
  onLoad: (item: CalculationHistory | any) => void;
  onDelete: (id: string, item?: any) => void;
  onShowResult: (item: CalculationHistory | any) => void;
  isCloudItem?: boolean;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({
  item,
  onLoad,
  onDelete,
  onShowResult,
  isCloudItem = false,
}) => {
  const { colors } = useTheme();
  
  // Dynamic styles using theme colors
  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.background.card,
      borderColor: colors.border.main,
    },
    title: {
      color: colors.text.primary,
    },
    cloudBadge: {
      backgroundColor: baseColors.primary.light,
    },
    cloudBadgeText: {
      color: colors.text.primary,
    },
    date: {
      color: colors.text.secondary,
    },
    detailLabel: {
      color: colors.text.secondary,
    },
    detailValue: {
      color: colors.text.primary,
    },
    loadButton: {
      backgroundColor: baseColors.secondary.main,
    },
    loadButtonText: {
      color: '#FFFFFF',
    },
    showResultButton: {
      backgroundColor: baseColors.primary.main,
    },
    showResultButtonText: {
      color: '#FFFFFF',
    },
  });
  
  const handleDelete = () => {
    console.log('🗑️ HistoryCard handleDelete CLICKED!');
    console.log('HistoryCard handleDelete called with:', { 
      itemId: item.id, 
      isCloudItem, 
      item: JSON.stringify(item, null, 2) 
    });
    
    // アラートで確認
    console.log('🚨 About to call onDelete function');
    
    // IDを確実に文字列として渡す
    const itemId = String(item.id);
    onDelete(itemId, item);
    
    console.log('✅ onDelete function called');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFrameSize = () => {
    const inputData = isCloudItem ? item.input_data : item.inputData;
    const ns = inputData?.frameWidth?.northSouth || 0;
    const ew = inputData?.frameWidth?.eastWest || 0;
    return `${ns} × ${ew}`;
  };

  const getTotalSpan = () => {
    const result = isCloudItem ? item.calculation_result : item.result;
    const nsSpan = result?.ns_total_span || 0;
    const ewSpan = result?.ew_total_span || 0;
    return `${nsSpan} × ${ewSpan}`;
  };

  const getRoofShape = () => {
    const inputData = isCloudItem ? item.input_data : item.inputData;
    const roofShape = inputData?.roofShape;
    if (!roofShape) return '';
    return ja.input.roofShapes[roofShape as keyof typeof ja.input.roofShapes] || '';
  };

  const getCreatedAt = () => {
    return isCloudItem ? item.created_at : item.createdAt;
  };

  const getTitle = () => {
    return isCloudItem ? item.title : (item.title || formatDate(getCreatedAt()));
  };

  const getProjectName = () => {
    const title = isCloudItem ? item.title : item.title;
    return title || `プロジェクト ${formatDate(getCreatedAt())}`;
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <View style={styles.projectNameContainer}>
              <Text style={[styles.projectName]}>{getProjectName()}</Text>
            </View>
            {isCloudItem && (
              <View style={[styles.cloudBadge, dynamicStyles.cloudBadge]}>
                <Ionicons name="cloud" size={12} color={colors.text.primary} />
                <Text style={[styles.cloudBadgeText, dynamicStyles.cloudBadgeText]}>クラウド</Text>
              </View>
            )}
          </View>
          <Text style={[styles.date, dynamicStyles.date]}>{formatDate(getCreatedAt())}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={22} color={baseColors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.loadButton, dynamicStyles.loadButton]}
          onPress={() => onLoad(item)}
        >
          <Ionicons name="download-outline" size={16} color="#FFFFFF" />
          <Text style={[styles.loadButtonText, dynamicStyles.loadButtonText]}>入力読み込み</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.showResultButton, dynamicStyles.showResultButton]}
          onPress={() => onShowResult(item)}
        >
          <Ionicons name="bar-chart-outline" size={16} color="#FFFFFF" />
          <Text style={[styles.showResultButtonText, dynamicStyles.showResultButtonText]}>結果を表示</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  projectNameContainer: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    borderRadius: 6,
    marginRight: 8,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007BFF',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  cloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  cloudBadgeText: {
    fontSize: 10,
    marginLeft: 2,
  },
  date: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
    backgroundColor: 'rgba(255, 0, 0, 0.1)', // テスト用の背景色
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  loadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  loadButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  showResultButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  showResultButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});