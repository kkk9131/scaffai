import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { colors as baseColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useAuthContext } from '../../context/AuthContext';
import { ja } from '../../constants/translations';

function CustomDrawerContent(props: any) {
  const { colors, isDark } = useTheme();
  const { user, signOut } = useAuthContext();

  const handleSignOut = () => {
    console.log('🚪 [DRAWER] handleSignOut function called!');
    console.log('🚪 [DRAWER] Current user:', !!user);
    console.log('🚪 [DRAWER] signOut function type:', typeof signOut);
    
    Alert.alert(
      'ログアウト',
      'ログアウトしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 [DRAWER] Starting logout process...');
              console.log('🚪 [DRAWER] signOut function available:', typeof signOut);
              console.log('🚪 [DRAWER] Current user state:', !!user);
              
              if (!signOut) {
                console.error('❌ [DRAWER] signOut function not available');
                Alert.alert('エラー', 'ログアウト機能が利用できません');
                return;
              }
              
              const result = await signOut();
              console.log('🚪 [DRAWER] Logout result:', result);
              
              if (result && result.error) {
                console.error('❌ [DRAWER] Logout failed:', result.error);
                Alert.alert('エラー', `ログアウトに失敗しました: ${result.error.message}`);
              } else {
                console.log('✅ [DRAWER] Successfully signed out');
                // AuthGuardが自動的にログイン画面に遷移する
                // ユーザーにフィードバックを表示
                Alert.alert('ログアウト完了', 'ログアウトしました');
              }
            } catch (error) {
              console.error('❌ [DRAWER] Sign out error:', error);
              Alert.alert('エラー', `ログアウト処理中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`);
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      label: 'ホーム',
      icon: 'home',
      route: '/(drawer)/home',
      color: baseColors.primary.main,
    },
    {
      label: '入力',
      icon: 'calculator',
      route: '/(drawer)/input',
      color: baseColors.primary.main,
    },
    {
      label: '結果',
      icon: 'clipboard',
      route: '/(drawer)/result',
      color: baseColors.secondary.main,
    },
    {
      label: '履歴',
      icon: 'time',
      route: '/(drawer)/history',
      color: baseColors.secondary.main,
    },
    {
      label: 'プロフィール',
      icon: 'person',
      route: '/(drawer)/profile',
      color: baseColors.accent.orange,
    },
    {
      label: '設定',
      icon: 'settings',
      route: '/(drawer)/settings',
      color: baseColors.accent.orange,
    },
  ];

  return (
    <View style={[styles.drawerContainer, { backgroundColor: colors.background.primary }]}>
      {/* ヘッダー */}
      <View style={[styles.drawerHeader, { backgroundColor: baseColors.primary.main }]}>
        <View style={styles.logoContainer}>
          <Ionicons name="construct" size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.appName}>{ja.appName}</Text>
        <Text style={styles.appVersion}>Professional Edition</Text>
      </View>

      {/* メニューアイテム */}
      <DrawerContentScrollView {...props} style={styles.menuContainer}>
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>メニュー</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: colors.background.card }]}
              onPress={() => {
                router.push(item.route as any);
                props.navigation.closeDrawer();
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text.primary }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>

      {/* フッター */}
      <View style={[styles.drawerFooter, { borderTopColor: colors.border.main }]}>
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: colors.background.card }]}
          onPress={() => {
            console.log('🔥 [DRAWER] Logout button pressed!!!');
            handleSignOut();
          }}
        >
          <Ionicons name="log-out" size={20} color={baseColors.error} />
          <Text style={[styles.signOutText, { color: baseColors.error }]}>ログアウト</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  const { colors } = useTheme();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: colors.background.primary,
          width: 280,
        },
        swipeEnabled: true,
        swipeEdgeWidth: 50,
      }}
    >
      <Drawer.Screen
        name="home"
        options={{
          drawerLabel: 'ホーム',
          drawerIcon: ({ color }) => <Ionicons name="home" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="input"
        options={{
          drawerLabel: '入力',
          drawerIcon: ({ color }) => <Ionicons name="calculator" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="result"
        options={{
          drawerLabel: '結果',
          drawerIcon: ({ color }) => <Ionicons name="clipboard" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="history"
        options={{
          drawerLabel: '履歴',
          drawerIcon: ({ color }) => <Ionicons name="time" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'プロフィール',
          drawerIcon: ({ color }) => <Ionicons name="person" size={20} color={color} />,
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: '設定',
          drawerIcon: ({ color }) => <Ionicons name="settings" size={20} color={color} />,
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
  },
  menuSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  drawerFooter: {
    borderTopWidth: 1,
    padding: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});