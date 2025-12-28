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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900">議事録管理</h1>
              <nav className="flex gap-1">
                <a
                  href="/create"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📝 作成
                </a>
                <a
                  href="/settings"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ⚙️ 設定
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {session.user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-700">{session.user.email}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* ページタイトル */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">領収書から議事録を作成</h2>
            <p className="mt-1 text-sm text-gray-600">
              領収書画像をアップロードして、自動的に日時を抽出します
            </p>
          </div>

          {/* 画像アップロードカード */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📸</span>
              <h3 className="text-lg font-semibold text-gray-900">領収書画像</h3>
            </div>
            <ImageUploader
              onImageSelect={handleImageSelect}
              onImageClear={handleImageClear}
              imagePreview={imagePreview}
            />
          </div>

          {/* 日時入力カード */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📅</span>
              <h3 className="text-lg font-semibold text-gray-900">日時</h3>
              {isExtracting && (
                <span className="ml-auto text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  抽出中...
                </span>
              )}
              {isAutoExtracted && !isExtracting && (
                <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  ✓ 自動抽出
                </span>
              )}
            </div>
            <DateTimeInput
              date={date}
              time={time}
              onDateChange={setDate}
              onTimeChange={setTime}
              isAutoExtracted={isAutoExtracted}
              isExtracting={isExtracting}
            />
          </div>

          {/* 議題選択カード */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📋</span>
              <h3 className="text-lg font-semibold text-gray-900">議題</h3>
            </div>
            <TopicSelector
              topics={MOCK_TOPICS}
              selectedTopicIds={selectedTopicIds}
              onTopicToggle={handleTopicToggle}
              isLoading={false}
            />
          </div>

          {/* 作成ボタン */}
          <div className="sticky bottom-4">
            <button
              onClick={handleCreateMinute}
              disabled={!isFormValid || isSaving}
              className={`
                w-full px-6 py-4 text-white rounded-xl font-semibold text-base
                shadow-lg transition-all duration-200
                focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50
                ${
                  isFormValid && !isSaving
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:-translate-y-0.5"
                    : "bg-gray-300 cursor-not-allowed"
                }
              `}
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  作成中...
                </span>
              ) : (
                "✨ 議事録を作成"
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
