import { ReactNode } from 'react';

// プラットフォーム共通の基本プロパティ
export interface BaseComponentProps {
  children?: ReactNode;
  className?: string;
  testID?: string;
}

// サイズバリアント
export type SizeVariant = 'sm' | 'md' | 'lg' | 'xl';

// カラーバリアント
export type ColorVariant = 'primary' | 'secondary' | 'scaffold' | 'danger' | 'warning' | 'success';

// ボタンプロパティ
export interface ButtonProps extends BaseComponentProps {
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  size?: SizeVariant;
  color?: ColorVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onPress?: () => void;
  onClick?: () => void; // Web用
}

// 入力フィールドプロパティ
export interface InputFieldProps extends BaseComponentProps {
  label?: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  type?: 'text' | 'number' | 'email' | 'password';
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (value: string | number) => void;
  onChangeText?: (text: string) => void; // React Native用
}

// カードプロパティ
export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: SizeVariant;
  title?: string;
  subtitle?: string;
}

// スイッチプロパティ
export interface SwitchFieldProps extends BaseComponentProps {
  label?: string;
  value?: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}

// ラジオボタンプロパティ
export interface RadioOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface RadioFieldProps extends BaseComponentProps {
  label?: string;
  options: RadioOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  direction?: 'row' | 'column';
}

// レイアウトプロパティ
export interface LayoutProps extends BaseComponentProps {
  direction?: 'row' | 'column';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch';
  gap?: SizeVariant;
  padding?: SizeVariant;
  margin?: SizeVariant;
}

// プラットフォーム検出
export type Platform = 'web' | 'native';

// テーマプロパティ
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: Record<SizeVariant, number>;
  borderRadius: Record<SizeVariant, number>;
  fontSize: Record<SizeVariant, number>;
}