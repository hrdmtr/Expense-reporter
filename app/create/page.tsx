"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 未認証の場合はログイン画面にリダイレクト
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

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
          <h1 className="text-2xl font-bold text-gray-900">
            議事録作成
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session.user.email}
            </span>
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
            {/* 画像アップロードエリア（Phase 3で実装） */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500">
                領収書画像アップロード機能（実装予定）
              </p>
            </div>

            {/* 日時入力エリア（Phase 3で実装） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                日時
              </label>
              <input
                type="text"
                placeholder="YYYY-MM-DD HH:MM"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              />
            </div>

            {/* 議題選択エリア（Phase 3で実装） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                議題
              </label>
              <div className="text-gray-500">
                議題選択機能（実装予定）
              </div>
            </div>

            {/* 議事録作成ボタン */}
            <button
              className="w-full px-4 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled
            >
              議事録を作成
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
