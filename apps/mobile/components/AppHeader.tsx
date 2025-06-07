import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { colors as baseColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { ja } from '../constants/translations';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

type DrawerNavigation = DrawerNavigationProp<any>;

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = ja.appName,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightAction,
}) => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<DrawerNavigation>();

  const handleMenuPress = () => {
    navigation.openDrawer();
  };

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.background.primary }]}>
          {/* 左側 - ハンバーガーメニューまたは戻るボタン */}
          <TouchableOpacity
            style={styles.leftButton}
            onPress={showBackButton ? handleBackPress : handleMenuPress}
          >
            <Ionicons 
              name={showBackButton ? 'arrow-back' : 'menu'} 
              size={24} 
              color={colors.text.primary} 
            />
          </TouchableOpacity>

          {/* 中央 - タイトル */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: colors.text.secondary }]}>{subtitle}</Text>
            )}
          </View>

          {/* 右側 - カスタムアクション */}
          <View style={styles.rightContainer}>
            {rightAction || <View style={styles.placeholder} />}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  leftButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  rightContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});