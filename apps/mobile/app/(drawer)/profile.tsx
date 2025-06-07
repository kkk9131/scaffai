import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors as baseColors } from '../../constants/colors';
import { ja } from '../../constants/translations';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
// import Animated, { FadeIn } from 'react-native-reanimated';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut, updateProfile } = useAuthContext();
  const { colors, isDark } = useTheme();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 画像を選択してプロフィールに設定
  const selectImage = async (source: 'camera' | 'gallery') => {
    try {
      setShowImagePicker(false);
      setUploading(true);

      let result;
      if (source === 'camera') {
        // カメラの権限を確認
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) {
          Alert.alert('権限が必要です', 'カメラへのアクセス権限が必要です');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      } else {
        // ギャラリーの権限を確認
        const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!galleryPermission.granted) {
          Alert.alert('権限が必要です', 'フォトライブラリへのアクセス権限が必要です');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      }

      if (!result.canceled && result.assets[0]) {
        // 画像をリサイズ
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 200, height: 200 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );

        // Base64形式でプロフィールに保存
        const base64Image = `data:image/jpeg;base64,${manipulatedImage.base64}`;
        
        if (updateProfile) {
          const { error } = await updateProfile({ avatar_char: base64Image });
          if (error) {
            Alert.alert('エラー', 'プロフィール画像の更新に失敗しました');
          }
        }
      }
    } catch (error) {
      console.error('Image selection error:', error);
      Alert.alert('エラー', '画像の選択に失敗しました');
    } finally {
      setUploading(false);
    }
  };

  // アバターを削除
  const removeAvatar = async () => {
    Alert.alert(
      'プロフィール画像を削除',
      'プロフィール画像を削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            if (updateProfile) {
              const { error } = await updateProfile({ avatar_char: null });
              if (error) {
                Alert.alert('エラー', 'プロフィール画像の削除に失敗しました');
              }
            }
          },
        },
      ]
    );
  };

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
            try {
              if (!signOut) {
                Alert.alert('エラー', 'ログアウト機能が利用できません');
                return;
              }
              
              const result = await signOut();
              
              if (result && result.error) {
                Alert.alert('エラー', `ログアウトに失敗しました: ${result.error.message || 'Unknown error'}`);
              } else {
                Alert.alert('ログアウト完了', 'ログアウトしました');
              }
            } catch (error) {
              Alert.alert('エラー', `ログアウト処理中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`);
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

  // 未ログイン時の表示
  if (!user) {
    return (
      <View style={[styles.safeArea, dynamicStyles.safeArea]}>
        <AppHeader title="プロフィール" />
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.notLoggedInContainer}>
          <Ionicons name="person-circle" size={80} color={colors.text.secondary} />
          <Text style={[styles.notLoggedInTitle, { color: colors.text.primary }]}>
            ログインが必要です
          </Text>
          <Text style={[styles.notLoggedInText, { color: colors.text.secondary }]}>
            プロフィール機能を利用するにはログインしてください
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: baseColors.primary.main }]}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginButtonText}>ログイン</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, dynamicStyles.safeArea]}>
      <AppHeader title="プロフィール" />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView style={[styles.container, dynamicStyles.container]} contentContainerStyle={styles.scrollContent}>

        {/* プロフィール情報 */}
        <View style={[styles.profileSection, dynamicStyles.userCard]}>
          {/* アバター */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity 
              style={[styles.avatar, { backgroundColor: colors.background.paper, borderColor: baseColors.secondary.main }]}
              onPress={() => setShowImagePicker(true)}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="large" color={baseColors.primary.main} />
              ) : profile?.avatar_char ? (
                <Image source={{ uri: profile.avatar_char }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={60} color={colors.text.primary} />
              )}
              
              {/* カメラアイコンのオーバーレイ */}
              <View style={[styles.cameraOverlay, { backgroundColor: baseColors.primary.main }]}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            {/* 画像削除ボタン（画像がある場合のみ表示） */}
            {profile?.avatar_char && !uploading && (
              <TouchableOpacity 
                style={[styles.removeButton, { backgroundColor: baseColors.error }]}
                onPress={removeAvatar}
              >
                <Ionicons name="trash" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            )}
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


        {/* ログアウト */}
        <View style={[styles.section, dynamicStyles.menuItem]}>
          <TouchableOpacity 
            style={[styles.logoutButton, dynamicStyles.logoutButton]} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={24} color={baseColors.error} />
            <Text style={[styles.logoutText, dynamicStyles.logoutText]}>ログアウト</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 画像選択モーダル */}
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
              プロフィール画像を選択
            </Text>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: baseColors.primary.main }]}
              onPress={() => selectImage('camera')}
            >
              <Ionicons name="camera" size={24} color="#FFFFFF" />
              <Text style={styles.modalButtonText}>カメラで撮影</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: baseColors.secondary.main }]}
              onPress={() => selectImage('gallery')}
            >
              <Ionicons name="images" size={24} color="#FFFFFF" />
              <Text style={styles.modalButtonText}>ギャラリーから選択</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalCancelButton, { borderColor: colors.border.main }]}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={[styles.modalCancelText, { color: colors.text.primary }]}>
                キャンセル
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    position: 'relative',
  },
  avatarImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
  // モーダルのスタイル
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  modalCancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // 未ログイン時のスタイル
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  notLoggedInTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  notLoggedInText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  loginButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});