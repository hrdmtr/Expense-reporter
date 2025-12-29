import { NextRequest, NextResponse } from "next/server";
import { fetchMeetingMinutesFromSheet } from "@/lib/sheets";

/**
 * 議事録一覧をGoogle Sheetsから取得するAPIエンドポイント
 * GET /api/minutes?outputSheetUrl=...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outputSheetUrl = searchParams.get("outputSheetUrl");

    if (!outputSheetUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "outputSheetUrlパラメータが必要です",
          minutes: [],
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
          minutes: [],
        },
        { status: 500 }
      );
    }

    const minutes = await fetchMeetingMinutesFromSheet(outputSheetUrl);

    return NextResponse.json({
      success: true,
      minutes: minutes,
    });
  } catch (error) {
    console.error("Fetch Minutes API Error:", error);

    const errorMessage = error instanceof Error ? error.message : "議事録の取得に失敗しました";
    const errorDetails = error instanceof Error ? error.stack : String(error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        errorDetails: errorDetails,
        minutes: [],
      },
      { status: 500 }
    );
  }
}
