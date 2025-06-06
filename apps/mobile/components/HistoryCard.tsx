import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { ja } from '../constants/translations';
import { CalculationHistory } from '../types/history';
import { HistoryStorage } from '../utils/storage';

interface HistoryCardProps {
  item: CalculationHistory | any;
  onLoad: (item: CalculationHistory | any) => void;
  onDelete: (id: string, item?: any) => void;
  isCloudItem?: boolean;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({
  item,
  onLoad,
  onDelete,
  isCloudItem = false,
}) => {
  const handleDelete = () => {
    onDelete(isCloudItem ? item.id : item.id, item);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{getTitle()}</Text>
            {isCloudItem && (
              <View style={styles.cloudBadge}>
                <Ionicons name="cloud" size={12} color={colors.text.primary} />
                <Text style={styles.cloudBadgeText}>クラウド</Text>
              </View>
            )}
          </View>
          <Text style={styles.date}>{formatDate(getCreatedAt())}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{ja.history.frameSize}:</Text>
          <Text style={styles.detailValue}>{getFrameSize()} mm</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{ja.history.totalSpan}:</Text>
          <Text style={styles.detailValue}>{getTotalSpan()} mm</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>屋根形状:</Text>
          <Text style={styles.detailValue}>{getRoofShape()}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.loadButton}
          onPress={() => onLoad(item)}
        >
          <Ionicons name="download-outline" size={16} color={colors.text.primary} />
          <Text style={styles.loadButtonText}>{ja.history.loadButton}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border.main,
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  cloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.light,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  cloudBadgeText: {
    fontSize: 10,
    color: colors.text.primary,
    marginLeft: 2,
  },
  date: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  deleteButton: {
    padding: 4,
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
    color: colors.text.secondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  loadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 6,
  },
  loadButtonText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});