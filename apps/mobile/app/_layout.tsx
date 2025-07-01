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

// Web用CSS読み込み
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  // CSS for web platform
  const style = document.createElement('style');
  style.textContent = `
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    * {
      box-sizing: border-box;
    }
  `;
  document.head.appendChild(style);
}

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