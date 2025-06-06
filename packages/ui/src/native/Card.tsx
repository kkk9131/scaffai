import React from 'react';
import { View, Text } from 'react-native';
import { CardProps } from '../shared/types';

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  title,
  subtitle,
  testID,
  ...props
}) => {
  const getPaddingValue = (size: string) => {
    const paddingMap = {
      sm: 12,
      md: 16,
      lg: 24,
      xl: 32,
    };
    return paddingMap[size as keyof typeof paddingMap] || 16;
  };

  const getCardStyle = () => {
    const baseStyle = {
      borderRadius: 8,
      padding: getPaddingValue(padding),
    };

    const variantStyles = {
      default: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
      },
      outlined: {
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#d1d5db',
      },
      elevated: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8, // Android shadow
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const getTitleStyle = () => {
    return {
      fontSize: 18,
      fontWeight: '600' as const,
      color: '#111827',
      marginBottom: 4,
    };
  };

  const getSubtitleStyle = () => {
    return {
      fontSize: 14,
      color: '#6b7280',
      marginBottom: 16,
    };
  };

  return (
    <View style={getCardStyle()} testID={testID} {...props}>
      {(title || subtitle) && (
        <View style={{ marginBottom: title || subtitle ? 16 : 0 }}>
          {title && (
            <Text style={getTitleStyle()}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={getSubtitleStyle()}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      
      {children}
    </View>
  );
};