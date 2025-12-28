# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Expense-reporter**（会議弁当経費処理用議事録管理システム）は、会議時に支給する弁当の経費処理に必要な議事録を、効率的かつ確実に作成・管理するためのWebアプリケーションです。領収書画像から日時を自動抽出し、事前定義された議題から選択することで、最小限の入力で税務要件を満たす議事録をGoogleスプレッドシートに記録します。

## Development Commands

```bash
# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバーの起動
npm start

# リント
npm run lint
```

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS または CSS Modules
- **UI Components**: shadcn/ui（検討中）
- **Authentication**: Google OAuth 2.0 (NextAuth.js)
- **OCR**: OpenAI Vision API / GPT-4 Vision
- **Data Storage**: Google Sheets API
- **Image Storage**: Vercel Blob または別のストレージ（検討中）
- **Hosting**: Vercel

## Project Structure

```
Expense-reporter/
├── app/                      # Next.js App Router
│   ├── page.tsx             # ログイン画面
│   ├── create/              # 議事録作成画面
│   │   └── page.tsx
│   ├── settings/            # 設定画面
│   │   └── page.tsx
│   └── api/                 # API routes
│       ├── auth/            # NextAuth.js
│       ├── extract-datetime/ # OCR処理
│       └── save-minute/     # スプレッドシート書き込み
├── components/
│   └── ui/                  # UIコンポーネント
├── lib/
│   ├── ocr.ts              # OCR処理ロジック
│   ├── sheets.ts           # Google Sheets操作
│   └── auth.ts             # 認証処理
├── types/
│   └── index.ts            # TypeScript型定義
├── docs/
│   └── Requirement.md      # 要件定義書
└── README.md               # プロジェクト概要
```

## Architecture & Design Principles

### Core Concepts

1. **入力の最小化**: OCRによる自動抽出 + テンプレート選択
2. **税務要件の確実性**: 必要事項（日時・議題・結論）を確実に記録
3. **認知負荷の軽減**: 定型的な作業を自動化
4. **抜け漏れ防止**: システム化により確実に記録

### Data Model

- **MeetingMinute**: 議事録（日時、議題、結論）
- **TopicMaster**: 議題マスタ（ID、議題名）
- **DateTimeResult**: 日時抽出結果（日付、時刻、信頼度）

### Screen Flow

```
ログイン画面 (/)
  → Google認証
    → 議事録作成画面 (/create)
      → 領収書画像アップロード
      → OCRで日時抽出
      → 日時確認・修正
      → 議題選択（複数可）
      → 議事録作成ボタン
        → スプレッドシートに記録
        → 完了メッセージ
```

## Initial Scope (v0.1)

現在実装予定の機能：

- ✅ ログイン画面（Google OAuth認証）
- ✅ 議事録作成画面
  - 領収書画像アップロード
  - OpenAI APIによる日時抽出
  - 日時の確認・修正
  - 議題選択（チェックボックス or ドロップダウン）
  - スプレッドシートへの記録
- ✅ 設定画面
  - 議題マスタ管理（追加・編集・削除）
  - スプレッドシートURL設定

今後実装予定：

- 結論欄の実装（議題ごとの結論候補設定）
- 議事録の検索・閲覧機能
- CSVエクスポート機能

## Development Notes

### OCR処理
- OpenAI Vision APIを使用して領収書画像から日時を抽出
- 抽出失敗時は手動入力を促す
- 信頼度が低い場合もフラグを立てる

### Google Sheets連携
- 議題マスタスプレッドシート: 議題の一覧を管理
- 議事録スプレッドシート: 議事録を1議題1行で記録
- 複数議題の場合は複数行作成

### 画像処理
- アップロード後、一時保存（Vercel Blob等）
- OCR処理後に削除
- ファイルサイズ制限: 10MB以下

### セキュリティ
- Google OAuth 2.0による認証必須
- APIキーは環境変数で管理（絶対にコミットしない）
- スプレッドシートへのアクセスは認証済みユーザーのみ

## Required Environment Variables

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# Google Sheets
SPREADSHEET_MASTER_URL=https://docs.google.com/spreadsheets/...
SPREADSHEET_OUTPUT_URL=https://docs.google.com/spreadsheets/...
```

## Important Rules

1. **ドキュメント更新**: コード変更時は関連ドキュメントも同時に更新
2. **型安全**: すべての関数に型を明示、`any`は最小限に
3. **エラーハンドリング**: すべての非同期処理にtry-catch
4. **コミットメッセージ**: 「種類: 説明」形式（例: `機能: OCR処理を追加`）
5. **ブランチ戦略**: feature/xxxブランチで開発、developにPR、mainは本番用

## Key Files to Check

- `docs/Requirement.md` - 要件定義書（必読）
- `DEVELOPMENT_RULES.md` - 開発ルール・規約
- `CURRENT_STATUS.md` - 現在の作業状況
- `.env.example` - 環境変数のサンプル
