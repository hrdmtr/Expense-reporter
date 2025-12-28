import { NextRequest, NextResponse } from "next/server";
import { saveMeetingMinutesToSheet } from "@/lib/sheets";

/**
 * 議事録をGoogle Sheetsに保存するAPIエンドポイント
 * POST /api/save-minute
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { outputSheetUrl, date, time, topicNames } = body;

    // バリデーション（時刻は任意）
    if (!outputSheetUrl || !date || !topicNames || topicNames.length === 0) {
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

    await saveMeetingMinutesToSheet(outputSheetUrl, date, time, topicNames);

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
