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
 * シート形式: A列にID、B列に議題名、C列に内容、D列にタイプ
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
      range: 'シート1!A:D', // A列～D列を取得
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return [];
    }

    // ヘッダー行をスキップして、データ行から議題を抽出
    const topics = rows.slice(1).map((row) => ({
      id: row[0] || '',
      name: row[1] || '',
      content: row[2] || '',
      type: row[3] || '',
    })).filter((topic) => topic.id && topic.name);

    return topics;
  } catch (error) {
    console.error('Google Sheets API Error:', error);
    // 元のエラーをそのままスローして詳細を保持
    throw error;
  }
}

/**
 * 議事録をGoogle Sheetsから取得
 * シート形式: A列（日付）、B列（時刻）、C列（議題）、D列（結論）
 */
export async function fetchMeetingMinutesFromSheet(spreadsheetUrl: string) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);

  if (!spreadsheetId) {
    throw new Error('無効なスプレッドシートURLです');
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'シート1!A:D', // A列～D列を取得
    });

    const rows = response.data.values;
    console.log('Google Sheetsから取得した生データ:', rows);

    if (!rows || rows.length === 0) {
      console.log('データが空です');
      return [];
    }

    // ヘッダー行（1行目）をスキップして、データ行から議事録を抽出
    const minutes = rows.slice(1).map((row) => ({
      date: row[0] || '',
      time: row[1] || '',
      topic: row[2] || '',
      conclusion: row[3] || '',
    })).filter((minute) => minute.date && minute.topic);

    console.log('フィルタリング後の議事録データ:', minutes);
    return minutes;
  } catch (error) {
    console.error('Google Sheets API Error:', error);
    throw error;
  }
}

/**
 * 議事録をGoogle Sheetsに書き込む
 * シート形式: A列（日付）、B列（時刻）、C列（議題）、D列（結論）
 * 複数議題の場合は複数行作成
 */
export async function saveMeetingMinutesToSheet(
  spreadsheetUrl: string,
  date: string,
  time: string,
  topicsWithConclusions: Array<{ name: string; conclusion: string }>
) {
  // 書き込み権限が必要なため、認証スコープを更新
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'], // 読み書き両方
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);

  if (!spreadsheetId) {
    throw new Error('無効なスプレッドシートURLです');
  }

  try {
    // シートの内容を確認（ヘッダー行の有無チェック）
    const checkResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'シート1!A:D',
    });

    const existingData = checkResponse.data.values || [];
    const hasHeader = existingData.length > 0 && existingData[0][0] === '日付';

    // ヘッダー行がない場合は挿入
    if (!hasHeader) {
      // 既存データを全て取得
      const allData = existingData;

      // ヘッダーを先頭に追加
      const newData = [
        ['日付', '時刻', '議題', '結論'],
        ...allData
      ];

      // 全データを上書き（ヘッダー付きで）
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'シート1!A1:D' + (newData.length),
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: newData,
        },
      });
    }

    // 1議題1行で記録
    const rows = topicsWithConclusions.map((topic) => [
      date,             // A列: 日付
      time,             // B列: 時刻
      topic.name,       // C列: 議題
      topic.conclusion, // D列: 結論
    ]);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'シート1!A:D', // 最終行に追記
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: rows,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Google Sheets Write Error:', error);
    throw new Error('議事録の保存に失敗しました');
  }
}
