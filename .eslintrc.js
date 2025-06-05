module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/prefer-const': 'error',
    
    // General ESLint rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Import/Export rules
    'import/no-unresolved': 'off', // handled by TypeScript
  },
  overrides: [
    // React/Next.js specific rules
    {
      files: ['apps/web/**/*.{ts,tsx}'],
      extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        'next/core-web-vitals',
        'prettier',
      ],
      rules: {
        'react/react-in-jsx-scope': 'off',
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
    // React Native/Expo specific rules
    {
      files: ['apps/mobile/**/*.{ts,tsx}'],
      extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        'prettier',
      ],
      plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native'],
      rules: {
        'react/react-in-jsx-scope': 'off',
        'react-hooks/exhaustive-deps': 'warn',
        'react-native/no-unused-styles': 'error',
        'react-native/split-platform-components': 'error',
        'react-native/no-inline-styles': 'warn',
        'react-native/no-color-literals': 'warn',
      },
    },
    // Package specific rules
    {
      files: ['packages/**/*.{ts,tsx}'],
      rules: {
        'no-console': 'off', // Allow console in packages for debugging
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.next/',
    '*.config.js',
    '*.config.ts',
  ],
};