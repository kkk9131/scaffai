import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SettingsSwitchProps {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const SettingsSwitch: React.FC<SettingsSwitchProps> = ({
  title,
  description,
  value,
  onValueChange,
  disabled = false,
}) => {
  const { colors } = useTheme();

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.background.card,
      borderWidth: 1,
      borderColor: colors.border.main,
    },
    title: {
      color: colors.text.primary,
    },
    description: {
      color: colors.text.secondary,
    },
  });

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <View style={styles.content}>
        <Text style={[styles.title, dynamicStyles.title]}>{title}</Text>
        {description && (
          <Text style={[styles.description, dynamicStyles.description]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: colors.border.main,
          true: '#4B7BF5',
        }}
        thumbColor={value ? '#FFFFFF' : colors.text.secondary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});