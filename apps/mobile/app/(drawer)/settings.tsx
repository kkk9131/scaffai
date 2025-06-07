import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../context/ThemeContext';
import { colors as baseColors } from '../../constants/colors';
import { ja } from '../../constants/translations';
import { SettingsSection } from '../../components/SettingsSection';
import { SettingsItem } from '../../components/SettingsItem';
import { SettingsSwitch } from '../../components/SettingsSwitch';
import { HistoryStorage } from '../../utils/storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export default function SettingsScreen() {
  const { theme, toggleTheme, colors, isDark } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // 履歴クリア処理
  const handleClearHistory = () => {
    Alert.alert(
      ja.settings.clearHistoryConfirm,
      ja.settings.clearHistoryMessage,
      [
        {
          text: ja.common.cancel,
          style: 'cancel',
        },
        {
          text: ja.common.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await HistoryStorage.clearAllHistory();
              Alert.alert('完了', ja.settings.clearHistorySuccess);
            } catch (error) {
              console.error('Failed to clear history:', error);
              Alert.alert('エラー', ja.settings.clearHistoryError);
            }
          },
        },
      ]
    );
  };

  // 外部リンクを開く
  const openURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('エラー', 'このリンクを開けませんでした');
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
      Alert.alert('エラー', 'このリンクを開けませんでした');
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.background.primary,
    },
    title: {
      color: colors.text.primary,
    },
  });

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <AppHeader title={ja.settings.title} />
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 表示設定 */}
        <SettingsSection title={ja.settings.appearance}>
          <SettingsSwitch
            title={ja.settings.theme}
            description={ja.settings.themeDescription}
            value={!isDark}
            onValueChange={toggleTheme}
          />
        </SettingsSection>

        {/* 通知設定 */}
        <SettingsSection title={ja.settings.notifications}>
          <SettingsSwitch
            title={ja.settings.notificationsEnabled}
            description={ja.settings.notificationsDescription}
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </SettingsSection>

        {/* データ管理 */}
        <SettingsSection title={ja.settings.dataManagement}>
          <SettingsItem
            icon="trash"
            iconColor={baseColors.error}
            title={ja.settings.clearHistory}
            description={ja.settings.clearHistoryDescription}
            onPress={handleClearHistory}
            destructive
          />
        </SettingsSection>

        {/* アプリ情報 */}
        <SettingsSection title={ja.settings.appInfo}>
          <SettingsItem
            icon="information-circle"
            title={ja.settings.version}
            value={Constants.expoConfig?.version || '1.0.0'}
            showChevron={false}
          />
          
          <SettingsItem
            icon="code"
            title={ja.settings.developer}
            value="ScaffAI Team"
            showChevron={false}
          />
          
          <SettingsItem
            icon="globe"
            title={ja.settings.website}
            description="アプリの公式サイトを開きます"
            onPress={() => openURL('https://scaffai.example.com')}
          />
          
          <SettingsItem
            icon="help-circle"
            title={ja.settings.support}
            description="サポートページを開きます"
            onPress={() => openURL('https://scaffai.example.com/support')}
          />
          
          <SettingsItem
            icon="shield-checkmark"
            title={ja.settings.privacyPolicy}
            description="プライバシーポリシーを確認します"
            onPress={() => openURL('https://scaffai.example.com/privacy')}
          />
          
          <SettingsItem
            icon="document-text"
            title={ja.settings.termsOfService}
            description="利用規約を確認します"
            onPress={() => openURL('https://scaffai.example.com/terms')}
          />
          
          <SettingsItem
            icon="library"
            title={ja.settings.licenses}
            description="オープンソースライセンスを確認します"
            onPress={() => Alert.alert('ライセンス', 'ライセンス情報はアプリ内で確認できます')}
          />
        </SettingsSection>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
});