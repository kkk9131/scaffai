# CloudeCode GitHub Action 問題分析レポート

## 調査概要

scaffai リポジトリの claudecode GitHub Action が動作しない問題について調査を行いました。

## 現在の状況

### 設定されているWorkflow

1. **claude-code-review.yml** - 自動コードレビュー
2. **claude.yml** - @claude メンション対応

### 過去の成功事例

- 2025年7月10日のPR #41で Claude が正常に動作
- 実際にコードレビューを実行し、包括的なフィードバックを提供
- GitHub Actions run ID: 16198036525

## 考えられる原因

### 1. 認証関連の問題

#### CLAUDE_CODE_OAUTH_TOKEN の問題
- **症状**: `secrets.CLAUDE_CODE_OAUTH_TOKEN` が設定されていない、または有効期限切れ
- **確認方法**: 
  - GitHub リポジトリの Settings > Secrets and variables > Actions を確認
  - `CLAUDE_CODE_OAUTH_TOKEN` が存在するか確認
  - トークンの有効期限を確認

#### 推奨対応
```yaml
# .github/workflows/claude.yml (エラーハンドリング追加)
- name: Run Claude Code
  id: claude
  uses: anthropics/claude-code-action@beta
  with:
    claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 2. Beta版の安定性問題

#### 現在の設定
```yaml
uses: anthropics/claude-code-action@beta
```

#### 推奨対応
```yaml
# より安定したバージョンの使用を検討
uses: anthropics/claude-code-action@v1.0.0  # 利用可能な場合
```

### 3. Anthropic サービスの問題

#### 最近の障害履歴
- 2025年3月24日: Claude.ai, Console, API で障害発生
- 2025年2月23日: Claude 3.5 Sonnet と Haiku 3 でエラー増加

#### 対応策
- [Anthropic Status Page](https://status.anthropic.com/) で現在の状況を確認
- 障害発生時は自動的にリトライする仕組みを追加

### 4. 権限設定の問題

#### 現在の権限設定
```yaml
permissions:
  contents: read
  pull-requests: read
  issues: read
  id-token: write
  actions: read
```

#### 推奨対応
```yaml
permissions:
  contents: read
  pull-requests: write  # コメント作成に必要
  issues: write         # issueコメントに必要
  id-token: write
  actions: read
```

### 5. トリガー条件の問題

#### 現在のトリガー条件
```yaml
if: |
  (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
  (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
  (github.event_name == 'pull_request_review' && contains(github.event.review.body, '@claude')) ||
  (github.event_name == 'issues' && (contains(github.event.issue.body, '@claude') || contains(github.event.issue.title, '@claude')))
```

#### 問題の可能性
- `@claude` メンションが正確に検出されない
- 大文字小文字の区別
- 全角文字の混在

## 推奨修正案

### 1. デバッグ情報の追加

```yaml
name: Claude Code Debug

on:
  issue_comment:
    types: [created]

jobs:
  debug:
    runs-on: ubuntu-latest
    steps:
      - name: Debug Event
        run: |
          echo "Event name: ${{ github.event_name }}"
          echo "Comment body: ${{ github.event.comment.body }}"
          echo "Contains @claude: ${{ contains(github.event.comment.body, '@claude') }}"
          echo "Repository: ${{ github.repository }}"
```

### 2. エラーハンドリングの強化

```yaml
- name: Run Claude Code
  id: claude
  uses: anthropics/claude-code-action@beta
  with:
    claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
  continue-on-error: true

- name: Handle Claude Error
  if: steps.claude.outcome == 'failure'
  run: |
    echo "Claude execution failed. Please check:"
    echo "1. CLAUDE_CODE_OAUTH_TOKEN secret"
    echo "2. Anthropic service status"
    echo "3. Repository permissions"
```

### 3. 手動テスト用ワークフロー

```yaml
name: Test Claude Code

on:
  workflow_dispatch:
    inputs:
      test_comment:
        description: 'Test comment for Claude'
        required: true
        default: '@claude Please help with this test'

jobs:
  test-claude:
    runs-on: ubuntu-latest
    steps:
      - name: Test Claude Response
        uses: anthropics/claude-code-action@beta
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          direct_prompt: ${{ github.event.inputs.test_comment }}
```

## 即座に実行可能な診断手順

### 1. 認証確認
```bash
# GitHub CLI を使用して secrets を確認
gh secret list --repo kkk9131/scaffai
```

### 2. 権限確認
```bash
# 現在のユーザーの権限を確認
gh api repos/kkk9131/scaffai/collaborators/$(gh api user --jq .login) --jq .permission
```

### 3. 最新のワークフロー実行状況確認
```bash
# 最新の Actions 実行状況を確認
gh run list --repo kkk9131/scaffai --limit 10
```

## 次のステップ

1. **即座に実行**:
   - `CLAUDE_CODE_OAUTH_TOKEN` の有効性確認
   - 権限設定の修正
   - デバッグワークフローの追加

2. **短期的対応**:
   - エラーハンドリングの強化
   - 手動テスト機能の追加
   - ログ出力の改善

3. **長期的対応**:
   - 安定版への移行検討
   - 代替手段の検討
   - 監視システムの導入

## 結論

Claude GitHub Action が動作しない主な原因は以下の可能性が高いです：

1. **認証トークンの問題** (最も可能性が高い)
2. **権限設定の不足**
3. **Beta版の不安定性**
4. **Anthropic サービスの一時的な問題**

まずは `CLAUDE_CODE_OAUTH_TOKEN` の確認から始めることをお勧めします。