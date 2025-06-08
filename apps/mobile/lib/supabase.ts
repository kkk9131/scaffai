import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from './types';

const supabaseUrl = 'https://sqovgtupsgyalvuycyum.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxb3ZndHVwc2d5YWx2dXljeXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NjMwMjQsImV4cCI6MjA2NDUzOTAyNH0.pkadOrtCFA-8L8qoCXuO3Abe-9vBe17us5HoYYdR9og';

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