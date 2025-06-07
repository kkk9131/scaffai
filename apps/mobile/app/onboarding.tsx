import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors as baseColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'ScaffAI へようこそ',
    subtitle: 'プロフェッショナル足場計算ツール',
    description: '正確で効率的な足場計算を\nスマートフォンで簡単に',
    icon: 'construct',
    color: baseColors.primary.main,
  },
  {
    id: 2,
    title: '簡単3ステップで計算',
    subtitle: '直感的な操作で素早く結果を取得',
    description: '1. 建物サイズを入力\n2. 計算ボタンをタップ\n3. 詳細な結果を確認',
    icon: 'calculator',
    color: baseColors.secondary.main,
  },
  {
    id: 3,
    title: '計算結果を保存・管理',
    subtitle: 'ローカル＆クラウド保存対応',
    description: 'ローカル保存で即座にアクセス\nクラウド保存で端末間同期',
    icon: 'cloud-upload',
    color: baseColors.accent.orange,
  },
  {
    id: 4,
    title: '準備完了！',
    subtitle: '足場計算を始めましょう',
    description: 'プロフェッショナルな\n足場計算体験をお楽しみください',
    icon: 'checkmark-circle',
    color: baseColors.success,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { colors, isDark } = useTheme();
  const router = useRouter();

  // Expo Routerの自動ヘッダーを非表示
  React.useLayoutEffect(() => {
    // この画面では自動ヘッダーを非表示にする
  }, []);
  
  const currentItem = onboardingData[currentIndex];
  const isLastSlide = currentIndex === onboardingData.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      completeOnboarding();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@scaffai_onboarding_completed', 'true');
      router.replace('/(drawer)/home');
    } catch (error) {
      console.error('Failed to save onboarding completion:', error);
      router.replace('/(drawer)/home');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* グラデーション背景 */}
      <LinearGradient
        colors={isDark 
          ? [currentItem.color + '20', colors.background.primary]
          : [currentItem.color + '10', colors.background.primary]
        }
        style={styles.gradientBackground}
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={styles.indicatorContainer}>
            {onboardingData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: index === currentIndex 
                      ? currentItem.color 
                      : colors.border.main,
                  },
                ]}
              />
            ))}
          </View>
          
          {!isLastSlide && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={[styles.skipText, { color: colors.text.secondary }]}>
                スキップ
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* メインコンテンツ */}
        <View style={styles.content}>
          {/* アイコン */}
          <View style={[styles.iconContainer, { backgroundColor: currentItem.color + '15' }]}>
            <Ionicons 
              name={currentItem.icon as any} 
              size={80} 
              color={currentItem.color} 
            />
          </View>

          {/* テキスト */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {currentItem.title}
            </Text>
            <Text style={[styles.subtitle, { color: currentItem.color }]}>
              {currentItem.subtitle}
            </Text>
            <Text style={[styles.description, { color: colors.text.secondary }]}>
              {currentItem.description}
            </Text>
          </View>
        </View>

        {/* フッター */}
        <View style={styles.footer}>
          <View style={styles.navigationContainer}>
            {/* 戻るボタン */}
            <TouchableOpacity
              style={[
                styles.navButton,
                { 
                  backgroundColor: currentIndex > 0 ? colors.background.card : 'transparent',
                  opacity: currentIndex > 0 ? 1 : 0,
                },
              ]}
              onPress={handlePrevious}
              disabled={currentIndex === 0}
            >
              <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>

            {/* 次へ・開始ボタン */}
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: currentItem.color }]}
              onPress={handleNext}
            >
              <Text style={styles.primaryButtonText}>
                {isLastSlide ? '開始する' : '次へ'}
              </Text>
              <Ionicons 
                name={isLastSlide ? 'rocket' : 'chevron-forward'} 
                size={20} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  
  // ヘッダー
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },

  // メインコンテンツ
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },

  // フッター
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});