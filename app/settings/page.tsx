"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Sheet, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [masterSheetUrl, setMasterSheetUrl] = useState("");
  const [outputSheetUrl, setOutputSheetUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMasterUrl = localStorage.getItem("masterSheetUrl");
      const savedOutputUrl = localStorage.getItem("outputSheetUrl");

      if (savedMasterUrl) setMasterSheetUrl(savedMasterUrl);
      if (savedOutputUrl) setOutputSheetUrl(savedOutputUrl);
    }
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);

    try {
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">議事録管理</h1>
            <nav className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <a href="/create">作成</a>
              </Button>
              <Button variant="default" size="sm" asChild>
                <a href="/settings">設定</a>
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {session.user.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* ページタイトル */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">設定</h2>
            <p className="text-muted-foreground mt-2">
              Google Sheetsの連携設定と議題マスタを管理します
            </p>
          </div>

          {/* スプレッドシート設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sheet className="h-5 w-5" />
                スプレッドシート設定
              </CardTitle>
              <CardDescription>
                議題マスタと議事録出力先のGoogle SheetsのURLを設定します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="masterSheetUrl">議題マスタシートURL</Label>
                <Input
                  type="url"
                  id="masterSheetUrl"
                  value={masterSheetUrl}
                  onChange={(e) => setMasterSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                />
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>議題マスタが記載されたGoogle SheetsのURLを入力してください</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="outputSheetUrl">議事録出力先シートURL</Label>
                <Input
                  type="url"
                  id="outputSheetUrl"
                  value={outputSheetUrl}
                  onChange={(e) => setOutputSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                />
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>議事録を記録するGoogle SheetsのURLを入力してください</span>
                </p>
              </div>

              <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  "設定を保存"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 議題マスタ管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                議題マスタ管理
              </CardTitle>
              <CardDescription>
                Phase 5で実装予定
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted p-6 text-center">
                <Info className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Google Sheetsから議題を読み込み、ここで追加・編集・削除ができるようになります。
                  <br />
                  現在はモックデータを使用しています。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
