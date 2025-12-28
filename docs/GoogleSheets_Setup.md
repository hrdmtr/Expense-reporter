# Google Sheets API セットアップガイド

このアプリケーションでは、Google Sheets API を使用して議題マスタの取得と議事録の保存を行います。

## 前提条件

- Google アカウント
- Google Cloud Platform（GCP）プロジェクト

## 1. Google Cloud Platform プロジェクトの作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. プロジェクト名を「Expense-reporter」などに設定

## 2. Google Sheets API の有効化

1. Google Cloud Console のナビゲーションメニューから「APIとサービス」→「ライブラリ」を選択
2. 「Google Sheets API」を検索
3. 「有効にする」をクリック

## 3. Service Account の作成

1. ナビゲーションメニューから「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「サービスアカウント」をクリック
3. サービスアカウント名を入力（例: `expense-reporter-bot`）
4. 「作成して続行」をクリック
5. ロールは選択不要（スキップ可能）
6. 「完了」をクリック

## 4. Service Account キーの作成

1. 作成したサービスアカウントをクリック
2. 「キー」タブを選択
3. 「鍵を追加」→「新しい鍵を作成」をクリック
4. キーのタイプで「JSON」を選択
5. 「作成」をクリック
6. JSONファイルがダウンロードされる（**重要**: このファイルは安全に保管）

## 5. 環境変数の設定

ダウンロードした JSON ファイルを開き、以下の情報を `.env.local` ファイルに設定します。

```bash
# Google Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-here\n-----END PRIVATE KEY-----\n"
```

**注意**: `GOOGLE_PRIVATE_KEY` は改行文字（`\n`）を含むため、ダブルクォーテーションで囲む必要があります。

### JSONファイルの例:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "expense-reporter-bot@your-project-id.iam.gserviceaccount.com",
  "client_id": "...",
  ...
}
```

この場合:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` = `client_email` の値
- `GOOGLE_PRIVATE_KEY` = `private_key` の値（改行を `\n` に置換）

## 6. Google Sheets の準備

### 議題マスタシート

議題マスタシートは以下の形式で作成してください。

| A列（ID） | B列（議題名） |
|-----------|---------------|
| 1         | 新商品企画会議 |
| 2         | 営業戦略会議  |
| 3         | 四半期決算報告会議 |
| 4         | システム改善会議 |
| 5         | 社内研修      |

**重要**:
- シート名は「Sheet1」（デフォルト）を推奨
- 1行目はヘッダー行として扱われます（読み込み時にスキップ）
- A列にID、B列に議題名を入力

### 議事録出力シート

議事録出力シートは以下の形式で作成してください。

| A列（日付） | B列（時刻） | C列（議題） | D列（結論） |
|-------------|-------------|-------------|-------------|
| 2024-12-28  | 12:30       | 新商品企画会議 | 承認       |
| 2024-12-28  | 14:00       | 営業戦略会議  | 検討中     |

**重要**:
- 1行目はヘッダー行
- アプリは最終行に自動的に追記します

## 7. Service Account に権限を付与

1. 作成した Google Sheets を開く
2. 右上の「共有」ボタンをクリック
3. Service Account のメールアドレス（`GOOGLE_SERVICE_ACCOUNT_EMAIL`）を追加
4. 権限を「編集者」に設定（議題マスタは「閲覧者」でも可）
5. 「送信」をクリック

**これで Service Account がスプレッドシートにアクセスできるようになります。**

## 8. アプリケーションで設定

1. アプリケーションにログイン
2. 「設定」画面に移動
3. 議題マスタシートURLを入力（例: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`）
4. 議事録出力先シートURLを入力
5. 「設定を保存」をクリック

## トラブルシューティング

### エラー: "Google Service Accountの認証情報が設定されていません"

`.env.local` ファイルに `GOOGLE_SERVICE_ACCOUNT_EMAIL` と `GOOGLE_PRIVATE_KEY` が正しく設定されているか確認してください。

### エラー: "スプレッドシートの読み込みに失敗しました"

1. Service Account のメールアドレスがスプレッドシートに共有されているか確認
2. スプレッドシートのURLが正しいか確認
3. Google Sheets API が有効になっているか確認

### エラー: "Cannot apply unknown utility class `border-border`"

これは Tailwind CSS v4 の既知の問題です。`app/globals.css` が正しく設定されていることを確認してください。

## セキュリティに関する注意事項

- `.env.local` ファイルは絶対に Git にコミットしないでください
- Service Account の JSON キーは安全に保管してください
- 本番環境では Vercel の環境変数機能を使用してください
