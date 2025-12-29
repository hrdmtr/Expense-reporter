import { NextRequest, NextResponse } from "next/server";
import { saveMeetingMinutesToSheet } from "@/lib/sheets";
import { TopicMaster } from "@/types";

/**
 * 日付からその週の月曜日を取得
 */
function getMondayOfWeek(dateStr: string): Date {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0: 日曜, 1: 月曜, ..., 6: 土曜
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 月曜日までの日数差
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return monday;
}

/**
 * 日付から週の説明文を生成（その週の月曜日の日付を使用）
 * 例: "2025年12月29日の週" を返す（12月30日が火曜日の場合、月曜日の29日を返す）
 */
function formatWeekDescription(dateStr: string): string {
  const monday = getMondayOfWeek(dateStr);
  const year = monday.getFullYear();
  const month = monday.getMonth() + 1;
  const day = monday.getDate();
  return `${year}年${month}月${day}日の週`;
}

/**
 * 議題タイプに基づいて結論を生成
 */
function generateConclusion(topic: TopicMaster, date: string): string {
  if (topic.type === "1") {
    const weekDescription = formatWeekDescription(date);
    return `${weekDescription}についての経費の報告と内容を承認した`;
  }
  // 他のタイプの場合は空文字列を返す（将来拡張可能）
  return "";
}

/**
 * 議事録をGoogle Sheetsに保存するAPIエンドポイント
 * POST /api/save-minute
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { outputSheetUrl, date, time, topics } = body;

    // バリデーション（時刻は任意）
    if (!outputSheetUrl || !date || !topics || topics.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "必須パラメータが不足しています（日付と議題が必要です）",
        },
        { status: 400 }
      );
    }

    // Google Service Accountの認証情報チェック
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Google Service Accountの認証情報が設定されていません",
        },
        { status: 500 }
      );
    }

    // 議題ごとに結論を生成
    const topicsWithConclusions = (topics as TopicMaster[]).map((topic) => ({
      name: topic.name,
      conclusion: generateConclusion(topic, date),
    }));

    await saveMeetingMinutesToSheet(outputSheetUrl, date, time, topicsWithConclusions);

    return NextResponse.json({
      success: true,
      message: "議事録を保存しました",
    });
  } catch (error) {
    console.error("Save Minute API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "議事録の保存に失敗しました",
      },
      { status: 500 }
    );
  }
}
