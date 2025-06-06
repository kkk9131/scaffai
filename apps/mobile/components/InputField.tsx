import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors } from '../constants/colors';
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
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          error ? styles.inputError : null,
          !editable ? styles.inputDisabled : null,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            multiline ? styles.multilineInput : null,
            !editable ? styles.disabledText : null,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.disabled}
          keyboardType={keyboardType}
          editable={editable}
          multiline={multiline}
          numberOfLines={Platform.OS === 'ios' ? undefined : numberOfLines}
          maxLength={maxLength}
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.input.border,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 16,
    paddingVertical: 12,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.error,
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
    marginLeft: 8,
    fontSize: 14,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});