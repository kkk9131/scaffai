import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import { colors } from '../../constants/colors';
import { ja } from '../../constants/translations';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp, loading } = useAuthContext();

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    if (isSignUp && !name.trim()) {
      Alert.alert('エラー', '名前を入力してください');
      return;
    }

    try {
      let result;
      if (isSignUp) {
        result = await signUp(email.trim(), password, name.trim());
        if (!result.error) {
          Alert.alert(
            'アカウント作成完了',
            'メールアドレスに確認メールを送信しました。メール内のリンクをクリックしてアカウントを有効化してください。',
            [{ text: 'OK', onPress: () => setIsSignUp(false) }]
          );
          return;
        }
      } else {
        result = await signIn(email.trim(), password);
      }

      if (result.error) {
        let errorMessage = 'エラーが発生しました';
        
        if (result.error.message?.includes('Invalid login credentials')) {
          errorMessage = 'メールアドレスまたはパスワードが正しくありません';
        } else if (result.error.message?.includes('Email not confirmed')) {
          errorMessage = 'メールアドレスが確認されていません。確認メールをチェックしてください。';
        } else if (result.error.message?.includes('User already registered')) {
          errorMessage = 'このメールアドレスは既に登録されています';
        }
        
        Alert.alert('認証エラー', errorMessage);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('エラー', '認証処理中にエラーが発生しました');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setName('');
    setPassword('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="construct" size={60} color={colors.primary.main} />
            </View>
            <Text style={styles.title}>ScaffAI</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'アカウントを作成' : 'ログイン'}
            </Text>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>名前</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="お名前を入力"
                  placeholderTextColor={colors.text.secondary}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>メールアドレス</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                placeholderTextColor={colors.text.secondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>パスワード</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="パスワードを入力"
                  placeholderTextColor={colors.text.secondary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleAuth}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.authButton, loading && styles.disabledButton]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.text.primary} />
              ) : (
                <Text style={styles.authButtonText}>
                  {isSignUp ? 'アカウント作成' : 'ログイン'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleMode}
              disabled={loading}
            >
              <Text style={styles.toggleText}>
                {isSignUp
                  ? 'すでにアカウントをお持ちですか？ ログイン'
                  : 'アカウントをお持ちでない方は アカウント作成'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border.main,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.main,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  passwordInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text.primary,
  },
  eyeButton: {
    padding: 12,
  },
  authButton: {
    height: 48,
    backgroundColor: colors.primary.main,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  toggleButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  toggleText: {
    fontSize: 14,
    color: colors.primary.main,
    textAlign: 'center',
  },
});