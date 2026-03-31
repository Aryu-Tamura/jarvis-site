# JARVIS Site — プロジェクトルール

## 概要
個人サイト。Markdown記事をNext.jsで静的生成。

## 技術スタック
- Next.js 15 (App Router), TypeScript, Tailwind CSS
- gray-matter, remark + rehype

## ルール
- TypeScript strict mode
- Tailwind のみ（別途CSSファイル禁止）
- 1タスク1コミット
- 全記事に frontmatter 必須 (title, date, category, tags, status)
- status: draft / in-progress / published
- 日付: YYYY-MM-DD

## デプロイ
- main ブランチへの push で Vercel が自動デプロイ