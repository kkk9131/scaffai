import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { colors as baseColors } from '../constants/colors';

interface SettingsItemProps {
  title: string;
  description?: string;
  value?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  description,
  value,
  icon,
  iconColor,
  onPress,
  showChevron = true,
  destructive = false,
}) => {
  const { colors } = useTheme();

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.background.card,
      borderWidth: 1,
      borderColor: colors.border.main,
    },
    title: {
      color: destructive ? baseColors.error : colors.text.primary,
    },
    description: {
      color: colors.text.secondary,
    },
    value: {
      color: colors.text.secondary,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.container, dynamicStyles.container]}
      onPress={onPress}
      disabled={!onPress}
    >
      {icon && (
        <View style={styles.iconContainer}>
          <Ionicons
            name={icon}
            size={24}
            color={iconColor || (destructive ? baseColors.error : baseColors.primary.main)}
          />
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={[styles.title, dynamicStyles.title]}>{title}</Text>
        {description && (
          <Text style={[styles.description, dynamicStyles.description]}>
            {description}
          </Text>
        )}
        {value && (
          <Text style={[styles.value, dynamicStyles.value]}>{value}</Text>
        )}
      </View>
      
      {showChevron && onPress && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.text.secondary}
        />
      )}
    </TouchableOpacity>
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
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
});