import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as baseColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

interface ProjectNameDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (projectName: string) => void;
  onCancel: () => void;
  title?: string;
}

export const ProjectNameDialog: React.FC<ProjectNameDialogProps> = ({
  visible,
  onClose,
  onSave,
  onCancel,
  title = 'プロジェクト名を入力',
}) => {
  const { colors } = useTheme();
  const [projectName, setProjectName] = useState('');

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
    input: {
      backgroundColor: colors.input.background,
      borderColor: colors.input.border,
      color: colors.text.primary,
    },
    saveButton: {
      backgroundColor: baseColors.primary.main,
    },
    saveButtonText: {
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

  const handleSave = () => {
    if (!projectName.trim()) {
      Alert.alert('エラー', 'プロジェクト名を入力してください');
      return;
    }
    onSave(projectName.trim());
    setProjectName('');
    onClose();
  };

  const handleCancel = () => {
    setProjectName('');
    onCancel();
    onClose();
  };

  const handleClose = () => {
    setProjectName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={[styles.overlay, dynamicStyles.overlay]}>
        <View style={[styles.container, dynamicStyles.container]}>
          <View style={styles.header}>
            <Text style={[styles.title, dynamicStyles.title]}>{title}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              placeholder="プロジェクト名を入力"
              placeholderTextColor={colors.text.secondary}
              value={projectName}
              onChangeText={setProjectName}
              autoFocus
              maxLength={50}
            />
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, dynamicStyles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={[styles.buttonText, dynamicStyles.cancelButtonText]}>
                キャンセル
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton, dynamicStyles.saveButton]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, dynamicStyles.saveButtonText]}>
                保存
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
    maxWidth: 400,
    borderRadius: 12,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});