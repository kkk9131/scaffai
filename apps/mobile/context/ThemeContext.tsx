import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ThemeType, getThemeColors } from '../constants/colors';

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

const storage = Platform.OS === 'web' ? webStorage : AsyncStorage;

interface ThemeContextType {
  theme: ThemeType;
  colors: ReturnType<typeof getThemeColors>;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@scaffai_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('dark');
  const [isLoading, setIsLoading] = useState(true);

  // 安全なカラー取得関数
  const getSafeColors = (currentTheme: ThemeType) => {
    try {
      return getThemeColors(currentTheme);
    } catch (error) {
      console.error('Error getting theme colors:', error);
      // フォールバック: ダークテーマのカラーを直接返す
      return {
        background: {
          primary: '#0F172A',
          secondary: '#1E293B',
          paper: '#1E293B',
          card: '#334155',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#CBD5E1',
          disabled: '#64748B',
        },
        border: {
          main: '#334155',
          light: '#475569',
        },
        input: {
          background: '#1E293B',
          border: '#334155',
          focused: '#4B7BF5',
          text: '#FFFFFF',
          placeholder: '#6C757D',
        },
        divider: '#2D3748',
      };
    }
  };

  // AsyncStorageからテーマを読み込み
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await storage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
          setThemeState(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // テーマをAsyncStorageに保存
  const saveTheme = async (newTheme: ThemeType) => {
    try {
      await storage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme to storage:', error);
    }
  };

  // テーマ切り替え
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  // テーマ設定
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  const colors = getSafeColors(theme);
  const isDark = theme === 'dark';

  // ロード中でも基本的なコンテキストを提供
  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors,
        toggleTheme: isLoading ? () => {} : toggleTheme,
        setTheme: isLoading ? () => {} : setTheme,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  // フォールバックカラー定義
  const fallbackColors = {
    background: {
      primary: '#0F172A',
      secondary: '#1E293B',
      paper: '#1E293B',
      card: '#334155',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CBD5E1',
      disabled: '#64748B',
    },
    border: {
      main: '#334155',
      light: '#475569',
    },
    input: {
      background: '#1E293B',
      border: '#334155',
      focused: '#4B7BF5',
      text: '#FFFFFF',
      placeholder: '#6C757D',
    },
    divider: '#2D3748',
  };
  
  if (context === undefined) {
    // デフォルト値を返してエラーを防ぐ
    console.warn('useTheme called without ThemeProvider context, using defaults');
    return {
      theme: 'dark' as ThemeType,
      colors: fallbackColors,
      toggleTheme: () => {},
      setTheme: () => {},
      isDark: true,
    };
  }
  
  // コンテキストが存在してもcolorsが未定義の場合の追加チェック
  if (!context.colors) {
    console.warn('Theme context colors is undefined, using fallback colors');
    return {
      ...context,
      colors: fallbackColors,
    };
  }
  
  // colorsオブジェクトが存在するが、プロパティが欠けている場合
  if (!context.colors.background || !context.colors.text) {
    console.warn('Theme context colors is incomplete, using fallback colors');
    return {
      ...context,
      colors: fallbackColors,
    };
  }
  
  return context;
};