"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import DateTimeInput from "@/components/DateTimeInput";
import TopicSelector from "@/components/TopicSelector";
import { TopicMaster, DateTimeResult } from "@/types";

// モックデータ（Phase 5でGoogle Sheets APIから取得）
const MOCK_TOPICS: TopicMaster[] = [
  { id: "1", name: "新商品企画会議" },
  { id: "2", name: "営業戦略会議" },
  { id: "3", name: "四半期決算報告会議" },
  { id: "4", name: "システム改善会議" },
  { id: "5", name: "社内研修" },
];

export default function CreatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAutoExtracted, setIsAutoExtracted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 未認証の場合はログイン画面にリダイレクト
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // 画像選択時の処理
  const handleImageSelect = async (file: File) => {
    setSelectedFile(file);

    // プレビュー作成
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // OCR処理を自動実行
    await extractDateTime(file);
  };

  // 画像クリア
  const handleImageClear = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setDate("");
    setTime("");
    setIsAutoExtracted(false);
  };

  // OCR処理（日時抽出）
  const extractDateTime = async (file: File) => {
    setIsExtracting(true);

    try {
      // 画像をBase64に変換
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;

        // OCR APIを呼び出し
        const response = await fetch("/api/extract-datetime", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageBase64: base64 }),
        });

        const result: DateTimeResult = await response.json();

        if (result.success) {
          setDate(result.date);
          setTime(result.time);
          setIsAutoExtracted(true);
        } else {
          alert("日時の自動抽出に失敗しました。手動で入力してください。");
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("OCR Error:", error);
      alert("日時の抽出中にエラーが発生しました");
    } finally {
      setIsExtracting(false);
    }
  };

  // 議題の選択/解除
  const handleTopicToggle = (topicId: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  // 議事録作成
  const handleCreateMinute = async () => {
    // バリデーション
    if (!date || !time) {
      alert("日時を入力してください");
      return;
    }

    if (selectedTopicIds.length === 0) {
      alert("議題を選択してください");
      return;
    }

    setIsSaving(true);

    try {
      // Phase 5でGoogle Sheets APIに保存
      // 現時点ではモック処理
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert(`議事録を作成しました！\n日時: ${date} ${time}\n議題数: ${selectedTopicIds.length}件`);

      // フォームをリセット
      handleImageClear();
      setSelectedTopicIds([]);
    } catch (error) {
      console.error("Save Error:", error);
      alert("議事録の作成中にエラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  };

  // バリデーション
  const isFormValid = date && time && selectedTopicIds.length > 0;

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">議事録作成</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            領収書から議事録を作成
          </h2>

          <div className="space-y-6">
            {/* 画像アップロードエリア */}
            <ImageUploader
              onImageSelect={handleImageSelect}
              onImageClear={handleImageClear}
              imagePreview={imagePreview}
            />

            {/* 日時入力エリア */}
            <DateTimeInput
              date={date}
              time={time}
              onDateChange={setDate}
              onTimeChange={setTime}
              isAutoExtracted={isAutoExtracted}
              isExtracting={isExtracting}
            />

            {/* 議題選択エリア */}
            <TopicSelector
              topics={MOCK_TOPICS}
              selectedTopicIds={selectedTopicIds}
              onTopicToggle={handleTopicToggle}
              isLoading={false}
            />

            {/* 議事録作成ボタン */}
            <button
              onClick={handleCreateMinute}
              disabled={!isFormValid || isSaving}
              className={`
                w-full px-4 py-3 text-white rounded-md font-medium
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${
                  isFormValid && !isSaving
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-300 cursor-not-allowed"
                }
              `}
            >
              {isSaving ? "作成中..." : "議事録を作成"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
