import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';

type Option = {
  label: string;
  value: string;
};

type RadioFieldProps = {
  label: string;
  options: Option[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
};

export const RadioField: React.FC<RadioFieldProps> = ({
  label,
  options,
  selectedValue,
  onValueChange,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, disabled && styles.disabledText]}>
        {label}
      </Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              selectedValue === option.value && styles.selectedOption,
              disabled && styles.disabledOption,
            ]}
            onPress={() => !disabled && onValueChange(option.value)}
            disabled={disabled}
          >
            <View
              style={[
                styles.radioOuter,
                selectedValue === option.value && styles.radioOuterSelected,
                disabled && styles.disabledRadio,
              ]}
            >
              {selectedValue === option.value && (
                <View
                  style={[
                    styles.radioInner,
                    disabled && styles.disabledRadioInner,
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                styles.optionLabel,
                selectedValue === option.value && styles.selectedText,
                disabled && styles.disabledText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  selectedOption: {
    backgroundColor: `${colors.primary.main}20`,
    borderRadius: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: colors.primary.main,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary.main,
  },
  optionLabel: {
    fontSize: 16,
    color: colors.text.primary,
  },
  selectedText: {
    color: colors.text.primary,
    fontWeight: '500',
  },
  disabledOption: {
    opacity: 0.6,
  },
  disabledText: {
    color: colors.text.disabled,
  },
  disabledRadio: {
    borderColor: colors.text.disabled,
  },
  disabledRadioInner: {
    backgroundColor: colors.text.disabled,
  },
});