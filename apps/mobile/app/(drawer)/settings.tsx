import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Platform,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAlert } from '../../hooks/useAlert';

export default function SettingsScreen() {
  const { theme, toggleTheme, colors, isDark } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const router = useRouter();
  const { showSimpleAlert, showConfirmAlert } = useAlert();

  // オンボーディング再表示処理
  const handleShowOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('@scaffai_onboarding_completed');
      router.push('/onboarding');
    } catch (error) {
      console.error('Failed to reset onboarding:', error);
      showSimpleAlert('エラー', 'オンボーディングの再表示に失敗しました');
    }
  };

  // 履歴クリア処理
  const handleClearHistory = () => {
    showConfirmAlert(
      ja.settings.clearHistoryConfirm,
      ja.settings.clearHistoryMessage,
      async () => {
        try {
          await HistoryStorage.clearAllHistory();
          showSimpleAlert('完了', ja.settings.clearHistorySuccess);
        } catch (error) {
          console.error('Failed to clear history:', error);
          showSimpleAlert('エラー', ja.settings.clearHistoryError);
        }
      }
    );
  };

  // 外部リンクを開く
  const openURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        showSimpleAlert('エラー', 'このリンクを開けませんでした');
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
      showSimpleAlert('エラー', 'このリンクを開けませんでした');
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

        {/* ヘルプ・サポート */}
        <SettingsSection title="ヘルプ・サポート">
          <SettingsItem
            icon="help-circle"
            title="使い方ガイド"
            description="アプリの基本的な使い方を確認します"
            onPress={handleShowOnboarding}
          />
          
          <SettingsItem
            icon="help-circle"
            title="よくある質問"
            description="問題の解決方法を確認できます"
            onPress={() => router.push('/faq')}
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
            icon="shield-checkmark"
            title={ja.settings.privacyPolicy}
            description="プライバシーポリシーを確認します"
            onPress={() => openURL('https://kkk9131.github.io/scaffai/docs/legal/privacy-policy.html')}
          />
          
          <SettingsItem
            icon="document-text"
            title={ja.settings.termsOfService}
            description="利用規約を確認します"
            onPress={() => openURL('https://kkk9131.github.io/scaffai/docs/legal/terms-of-service.html')}
          />
          
          <SettingsItem
            icon="library"
            title={ja.settings.licenses}
            description="オープンソースライセンスを確認します"
            onPress={() => openURL('https://kkk9131.github.io/scaffai/docs/legal/licenses.html')}
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