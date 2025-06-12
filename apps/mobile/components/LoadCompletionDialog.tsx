import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as baseColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

interface LoadCompletionDialogProps {
  visible: boolean;
  onClose: () => void;
  onGoToInput: () => void;
}

export const LoadCompletionDialog: React.FC<LoadCompletionDialogProps> = ({
  visible,
  onClose,
  onGoToInput,
}) => {
  const { colors } = useTheme();

  const dynamicStyles = StyleSheet.create({
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
      backgroundColor: colors.background.card,
    },
    title: {
      color: colors.text.primary,
    },
    message: {
      color: colors.text.secondary,
    },
    inputButton: {
      backgroundColor: baseColors.primary.main,
    },
    inputButtonText: {
      color: '#FFFFFF',
    },
    cancelButton: {
      backgroundColor: colors.background.secondary,
      borderColor: colors.border.main,
    },
    cancelButtonText: {
      color: colors.text.primary,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, dynamicStyles.overlay]}>
        <View style={[styles.container, dynamicStyles.container]}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="checkmark-circle" 
              size={64} 
              color={baseColors.success || '#28a745'} 
            />
          </View>
          
          <Text style={[styles.title, dynamicStyles.title]}>
            ✅ 履歴読み込み完了
          </Text>
          
          <Text style={[styles.message, dynamicStyles.message]}>
            入力データが復元されました。{'\n'}入力画面で確認・編集できます。
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, dynamicStyles.cancelButton]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, dynamicStyles.cancelButtonText]}>
                OK
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.inputButton, dynamicStyles.inputButton]}
              onPress={onGoToInput}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
              <Text style={[styles.buttonText, dynamicStyles.inputButtonText]}>
                入力画面へ
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    borderWidth: 2,
  },
  inputButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});