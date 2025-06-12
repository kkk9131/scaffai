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

interface SaveCompletionDialogProps {
  visible: boolean;
  onClose: () => void;
  onViewHistory: () => void;
  projectName: string;
  saveMode: 'local' | 'cloud';
}

export const SaveCompletionDialog: React.FC<SaveCompletionDialogProps> = ({
  visible,
  onClose,
  onViewHistory,
  projectName,
  saveMode,
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
    okButton: {
      backgroundColor: baseColors.primary.main,
    },
    okButtonText: {
      color: '#FFFFFF',
    },
    historyButton: {
      backgroundColor: colors.background.secondary,
      borderColor: baseColors.primary.main,
    },
    historyButtonText: {
      color: baseColors.primary.main,
    },
  });

  const getMessage = () => {
    if (saveMode === 'local') {
      return `プロジェクト「${projectName}」をローカルに保存しました`;
    } else {
      return `プロジェクト「${projectName}」をクラウドに保存しました`;
    }
  };

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
            ✅ 保存完了
          </Text>
          
          <Text style={[styles.message, dynamicStyles.message]}>
            {getMessage()}
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.historyButton, dynamicStyles.historyButton]}
              onPress={onViewHistory}
            >
              <Ionicons name="time-outline" size={20} color={baseColors.primary.main} />
              <Text style={[styles.buttonText, dynamicStyles.historyButtonText]}>
                履歴を見る
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.okButton, dynamicStyles.okButton]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, dynamicStyles.okButtonText]}>
                OK
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
  historyButton: {
    borderWidth: 2,
  },
  okButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});