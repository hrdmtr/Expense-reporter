"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [masterSheetUrl, setMasterSheetUrl] = useState("");
  const [outputSheetUrl, setOutputSheetUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 未認証の場合はログイン画面にリダイレクト
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // 設定を保存
  const handleSaveSettings = async () => {
    setIsSaving(true);

    try {
      // Phase 5で実装予定: 設定をlocalStorageまたはAPIに保存
      localStorage.setItem("masterSheetUrl", masterSheetUrl);
      localStorage.setItem("outputSheetUrl", outputSheetUrl);

      alert("設定を保存しました");
    } catch (error) {
      console.error("Save Error:", error);
      alert("設定の保存中にエラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  };

  // 設定を読み込み
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMasterUrl = localStorage.getItem("masterSheetUrl");
      const savedOutputUrl = localStorage.getItem("outputSheetUrl");

      if (savedMasterUrl) setMasterSheetUrl(savedMasterUrl);
      if (savedOutputUrl) setOutputSheetUrl(savedOutputUrl);
    }
  }, []);

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
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  📝 作成
                </a>
                <a
                  href="/settings"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
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
            <h2 className="text-2xl font-bold text-gray-900">設定</h2>
            <p className="mt-1 text-sm text-gray-600">
              Google Sheetsの連携設定と議題マスタを管理します
            </p>
          </div>

          {/* スプレッドシート設定 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-lg">📊</span>
              <h3 className="text-lg font-semibold text-gray-900">
                スプレッドシート設定
              </h3>
            </div>

            <div className="space-y-5">
              {/* 議題マスタシートURL */}
              <div>
                <label
                  htmlFor="masterSheetUrl"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  議題マスタシートURL
                </label>
                <input
                  type="url"
                  id="masterSheetUrl"
                  value={masterSheetUrl}
                  onChange={(e) => setMasterSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                />
                <p className="mt-2 text-xs text-gray-500 flex items-start gap-1">
                  <svg className="w-3 h-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>議題マスタが記載されたGoogle SheetsのURLを入力してください</span>
                </p>
              </div>

              {/* 出力先シートURL */}
              <div>
                <label
                  htmlFor="outputSheetUrl"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  議事録出力先シートURL
                </label>
                <input
                  type="url"
                  id="outputSheetUrl"
                  value={outputSheetUrl}
                  onChange={(e) => setOutputSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                />
                <p className="mt-2 text-xs text-gray-500 flex items-start gap-1">
                  <svg className="w-3 h-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>議事録を記録するGoogle SheetsのURLを入力してください</span>
                </p>
              </div>

              {/* 保存ボタン */}
              <div className="pt-2">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className={`
                    px-6 py-3 text-white rounded-lg font-semibold shadow-md transition-all
                    focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50
                    ${
                      isSaving
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
                    }
                  `}
                >
                  {isSaving ? "保存中..." : "💾 設定を保存"}
                </button>
              </div>
            </div>
          </div>

          {/* 議題マスタ管理 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-lg">📋</span>
              <h3 className="text-lg font-semibold text-gray-900">
                議題マスタ管理
              </h3>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Phase 5で実装予定
                  </p>
                  <p className="text-sm text-blue-700">
                    Google Sheetsから議題を読み込み、ここで追加・編集・削除ができるようになります。<br/>
                    現在はモックデータを使用しています。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
