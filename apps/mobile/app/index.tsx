import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors as baseColors } from '../constants/colors';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem('@scaffai_onboarding_completed');
      console.log('📱 Onboarding status:', onboardingCompleted);
      
      if (onboardingCompleted === 'true') {
        setShouldShowOnboarding(false);
      } else {
        setShouldShowOnboarding(true);
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      // エラー時はオンボーディングをスキップ
      setShouldShowOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color={baseColors.primary.main} />
      </View>
    );
  }

  if (shouldShowOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(drawer)/home" />;
}