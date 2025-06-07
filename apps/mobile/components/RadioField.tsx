import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors as baseColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

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
  const { colors } = useTheme();

  const dynamicStyles = StyleSheet.create({
    label: {
      color: colors.text.primary,
    },
    selectedOption: {
      backgroundColor: `${baseColors.primary.main}20`,
    },
    radioOuter: {
      borderColor: baseColors.primary.light,
    },
    radioOuterSelected: {
      borderColor: baseColors.primary.main,
    },
    radioInner: {
      backgroundColor: baseColors.primary.main,
    },
    optionLabel: {
      color: colors.text.primary,
    },
    selectedText: {
      color: colors.text.primary,
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

  return (
    <View style={styles.container}>
      <Text style={[styles.label, dynamicStyles.label, disabled && [styles.disabledText, dynamicStyles.disabledText]]}>
        {label}
      </Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              selectedValue === option.value && [styles.selectedOption, dynamicStyles.selectedOption],
              disabled && styles.disabledOption,
            ]}
            onPress={() => !disabled && onValueChange(option.value)}
            disabled={disabled}
          >
            <View
              style={[
                styles.radioOuter,
                dynamicStyles.radioOuter,
                selectedValue === option.value && [styles.radioOuterSelected, dynamicStyles.radioOuterSelected],
                disabled && [styles.disabledRadio, dynamicStyles.disabledRadio],
              ]}
            >
              {selectedValue === option.value && (
                <View
                  style={[
                    styles.radioInner,
                    dynamicStyles.radioInner,
                    disabled && [styles.disabledRadioInner, dynamicStyles.disabledRadioInner],
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                styles.optionLabel,
                dynamicStyles.optionLabel,
                selectedValue === option.value && [styles.selectedText, dynamicStyles.selectedText],
                disabled && [styles.disabledText, dynamicStyles.disabledText],
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
    borderRadius: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioOuterSelected: {
    // Dynamic styles will override this
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionLabel: {
    fontSize: 16,
  },
  selectedText: {
    fontWeight: '500',
  },
  disabledOption: {
    opacity: 0.6,
  },
  disabledText: {
    // Dynamic styles will override this
  },
  disabledRadio: {
    // Dynamic styles will override this
  },
  disabledRadioInner: {
    // Dynamic styles will override this
  },
});