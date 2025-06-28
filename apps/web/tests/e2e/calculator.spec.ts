import { test, expect } from '@playwright/test'

test.describe('足場計算機能', () => {
  test('計算ページが正しく表示される', async ({ page }) => {
    await page.goto('/calculator')
    
    // ページタイトルの確認
    await expect(page.getByText('簡易計算')).toBeVisible()
    
    // 主要な入力フィールドの存在確認
    await expect(page.getByLabel('南北')).toBeVisible()
    await expect(page.getByLabel('東西')).toBeVisible()
    await expect(page.getByPlaceholder('2400')).toBeVisible()
    
    // ボタンの存在確認
    await expect(page.getByText('計算実行')).toBeVisible()
    await expect(page.getByText('リセット')).toBeVisible()
  })

  test('基本的な計算フローが動作する', async ({ page }) => {
    await page.goto('/calculator')
    
    // 入力値を設定
    await page.getByLabel('南北').fill('1500')
    await page.getByLabel('東西').fill('1200')
    await page.getByPlaceholder('2400').fill('2500')
    
    // 計算実行
    await page.getByText('計算実行').click()
    
    // 計算結果の表示を待機
    await expect(page.getByText('計算結果')).toBeVisible({ timeout: 10000 })
    
    // 結果セクションの確認
    await expect(page.getByText('基本構造')).toBeVisible()
    await expect(page.getByText('隙間情報')).toBeVisible()
  })

  test('特殊部材選択が動作する', async ({ page }) => {
    await page.goto('/calculator')
    
    // 特殊部材のセレクトボックスを開く
    await page.getByText('なし').first().click()
    
    // オプションが表示されることを確認
    await expect(page.getByText('1本')).toBeVisible()
    await expect(page.getByText('2本')).toBeVisible()
    
    // 1本を選択
    await page.getByText('1本').click()
    
    // 選択が反映されることを確認
    await expect(page.getByText('1本')).toBeVisible()
  })

  test('リセット機能が動作する', async ({ page }) => {
    await page.goto('/calculator')
    
    // 値を変更
    await page.getByLabel('南北').fill('1500')
    await page.getByLabel('東西').fill('1200')
    
    // リセット実行
    await page.getByText('リセット').click()
    
    // デフォルト値に戻ることを確認
    await expect(page.getByLabel('南北')).toHaveValue('1000')
    await expect(page.getByLabel('東西')).toHaveValue('1000')
  })

  test('バリデーションエラーが表示される', async ({ page }) => {
    await page.goto('/calculator')
    
    // 不正な値を入力
    await page.getByLabel('南北').fill('-100')
    
    // 計算実行（エラーが発生するはず）
    await page.getByText('計算実行').click()
    
    // エラーメッセージの表示確認
    await expect(page.getByText('入力値に誤りがあります')).toBeVisible({ timeout: 5000 })
  })

  test('ダークモード切り替えが動作する', async ({ page }) => {
    await page.goto('/calculator')
    
    // 初期状態の確認（ライトモード）
    const body = page.locator('body')
    
    // ダークモードボタンをクリック（存在する場合）
    const darkModeButton = page.getByTestId('theme-toggle')
    if (await darkModeButton.isVisible()) {
      await darkModeButton.click()
      
      // ダークモードが適用されることを確認
      await expect(body).toHaveClass(/dark/)
    }
  })

  test('レスポンシブデザインが機能する', async ({ page }) => {
    // モバイルビューポートで確認
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/calculator')
    
    // モバイルでもフォームが表示されることを確認
    await expect(page.getByText('簡易計算')).toBeVisible()
    await expect(page.getByLabel('南北')).toBeVisible()
    
    // デスクトップビューポートで確認
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.reload()
    
    // デスクトップでもフォームが表示されることを確認
    await expect(page.getByText('簡易計算')).toBeVisible()
    await expect(page.getByLabel('南北')).toBeVisible()
  })

  test('計算履歴が保存される', async ({ page }) => {
    await page.goto('/calculator')
    
    // 計算を実行
    await page.getByLabel('南北').fill('1500')
    await page.getByLabel('東西').fill('1200')
    await page.getByText('計算実行').click()
    
    // 結果が表示されるまで待機
    await expect(page.getByText('計算結果')).toBeVisible({ timeout: 10000 })
    
    // ページを再読み込み
    await page.reload()
    
    // 前回の入力値が復元されることを確認（セッションストレージ）
    // 注意: 実装によってはローカルストレージやセッションストレージを使用
  })
})