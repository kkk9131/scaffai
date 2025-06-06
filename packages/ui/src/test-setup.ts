// Jest セットアップファイル

// React Native用のモック
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    select: jest.fn((obj) => obj.web),
  },
  Pressable: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  View: 'View',
  ActivityIndicator: 'ActivityIndicator',
}));

// プラットフォーム検出のモック
jest.mock('./shared/utils', () => ({
  ...jest.requireActual('./shared/utils'),
  getPlatform: jest.fn(() => 'web'),
}));