import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

type SwitchFieldProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export const SwitchField: React.FC<SwitchFieldProps> = ({
  label,
  value,
  onValueChange,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, disabled && styles.disabledText]}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: colors.background.card,
          true: colors.primary.main,
        }}
        thumbColor={value ? colors.text.primary : colors.text.secondary}
        ios_backgroundColor={colors.background.card}
        disabled={disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
    flex: 1,
  },
  disabledText: {
    color: colors.text.disabled,
  },
});