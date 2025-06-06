import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
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
  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(delay)}
      style={styles.container}
    >
      <Text style={styles.title}>{title}</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.paper,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
  },
  title: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  suffix: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 4,
  },
});