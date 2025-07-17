import 'dotenv/config';

export default {
  expo: {
    name: 'ScaffAI Mobile',
    slug: 'scaffai-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.scaffai.mobile',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.scaffai.mobile',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/favicon.png',
      name: 'ScaffAI Mobile',
      shortName: 'ScaffAI',
      lang: 'ja',
      scope: '/',
      themeColor: '#007AFF',
      backgroundColor: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      startUrl: '/',
      icons: {
        icon: './assets/icon.png',
        apple: './assets/icon.png',
      },
    },
    plugins: ['expo-router', 'expo-font'],
    experiments: {
      typedRoutes: true,
    },
    updates: {
      assetPatternsToBeBundled: ['**/*'],
    },
    scheme: 'scaffai',
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xxxxxxxxxxxxxxxxxxx.supabase.co',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkZG1tY3lxdWlob2VxbGF2dG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MjAyMzk3NDYsImV4cCI6MTkzNTgxNTc0Nn0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    },
  },
};