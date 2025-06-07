import { Alert, Platform } from 'react-native';

interface AlertOptions {
  title: string;
  message: string;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

export const useAlert = () => {
  const showAlert = ({ title, message, buttons }: AlertOptions) => {
    console.log('useAlert: showAlert called with:', { title, message, buttons });
    
    try {
      if (Platform.OS === 'web') {
        // Web環境では標準のalert/confirmを使用
        if (buttons && buttons.length > 1) {
          const confirmText = `${title}\n\n${message}`;
          const result = window.confirm(confirmText);
          
          if (result && buttons.find(b => b.style !== 'cancel')) {
            // OKボタンまたは最初のボタンを実行
            const confirmButton = buttons.find(b => b.style !== 'cancel') || buttons[1];
            if (confirmButton?.onPress) {
              confirmButton.onPress();
            }
          } else if (!result && buttons.find(b => b.style === 'cancel')) {
            // キャンセルボタンを実行
            const cancelButton = buttons.find(b => b.style === 'cancel');
            if (cancelButton?.onPress) {
              cancelButton.onPress();
            }
          }
        } else {
          // 単純なアラート
          window.alert(`${title}\n\n${message}`);
          if (buttons && buttons[0]?.onPress) {
            buttons[0].onPress();
          }
        }
      } else {
        // ネイティブ環境ではAlert.alertを使用
        setTimeout(() => {
          console.log('useAlert: About to call Alert.alert');
          
          if (buttons && buttons.length > 0) {
            Alert.alert(title, message, buttons);
          } else {
            Alert.alert(title, message, [
              {
                text: 'OK',
                onPress: () => console.log('Default OK button pressed')
              }
            ]);
          }
          
          console.log('useAlert: Alert.alert called successfully');
        }, 50);
      }
    } catch (error) {
      console.error('useAlert: Error showing alert:', error);
      
      // Fallback to console for debugging
      console.warn(`ALERT: ${title} - ${message}`);
    }
  };

  const showSimpleAlert = (title: string, message: string) => {
    showAlert({ title, message });
  };

  const showConfirmAlert = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    showAlert({
      title,
      message,
      buttons: [
        {
          text: 'キャンセル',
          style: 'cancel',
          onPress: onCancel
        },
        {
          text: 'OK',
          onPress: onConfirm
        }
      ]
    });
  };

  return {
    showAlert,
    showSimpleAlert,
    showConfirmAlert
  };
};