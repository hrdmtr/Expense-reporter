"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 認証済みの場合は議事録作成画面にリダイレクト
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/create");
    }
  }, [status, router]);

  const handleSignIn = () => {
    signIn("google", { callbackUrl: "/create" });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            会議弁当経費処理用
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            議事録管理システム
          </h2>
          <p className="text-gray-600 mb-8">
            領収書から自動的に議事録を作成します
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Googleでログイン
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          ログインするとサービスを利用できます
        </p>
      </div>
    </div>
  );
}
