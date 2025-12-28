import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "画像データが必要です" },
        { status: 400 }
      );
    }

    // OpenAI APIキーのチェック
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI APIキーが設定されていません" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // OpenAI Vision APIで日時を抽出
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `この領収書画像から、日時情報を抽出してください。以下のJSON形式で返してください：
{
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "confidence": 0.0-1.0の信頼度,
  "success": true or false
}

日時が見つからない場合は、success: false を返してください。`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json({
        date: "",
        time: "",
        confidence: 0,
        success: false,
      });
    }

    // JSON部分を抽出
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        date: "",
        time: "",
        confidence: 0,
        success: false,
      });
    }

    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("OCR Error:", error);
    return NextResponse.json(
      {
        error: error.message || "日時抽出に失敗しました",
        date: "",
        time: "",
        confidence: 0,
        success: false,
      },
      { status: 500 }
    );
  }
}
