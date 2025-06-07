import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors as baseColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

type ResultCardProps = {
  title: string;
  value: string | number;
  suffix?: string;
  delay?: number;
};

export const ResultCard: React.FC<ResultCardProps> = ({
  title,
  value,
  suffix,
  delay = 0,
}) => {
  const { colors } = useTheme();
  
  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.background.paper,
      borderLeftColor: baseColors.primary.main,
    },
    title: {
      color: colors.text.primary,
    },
    value: {
      color: colors.text.primary,
    },
    suffix: {
      color: colors.text.secondary,
    },
  });

  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(delay)}
      style={[styles.container, dynamicStyles.container]}
    >
      <Text style={[styles.title, dynamicStyles.title]}>{title}</Text>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, dynamicStyles.value]}>{value}</Text>
        {suffix && <Text style={[styles.suffix, dynamicStyles.suffix]}>{suffix}</Text>}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  title: {
    fontSize: 16,
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  suffix: {
    fontSize: 14,
    marginLeft: 4,
  },
});