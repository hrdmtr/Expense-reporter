"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Upload, Calendar, FileText, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TopicMaster, DateTimeResult } from "@/types";

export default function CreatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAutoExtracted, setIsAutoExtracted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 議題マスタ管理
  const [topics, setTopics] = useState<TopicMaster[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // 議題マスタを取得
  const loadTopics = async () => {
    setIsLoadingTopics(true);
    setTopicsError(null);

    try {
      const masterSheetUrl = localStorage.getItem("masterSheetUrl");

      if (!masterSheetUrl) {
        setTopicsError("設定画面で議題マスタシートURLを設定してください");
        setTopics([]);
        return;
      }

      const response = await fetch(`/api/topics?masterSheetUrl=${encodeURIComponent(masterSheetUrl)}`);
      const result = await response.json();

      if (result.success) {
        setTopics(result.topics);
      } else {
        setTopicsError(result.error || "議題の取得に失敗しました");
        setTopics([]);
      }
    } catch (error) {
      console.error("Topics Load Error:", error);
      setTopicsError("議題の読み込み中にエラーが発生しました");
      setTopics([]);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadTopics();
    }
  }, [status]);

  const handleImageSelect = async (file: File) => {
    setSelectedFile(file);

    // PDFの場合は画像に変換
    if (file.type === "application/pdf") {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Canvas context not available");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.95);
        setImagePreview(imageDataUrl);

        // 画像に変換したデータでOCR実行
        await extractDateTimeFromBase64(imageDataUrl);
      } catch (error) {
        console.error("PDF処理エラー:", error);
        alert("PDFの読み込みに失敗しました");
      }
    } else {
      // 通常の画像ファイル
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      await extractDateTime(file);
    }
  };

  const handleImageClear = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setDate("");
    setTime("");
    setIsAutoExtracted(false);
  };

  const extractDateTimeFromBase64 = async (base64: string) => {
    setIsExtracting(true);

    try {
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
    } catch (error) {
      console.error("OCR Error:", error);
      alert("日時の抽出中にエラーが発生しました");
    } finally {
      setIsExtracting(false);
    }
  };

  const extractDateTime = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        await extractDateTimeFromBase64(base64);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("OCR Error:", error);
      alert("日時の抽出中にエラーが発生しました");
      setIsExtracting(false);
    }
  };

  const handleCreateMinute = async () => {
    if (!date) {
      alert("日付を入力してください");
      return;
    }

    if (selectedTopicIds.length === 0) {
      alert("議題を選択してください");
      return;
    }

    setIsSaving(true);

    try {
      const outputSheetUrl = localStorage.getItem("outputSheetUrl");

      if (!outputSheetUrl) {
        alert("設定画面で議事録出力先シートURLを設定してください");
        setIsSaving(false);
        return;
      }

      // 選択された議題のIDから議題名を取得
      const topicNames = selectedTopicIds
        .map((id) => topics.find((topic) => topic.id === id)?.name)
        .filter((name): name is string => !!name);

      const response = await fetch("/api/save-minute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          outputSheetUrl,
          date,
          time: time || "", // 時刻が未入力の場合は空文字列
          topicNames,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`議事録を作成しました！\n日時: ${date} ${time}\n議題数: ${selectedTopicIds.length}件`);
        handleImageClear();
        setSelectedTopicIds([]);
      } else {
        alert(`エラー: ${result.error}`);
      }
    } catch (error) {
      console.error("Save Error:", error);
      alert("議事録の作成中にエラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  };

  // 日付と議題があれば作成可能（画像は任意）
  const isFormValid = date && selectedTopicIds.length > 0;

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
              <Button variant="default" size="sm" asChild>
                <a href="/create">作成</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
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
            <h2 className="text-3xl font-bold tracking-tight">議事録作成</h2>
            <p className="text-muted-foreground mt-2">
              領収書画像をアップロードして、自動的に日時を抽出します
            </p>
          </div>

          {/* 画像アップロード */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                領収書画像
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!imagePreview ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    isDragging ? "border-primary bg-accent" : "border-border hover:border-primary"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      handleImageSelect(files[0]);
                    }
                  }}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        handleImageSelect(files[0]);
                      }
                    }}
                  />
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">クリックして選択</span>
                    {" "}または画像をドラッグ&ドロップ
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPEG、PNG、PDF（最大10MB）
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">アップロード完了</p>
                    <Button variant="ghost" size="sm" onClick={handleImageClear}>
                      削除
                    </Button>
                  </div>
                  <img
                    src={imagePreview}
                    alt="領収書プレビュー"
                    className="max-h-96 w-full object-contain rounded-lg border"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 日時入力 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                日時
                {isExtracting && (
                  <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    抽出中...
                  </span>
                )}
                {isAutoExtracted && !isExtracting && (
                  <span className="ml-auto text-xs text-green-600">✓ 自動抽出</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">日付</Label>
                  <Input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={isExtracting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">時刻</Label>
                  <Input
                    type="time"
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    disabled={isExtracting}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 議題選択 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    議題
                    {isLoadingTopics && (
                      <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        読み込み中...
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    複数の議題を選択できます
                    {selectedTopicIds.length > 0 && (
                      <span className="ml-2 font-medium text-foreground">
                        （{selectedTopicIds.length}件選択中）
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadTopics}
                  disabled={isLoadingTopics}
                  className="ml-4"
                >
                  {isLoadingTopics ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      更新中...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      リフレッシュ
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {topicsError ? (
                <div className="text-center py-8">
                  <p className="text-sm text-destructive mb-2">{topicsError}</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/settings">設定画面へ</a>
                  </Button>
                </div>
              ) : topics.length === 0 && !isLoadingTopics ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm mb-2">議題マスタシートに議題が登録されていません</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/settings">設定を確認</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {topics.map((topic) => (
                    <div key={topic.id} className="flex items-center space-x-3 rounded-md border p-4">
                      <Checkbox
                        id={topic.id}
                        checked={selectedTopicIds.includes(topic.id)}
                        onCheckedChange={(checked) => {
                          setSelectedTopicIds((prev) =>
                            checked
                              ? [...prev, topic.id]
                              : prev.filter((id) => id !== topic.id)
                          );
                        }}
                        disabled={isLoadingTopics}
                      />
                      <Label
                        htmlFor={topic.id}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        {topic.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 作成ボタン */}
          <Button
            onClick={handleCreateMinute}
            disabled={!isFormValid || isSaving}
            className="w-full"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                作成中...
              </>
            ) : (
              "議事録を作成"
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
