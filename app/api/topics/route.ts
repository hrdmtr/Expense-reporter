import { NextRequest, NextResponse } from "next/server";
import { fetchTopicsFromSheet } from "@/lib/sheets";

/**
 * 議題マスタを取得するAPIエンドポイント
 * GET /api/topics?masterSheetUrl=<URL>
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const masterSheetUrl = searchParams.get("masterSheetUrl");

    if (!masterSheetUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "議題マスタシートURLが設定されていません",
          topics: []
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
          topics: []
        },
        { status: 500 }
      );
    }

    const topics = await fetchTopicsFromSheet(masterSheetUrl);

    return NextResponse.json({
      success: true,
      topics,
    });
  } catch (error) {
    console.error("Topics API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "議題の取得に失敗しました",
        topics: []
      },
      { status: 500 }
    );
  }
}
