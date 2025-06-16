import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as baseColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

interface GapAdjustmentControlProps {
  label: string;
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  isDisabled?: boolean;
  isDecreaseDisabled?: boolean;
}

export const GapAdjustmentControl: React.FC<GapAdjustmentControlProps> = ({
  label,
  value,
  onIncrease,
  onDecrease,
  isDisabled = false,
  isDecreaseDisabled = false,
}) => {
  const { colors } = useTheme();

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.background.card,
      borderColor: colors.border.main,
    },
    label: {
      color: colors.text.primary,
    },
    value: {
      color: colors.text.primary,
    },
    button: {
      backgroundColor: isDisabled ? colors.background.secondary : baseColors.primary.main,
    },
    buttonDisabled: {
      backgroundColor: colors.background.secondary,
    },
    decreaseButtonDisabled: {
      backgroundColor: colors.background.secondary,
    },
  });

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Text style={[styles.label, dynamicStyles.label]}>{label}</Text>
      
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.button,
            dynamicStyles.button,
            (isDisabled || isDecreaseDisabled) && dynamicStyles.buttonDisabled
          ]}
          onPress={onDecrease}
          disabled={isDisabled || isDecreaseDisabled}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="remove" 
            size={20} 
            color={(isDisabled || isDecreaseDisabled) ? colors.text.disabled : '#FFFFFF'} 
          />
        </TouchableOpacity>
        
        <View style={styles.valueContainer}>
          <Text style={[styles.value, dynamicStyles.value]}>
            {value} mm
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.button,
            dynamicStyles.button,
            isDisabled && dynamicStyles.buttonDisabled
          ]}
          onPress={onIncrease}
          disabled={isDisabled}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="add" 
            size={20} 
            color={isDisabled ? colors.text.disabled : '#FFFFFF'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContainer: {
    minWidth: 80,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
});