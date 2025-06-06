import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { InputFieldProps } from '../shared/types';

export const Input: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  defaultValue,
  type = 'text',
  error,
  helperText,
  required = false,
  disabled = false,
  testID,
  onChangeText,
  onChange,
  ...props
}) => {
  const handleChangeText = (text: string) => {
    onChangeText?.(text);
    const newValue = type === 'number' ? parseFloat(text) || 0 : text;
    onChange?.(newValue);
  };

  const getInputStyle = () => {
    return {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: disabled ? '#f9fafb' : '#ffffff',
      borderColor: error ? '#dc2626' : '#d1d5db',
      color: error ? '#dc2626' : '#111827',
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getLabelStyle = () => {
    return {
      fontSize: 14,
      fontWeight: '500' as const,
      color: '#374151',
      marginBottom: 4,
    };
  };

  const getHelperTextStyle = () => {
    return {
      fontSize: 12,
      color: error ? '#dc2626' : '#6b7280',
      marginTop: 4,
    };
  };

  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text style={getLabelStyle()}>
          {label}
          {required && <Text style={{ color: '#dc2626' }}> *</Text>}
        </Text>
      )}
      
      <TextInput
        style={getInputStyle()}
        value={value?.toString()}
        defaultValue={defaultValue?.toString()}
        placeholder={placeholder}
        editable={!disabled}
        keyboardType={type === 'number' ? 'numeric' : 'default'}
        secureTextEntry={type === 'password'}
        onChangeText={handleChangeText}
        testID={testID}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      
      {(error || helperText) && (
        <Text style={getHelperTextStyle()}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};