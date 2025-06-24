import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { ScaffoldProvider } from '../context/ScaffoldContext';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { PurchaseProvider } from '../context/PurchaseContext';
import { AuthGuard } from '../components/AuthGuard';
import 'react-native-gesture-handler';

// Web用CSS読み込み (一時的に無効化)
// if (Platform.OS === 'web') {
//   require('../global.css');
// }

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({});

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <ScaffoldProvider>
          <PurchaseProvider>
            <AuthGuard>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="faq" options={{ headerShown: false }} />
              </Stack>
            </AuthGuard>
            <StatusBar style="auto" />
          </PurchaseProvider>
        </ScaffoldProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}