import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import { colors as baseColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { ja } from '../constants/translations';
import LoginScreen from '../app/auth/login';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading, initialized } = useAuthContext();
  const { colors } = useTheme();

  const dynamicStyles = StyleSheet.create({
    loadingContainer: {
      backgroundColor: colors.background.primary,
    },
    loadingText: {
      color: colors.text.secondary,
    },
  });

  // 初期化中またはロード中
  if (!initialized || loading) {
    return (
      <View style={[styles.loadingContainer, dynamicStyles.loadingContainer]}>
        <ActivityIndicator size="large" color={baseColors.primary.main} />
        <Text style={[styles.loadingText, dynamicStyles.loadingText]}>{ja.common.loading}</Text>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});