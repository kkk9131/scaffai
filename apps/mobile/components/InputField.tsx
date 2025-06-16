import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors as baseColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { ja } from '../constants/translations';

type InputFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  error?: string | null;
  suffix?: string;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
};

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  error,
  suffix,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
}) => {
  const { colors } = useTheme();

  const dynamicStyles = StyleSheet.create({
    label: {
      color: colors.text.primary,
    },
    inputContainer: {
      backgroundColor: colors.input.background,
      borderColor: colors.input.border,
    },
    input: {
      color: colors.input.text || colors.text.primary,
    },
    inputError: {
      borderColor: baseColors.error,
    },
    inputDisabled: {
      backgroundColor: `${colors.input.background}80`,
      borderColor: colors.input.border,
    },
    disabledText: {
      color: colors.text.disabled,
    },
    suffix: {
      color: colors.text.secondary,
    },
    errorText: {
      color: baseColors.error,
    },
  });
  return (
    <View style={styles.container}>
      <Text style={[styles.label, dynamicStyles.label]}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          dynamicStyles.inputContainer,
          error ? [styles.inputError, dynamicStyles.inputError] : null,
          !editable ? [styles.inputDisabled, dynamicStyles.inputDisabled] : null,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            dynamicStyles.input,
            multiline ? styles.multilineInput : null,
            !editable ? [styles.disabledText, dynamicStyles.disabledText] : null,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.input.placeholder || colors.text.disabled}
          keyboardType={keyboardType}
          editable={editable}
          multiline={multiline}
          numberOfLines={Platform.OS === 'ios' ? undefined : numberOfLines}
          maxLength={maxLength}
          autoCorrect={false}
          autoCapitalize="none"
          selectTextOnFocus={false}
        />
        {suffix && <Text style={[styles.suffix, dynamicStyles.suffix]}>{suffix}</Text>}
      </View>
      {error && <Text style={[styles.errorText, dynamicStyles.errorText]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    outlineWidth: 0, // Web用: focus時のoutlineを無効化
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
  },
  inputDisabled: {
  },
  disabledText: {
  },
  suffix: {
    marginLeft: 8,
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});