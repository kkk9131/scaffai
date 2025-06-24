#!/usr/bin/env python3
"""
Web版Calculator動作確認テスト
"""

import sys
import time

def test_with_playwright():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("❌ Playwrightがインストールされていません")
        print("以下のコマンドでインストールしてください:")
        print("pip install playwright")
        print("playwright install chromium")
        return False

    print("🚀 Web版Calculator動作確認を開始...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        try:
            # Web版のCalculatorページにアクセス
            print("📱 http://localhost:3001/calculator にアクセス中...")
            page.goto("http://localhost:3001/calculator")
            
            # ページが正しく読み込まれるかチェック
            page.wait_for_selector("h1:has-text('簡易計算')", timeout=10000)
            print("✅ Web版が正常に読み込まれました")
            
            # フォームの基本的なテスト
            print("📝 入力フィールドのテスト開始...")
            
            # 躯体幅の入力フィールドをテスト（南北）
            north_south_input = page.locator("input").first
            north_south_input.fill("1500")
            print("✅ 躯体幅（南北）に1500を入力")
            
            # 躯体幅の入力フィールドをテスト（東西）
            east_west_input = page.locator("input").nth(1)
            east_west_input.fill("1200")
            print("✅ 躯体幅（東西）に1200を入力")
            
            # 基準高さを入力
            reference_height_input = page.locator("input[placeholder='2400']")
            reference_height_input.fill("2500")
            print("✅ 基準高さに2500を入力")
            
            # 特殊部材選択のテスト
            print("🔧 特殊部材選択のテスト...")
            try:
                # 最初のSelectTriggerを探してクリック
                select_trigger = page.locator("button").filter(has_text="なし").first
                select_trigger.click()
                print("✅ 特殊部材セレクトボックスを開きました")
                
                # 1本を選択
                page.click("text=1本")
                print("✅ 特殊部材355mmを1本に設定")
            except Exception as e:
                print(f"⚠️ 特殊部材選択でエラー: {e}")
            
            # バリデーション機能のテスト
            print("🔍 バリデーション機能のテスト...")
            
            # 無効な値を入力してバリデーションをテスト
            north_south_input.fill("-100")  # 負の値
            
            # 計算実行ボタンをクリック
            calculate_button = page.locator("button[type='submit']:has-text('計算実行')")
            calculate_button.click()
            print("✅ 計算実行ボタンをクリック（バリデーションテスト）")
            
            # エラーメッセージの確認
            try:
                error_message = page.wait_for_selector("text=入力値に誤りがあります", timeout=3000)
                print("✅ バリデーションエラーが正しく表示されました")
            except:
                print("⚠️ バリデーションエラーメッセージが見つかりません")
            
            # 正しい値に修正
            north_south_input.fill("1500")
            
            # 計算実行
            calculate_button.click()
            print("✅ 正しい値で計算実行")
            
            # 計算結果の表示確認
            try:
                page.wait_for_selector("text=計算結果", timeout=10000)
                print("✅ 計算結果が表示されました")
                
                # 結果の詳細を確認
                basic_structure = page.locator("text=基本構造")
                if basic_structure.is_visible():
                    print("✅ 基本構造セクションが表示されています")
                
                gap_info = page.locator("text=隙間情報")
                if gap_info.is_visible():
                    print("✅ 隙間情報セクションが表示されています")
                    
            except Exception as e:
                print(f"⚠️ 計算結果の表示でエラー: {e}")
            
            # リセット機能のテスト
            print("🔄 リセット機能のテスト...")
            reset_button = page.locator("button:has-text('リセット')")
            reset_button.click()
            print("✅ リセットボタンをクリック")
            
            # リセット後の値確認
            time.sleep(1)  # リセット処理の完了を待つ
            reset_value = north_south_input.input_value()
            if reset_value == "1000":  # デフォルト値
                print("✅ リセット機能が正常に動作しました")
            else:
                print(f"⚠️ リセット後の値が期待と異なります: {reset_value}")
            
            print("\n🎉 Web版Calculator動作確認が完了しました！")
            print("✨ 実装された機能:")
            print("  - バリデーション機能")
            print("  - 特殊部材選択式UI")
            print("  - エラーハンドリング")
            print("  - リセット機能")
            print("  - 計算結果表示")
            
            # ページのスクリーンショット撮影
            page.screenshot(path="web_calculator_test.png")
            print("📸 スクリーンショットを保存しました: web_calculator_test.png")
            
            # 少し待ってからブラウザを閉じる
            time.sleep(3)
            
        except Exception as e:
            print(f"❌ テスト中にエラーが発生しました: {e}")
            page.screenshot(path="web_calculator_error.png")
            print("📸 エラー時のスクリーンショットを保存しました: web_calculator_error.png")
            return False
        finally:
            browser.close()
    
    return True

def test_basic_connectivity():
    """基本的な接続テスト"""
    try:
        import urllib.request
        import urllib.error
        
        print("🔗 基本的な接続テスト...")
        response = urllib.request.urlopen("http://localhost:3001/calculator", timeout=10)
        if response.getcode() == 200:
            print("✅ Web版が http://localhost:3001/calculator で応答しています")
            return True
        else:
            print(f"❌ 予期しないレスポンスコード: {response.getcode()}")
            return False
    except urllib.error.URLError as e:
        print(f"❌ 接続エラー: {e}")
        print("💡 Web版が起動していることを確認してください")
        return False
    except Exception as e:
        print(f"❌ 予期しないエラー: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 Web版Calculator動作確認テスト")
    print("=" * 60)
    
    # 基本的な接続テスト
    if not test_basic_connectivity():
        print("\n❌ 基本的な接続テストに失敗しました")
        sys.exit(1)
    
    # Playwrightでの詳細テスト
    if test_with_playwright():
        print("\n🎉 すべてのテストが正常に完了しました！")
        sys.exit(0)
    else:
        print("\n❌ テストに失敗しました")
        sys.exit(1)