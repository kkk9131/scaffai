const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.jsアプリのパスを指定
  dir: './',
})

// Jestのカスタム設定
const customJestConfig = {
  // テスト環境を設定
  testEnvironment: 'jsdom',
  
  // セットアップファイルを指定
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // モジュールパスのマッピング
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // テストファイルのパターン
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  
  // カバレッジの設定
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  
  // 無視するパターン
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/', // Playwrightテストを除外
  ],
  
  // 変換の設定
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
}

// createJestConfigを呼び出して設定をエクスポート
module.exports = createJestConfig(customJestConfig)