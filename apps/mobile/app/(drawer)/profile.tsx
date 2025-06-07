import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors as baseColors } from '../../constants/colors';
import { ja } from '../../constants/translations';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
// import Animated, { FadeIn } from 'react-native-reanimated';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuthContext();
  const { colors, isDark } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('エラー', 'ログアウトに失敗しました');
            }
          },
        },
      ]
    );
  };

  const dynamicStyles = StyleSheet.create({
    safeArea: {
      backgroundColor: colors.background.primary,
    },
    container: {
      backgroundColor: colors.background.primary,
    },
    title: {
      color: colors.text.primary,
    },
    userCard: {
      backgroundColor: colors.background.card,
      borderColor: colors.border.main,
    },
    userName: {
      color: colors.text.primary,
    },
    userEmail: {
      color: colors.text.secondary,
    },
    planText: {
      color: colors.text.primary,
    },
    sectionTitle: {
      color: colors.text.secondary,
    },
    menuItem: {
      backgroundColor: colors.background.card,
      borderColor: colors.border.main,
    },
    menuItemText: {
      color: colors.text.primary,
    },
    logoutButton: {
      backgroundColor: colors.background.card,
      borderColor: colors.border.main,
    },
    logoutText: {
      color: baseColors.error,
    },
  });

  return (
    <View style={[styles.safeArea, dynamicStyles.safeArea]}>
      <AppHeader title="プロフィール" />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView style={[styles.container, dynamicStyles.container]} contentContainerStyle={styles.scrollContent}>

        {/* プロフィール情報 */}
        <View style={[styles.profileSection, dynamicStyles.userCard]}>
          {/* アバター */}
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.background.paper, borderColor: baseColors.secondary.main }]}>
              <Ionicons name="person" size={60} color={colors.text.primary} />
            </View>
          </View>

          {/* ユーザー情報 */}
          <View style={styles.userInfo}>
            <Text style={[styles.userName, dynamicStyles.userName]}>{profile?.name || 'ユーザー'}</Text>
            <Text style={[styles.userEmail, dynamicStyles.userEmail]}>{user?.email}</Text>
            <View style={[styles.planBadge, { backgroundColor: baseColors.secondary.main }]}>
              <Text style={[styles.planText, dynamicStyles.planText]}>{profile?.scaffai_role || 'USER'}</Text>
            </View>
          </View>
        </View>

        {/* アカウント設定 */}
        <View style={[styles.section, dynamicStyles.menuItem]}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>アカウント</Text>
          
          <TouchableOpacity style={[styles.menuItem, dynamicStyles.menuItem]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-circle" size={24} color={baseColors.primary.main} />
              <Text style={[styles.menuItemText, dynamicStyles.menuItemText]}>個人情報</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, dynamicStyles.menuItem]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="card" size={24} color={baseColors.primary.main} />
              <Text style={[styles.menuItemText, dynamicStyles.menuItemText]}>プラン・課金</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, dynamicStyles.menuItem]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-checkmark" size={24} color={baseColors.primary.main} />
              <Text style={[styles.menuItemText, dynamicStyles.menuItemText]}>セキュリティ</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, dynamicStyles.menuItem]}
            onPress={() => router.push('/(drawer)/history')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="time" size={24} color={baseColors.primary.main} />
              <Text style={[styles.menuItemText, dynamicStyles.menuItemText]}>計算履歴</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* アプリ設定 */}
        <View style={[styles.section, dynamicStyles.menuItem]}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>アプリ設定</Text>
          
          <TouchableOpacity 
            style={[styles.menuItem, dynamicStyles.menuItem]}
            onPress={() => router.push('/(drawer)/settings')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="settings" size={24} color={baseColors.primary.main} />
              <Text style={[styles.menuItemText, dynamicStyles.menuItemText]}>一般設定</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, dynamicStyles.menuItem]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications" size={24} color={baseColors.primary.main} />
              <Text style={[styles.menuItemText, dynamicStyles.menuItemText]}>通知設定</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, dynamicStyles.menuItem]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle" size={24} color={baseColors.primary.main} />
              <Text style={[styles.menuItemText, dynamicStyles.menuItemText]}>ヘルプ・サポート</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* ログアウト */}
        <View style={[styles.section, dynamicStyles.menuItem]}>
          <TouchableOpacity style={[styles.logoutButton, dynamicStyles.logoutButton]} onPress={handleLogout}>
            <Ionicons name="log-out" size={24} color={baseColors.error} />
            <Text style={[styles.logoutText, dynamicStyles.logoutText]}>ログアウト</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  profileSection: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 12,
  },
  planBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  planText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});