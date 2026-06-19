# ExamServer

PearsonVUE 風の IT 資格試験オンライン演習サイト。

## 技術スタック

- Next.js 16 (App Router) / TypeScript / Tailwind CSS v4
- GitHub API (Octokit) による問題データ管理
- Vercel デプロイ

## 対応カテゴリ

- LPIC-1 101 / 102
- AWS Certified Security - Specialty
- 情報セキュリティマネジメント
- 情報処理安全確保支援士
- 一般常識（サンプル）

## 機能

- 本番モード（全問解答 → 一括採点）/ 一問一答モード（即時フィードバック）
- 一問一答レイアウト / 長文シナリオレイアウト（PC左右分割・スマホ折りたたみ）
- タイマー・フラグ・ランダム出題
- localStorage による学習進捗保存
- 管理画面（問題 CRUD・CSV/JSON 一括アップロード・GitHub API commit）
- CI バリデーション（GitHub Actions）

## ローカル開発

```bash
npm install
cp .env.example .env.local  # 環境変数を設定
npm run dev
```

## 環境変数

| 変数 | 説明 |
|------|------|
| `ADMIN_PASSWORD` | 管理画面のログインパスワード |
| `GITHUB_TOKEN` | GitHub Personal Access Token |
| `GITHUB_OWNER` | リポジトリオーナー |
| `GITHUB_REPO` | リポジトリ名 |
| `GITHUB_BRANCH` | ブランチ名（デフォルト: main） |

## バリデーション

```bash
npm run validate
```

## 開発ルール

Issue / PR の切り方、検証方針、レビュー観点は `docs/DEVELOPMENT_RULES.md` を参照してください。
