import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { ja } from '../constants/translations';
import LoginScreen from '../app/auth/login';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading, initialized } = useAuthContext();

  // 初期化中またはロード中
  if (!initialized || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>{ja.common.loading}</Text>
      </View>
    );
  }

  // 未認証
  if (!user) {
    return <LoginScreen />;
  }

  // 認証済み
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
});