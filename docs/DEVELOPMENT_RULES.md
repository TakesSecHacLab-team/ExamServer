# ExamServer Development Rules

## 基本方針

ExamServer は、ユーザーが理解しながら改善していく学習・試験演習サーバーです。
変更は小さく、目的・影響範囲・検証結果がレビューできる単位に分けます。

## Issue / PR の切り方

- 原則は `1 issue = 1 purpose = 1 PR` とする。
- Issue は「作業メモ」ではなく、目的・現在の問題・期待する挙動・完了条件を置く場所にする。
- PR は、対応する Issue を閉じる単位にする。
- PR 本文には `Closes #123` のように対応 Issue を書く。
- 1つの PR に、問題追加・UI改善・管理画面修正・リファクタを混ぜない。

例外:

- typo、README数行、コメント修正など、レビュー判断が明らかな小変更は Issue なし PR を許可する。
- 大きいテーマは親 Issue を作り、実装 PR は小さい子テーマに分ける。
- 既存の未整理差分は、そのまま大 PR にせず、使う変更だけを Issue 単位で切り出す。

## Branch / Commit

- `main` へ直接 push しない。
- 作業 branch は目的が分かる名前にする。
  - `fix/admin-login-link`
  - `fix/lint-category-selector`
  - `feat/java-silver-q116-130`
  - `docs/development-rules`
- commit は review しやすい粒度に分ける。
- unrelated な変更は同じ commit / PR に入れない。

## Issue に書くこと

- 目的: 何を可能にするか。
- 現在の問題: 今の挙動、困っていること、レビューで確認した事実。
- 期待する挙動: 変更後にどうなっていればよいか。
- 完了条件: どの状態なら閉じてよいか。
- 検証方法: `npm run validate`、`npm run lint`、手動確認など。

## PR に書くこと

- Summary: 何を変えたか。
- Scope: 触った範囲。
- Verification: 実行した検証と結果。
- Known Risks: 残るリスク、未確認事項、意図的に対象外にしたこと。

検証を省略した場合は、理由を書く。

## 変更種別ごとの確認

問題データ:

- `data/categories.json` の category id と `data/exams/*` のディレクトリが一致していること。
- question id が重複していないこと。
- 正答、選択肢、解説、出題形式が矛盾していないこと。
- category の並び順変更は UI 表示順への影響を確認すること。

Next.js / React:

- 内部遷移は原則 `next/link` を使う。
- Server Component / Client Component の境界を確認する。
- state、effect、依存配列、localStorage の責務を確認する。
- 画面変更は PC / mobile の主要表示を確認する。

管理画面:

- 認証、書き込み先、GitHub API commit、入力 validation、エラー表示を確認する。
- 問題データの保存形式と validation rules を崩さない。

## 最低限の検証

- 問題データに触った PR: `npm run validate`
- UI / React に触った PR: `npm run lint`
- Next.js の routing / build 前提に触った PR: `npm run build`

既存の lint / build 失敗がある場合は、PR 本文に「既存失敗」か「このPRで発生」を分けて書く。
