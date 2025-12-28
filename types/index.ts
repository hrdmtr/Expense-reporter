// 議事録の型定義
export interface MeetingMinute {
  date: string; // YYYY-MM-DD形式
  time: string; // HH:MM形式
  topic: string; // 議題名
  conclusion?: string; // 結論（将来拡張予定）
}

// 議題マスタの型定義
export interface TopicMaster {
  id: string; // 議題ID
  name: string; // 議題名
}

// 日時抽出結果の型定義
export interface DateTimeResult {
  date: string; // YYYY-MM-DD形式
  time: string; // HH:MM形式
  confidence: number; // 信頼度（0-1）
  success: boolean; // 抽出成功フラグ
}

// スプレッドシート設定の型定義
export interface SpreadsheetConfig {
  masterUrl: string; // 議題マスタスプレッドシートURL
  outputUrl: string; // 議事録出力先スプレッドシートURL
}
