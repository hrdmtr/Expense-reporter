import { google } from 'googleapis';

/**
 * Google Sheets API認証クライアントを取得
 */
export function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
}

/**
 * スプレッドシートURLからIDを抽出
 */
export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/**
 * 議題マスタをGoogle Sheetsから取得
 * シート形式: A列にID、B列に議題名
 */
export async function fetchTopicsFromSheet(spreadsheetUrl: string) {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);

  if (!spreadsheetId) {
    throw new Error('無効なスプレッドシートURLです');
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:B', // シート名とセル範囲（必要に応じて調整）
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return [];
    }

    // ヘッダー行をスキップして、データ行から議題を抽出
    const topics = rows.slice(1).map((row) => ({
      id: row[0] || '',
      name: row[1] || '',
    })).filter((topic) => topic.id && topic.name);

    return topics;
  } catch (error) {
    console.error('Google Sheets API Error:', error);
    throw new Error('スプレッドシートの読み込みに失敗しました');
  }
}
