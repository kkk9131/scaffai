import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors as baseColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

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
  const { colors } = useTheme();

  const dynamicStyles = StyleSheet.create({
    label: {
      color: colors.text.primary,
    },
    disabledText: {
      color: colors.text.disabled,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.label, dynamicStyles.label, disabled && [styles.disabledText, dynamicStyles.disabledText]]}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: colors.background.card,
          true: baseColors.primary.main,
        }}
        thumbColor={value ? '#FFFFFF' : colors.text.secondary}
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
    fontWeight: '500',
    flex: 1,
  },
  disabledText: {
    // Dynamic styles will override this
  },
});