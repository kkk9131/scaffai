import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { ButtonProps } from '../shared/types';

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'solid',
  size = 'md',
  color = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  testID,
  onPress,
  ...props
}) => {
  // NativeWindのクラス名をReact Nativeスタイルオブジェクトに変換
  // 実際の実装では、NativeWindのスタイル処理が必要
  const getButtonStyle = () => {
    const baseStyle = {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: 8,
      opacity: disabled ? 0.5 : 1,
    };

    const sizeStyles = {
      sm: { paddingHorizontal: 12, paddingVertical: 6 },
      md: { paddingHorizontal: 16, paddingVertical: 8 },
      lg: { paddingHorizontal: 24, paddingVertical: 12 },
      xl: { paddingHorizontal: 32, paddingVertical: 16 },
    };

    const colorStyles = {
      solid: {
        primary: { backgroundColor: '#2563eb' },
        secondary: { backgroundColor: '#475569' },
        scaffold: { backgroundColor: '#f97316' },
        danger: { backgroundColor: '#dc2626' },
        warning: { backgroundColor: '#d97706' },
        success: { backgroundColor: '#16a34a' },
      },
      outline: {
        primary: { borderWidth: 1, borderColor: '#2563eb', backgroundColor: 'transparent' },
        secondary: { borderWidth: 1, borderColor: '#475569', backgroundColor: 'transparent' },
        scaffold: { borderWidth: 1, borderColor: '#f97316', backgroundColor: 'transparent' },
        danger: { borderWidth: 1, borderColor: '#dc2626', backgroundColor: 'transparent' },
        warning: { borderWidth: 1, borderColor: '#d97706', backgroundColor: 'transparent' },
        success: { borderWidth: 1, borderColor: '#16a34a', backgroundColor: 'transparent' },
      },
      ghost: {
        primary: { backgroundColor: 'transparent' },
        secondary: { backgroundColor: 'transparent' },
        scaffold: { backgroundColor: 'transparent' },
        danger: { backgroundColor: 'transparent' },
        warning: { backgroundColor: 'transparent' },
        success: { backgroundColor: 'transparent' },
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...colorStyles[variant][color],
      ...(fullWidth && { width: '100%' }),
    };
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontWeight: '500' as const,
      textAlign: 'center' as const,
    };

    const sizeTextStyles = {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
      xl: { fontSize: 20 },
    };

    const colorTextStyles = {
      solid: { color: '#ffffff' },
      outline: {
        primary: '#2563eb',
        secondary: '#475569',
        scaffold: '#f97316',
        danger: '#dc2626',
        warning: '#d97706',
        success: '#16a34a',
      },
      ghost: {
        primary: '#2563eb',
        secondary: '#475569',
        scaffold: '#f97316',
        danger: '#dc2626',
        warning: '#d97706',
        success: '#16a34a',
      },
    };

    const textColor = variant === 'solid' 
      ? colorTextStyles.solid 
      : colorTextStyles[variant][color];

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      color: textColor,
    };
  };

  return (
    <Pressable
      style={getButtonStyle()}
      disabled={disabled || loading}
      onPress={onPress}
      testID={testID}
      {...props}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'solid' ? '#ffffff' : '#2563eb'}
          style={{ marginRight: 8 }}
        />
      )}
      
      <Text style={getTextStyle()}>
        {children}
      </Text>
    </Pressable>
  );
};