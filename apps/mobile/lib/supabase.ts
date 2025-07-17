import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Database } from './types';

// ビルド時のダミー値を設定（有効なフォーマットを使用）
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 
                   process.env.EXPO_PUBLIC_SUPABASE_URL || 
                   'https://xxxxxxxxxxxxxxxxxxx.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 
                       process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkZG1tY3lxdWlob2VxbGF2dG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MjAyMzk3NDYsImV4cCI6MTkzNTgxNTc0Nn0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

// 実際の環境変数チェックは、クライアントサイドでのみ実行
if (typeof window !== 'undefined' && (!supabaseUrl.includes('xxxxxxxxxxxxxxxxxxx') || !supabaseAnonKey.includes('xxxxxxxxxxxxxxxxxxx'))) {
  if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables. Please check your app.config.js or .env file.');
  }
}

// Web用のlocalStorageアダプター
const webStorage = {
  getItem: (key: string) => {
    if (typeof window !== 'undefined') {
      return Promise.resolve(window.localStorage.getItem(key));
    }
    return Promise.resolve(null);
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
    return Promise.resolve();
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? webStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    // ログアウト時の確実なセッション削除を保証
    storageKey: 'supabase.auth.token',
    // デバッグモードを有効にしてauth状態を詳細にログ出力
    debug: __DEV__,
  },
  global: {
    headers: {
      'X-Client-Info': 'scaffai-mobile-app',
    },
  },
});