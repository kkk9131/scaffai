// テーマタイプ定義
export type ThemeType = 'dark' | 'light';

// カラーテーマ定義
export const colors = {
  // ブランドカラー（テーマ共通）
  primary: {
    main: '#1E3A8A', // ダークブルー
    light: '#3B82F6', // ライトブルー
    dark: '#1E40AF', // ディープブルー
  },
  secondary: {
    main: '#10B981', // ライトグリーン
    light: '#34D399', // ブライトグリーン
    dark: '#059669', // ディープグリーン
  },
  accent: {
    orange: '#F97316', // オレンジアクセント
    orangeLight: '#FB923C',
    orangeDark: '#EA580C',
  },
  success: '#2E7D32',
  warning: '#F57C00',
  error: '#D32F2F',

  // ダークテーマ
  dark: {
    background: {
      primary: '#0F172A', // ディープネイビー
      secondary: '#1E293B', // ダークブルーグレー
      paper: '#1E293B',
      card: '#334155', // カードブルーグレー
    },
    text: {
      primary: '#FFFFFF', // 純白（主要テキスト）
      secondary: '#CBD5E1', // ライトグレー（副次テキスト）
      disabled: '#64748B', // ミディアムグレー
    },
    border: {
      main: '#334155',
      light: '#475569',
    },
    input: {
      background: '#1E293B',
      border: '#334155',
      focused: '#3B82F6', // ブランドライトブルー
      text: '#FFFFFF', // 入力テキスト色（純白）
      placeholder: '#64748B', // プレースホルダー色（ミディアムグレー）
    },
    divider: '#2D3748',
  },

  // ライトテーマ（グレージュベース）
  light: {
    background: {
      primary: '#FAF9F7', // ウォームホワイト（グレージュ）
      secondary: '#F5F4F1', // ライトグレージュ
      paper: '#FFFFFF', // カード用ピュアホワイト
      card: '#FEFEFE', // ソフトホワイト
    },
    text: {
      primary: '#2C2A26', // ダークグレージュ（読みやすい）
      secondary: '#6B6660', // ミディアムグレージュ
      disabled: '#A19B94', // ライトグレージュ
    },
    border: {
      main: '#E8E5E0', // グレージュボーダー
      light: '#F2F0ED', // ライトグレージュボーダー
    },
    input: {
      background: '#FFFFFF', // 入力フィールドは白のまま
      border: '#D6D2CC', // グレージュボーダー
      focused: '#3B82F6', // ブランドライトブルー（アクセントは同じ）
      text: '#2C2A26', // 入力テキスト色（ダークグレージュ）
      placeholder: '#A19B94', // プレースホルダー色（ライトグレージュ）
    },
    divider: '#EFEEE9', // グレージュディバイダー
  },

  // 後方互換性のため（削除予定）
  background: {
    primary: '#0F172A',
    secondary: '#1E293B',
    dark: '#0F172A',
    paper: '#1E293B',
    card: '#334155',
  },
  text: {
    primary: '#F8F9FA',
    secondary: '#CED4DA',
    disabled: '#6C757D',
  },
  border: {
    main: '#334155',
  },
  input: {
    background: '#1E293B',
    border: '#334155',
    focused: '#4B7BF5',
  },
  divider: '#2D3748',
};

// テーマ取得ヘルパー関数
export const getThemeColors = (theme: ThemeType) => {
  return theme === 'dark' ? colors.dark : colors.light;
};