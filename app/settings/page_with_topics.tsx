"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Sheet, Loader2, Info, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TopicMaster } from "@/types";

// デフォルトの議題マスタ
const DEFAULT_TOPICS: TopicMaster[] = [
  { id: "1", name: "新商品企画会議" },
  { id: "2", name: "営業戦略会議" },
  { id: "3", name: "四半期決算報告会議" },
  { id: "4", name: "システム改善会議" },
  { id: "5", name: "社内研修" },
];

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [masterSheetUrl, setMasterSheetUrl] = useState("");
  const [outputSheetUrl, setOutputSheetUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 議題マスタ管理
  const [topics, setTopics] = useState<TopicMaster[]>([]);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTopicName, setEditingTopicName] = useState("");
  const [newTopicName, setNewTopicName] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMasterUrl = localStorage.getItem("masterSheetUrl");
      const savedOutputUrl = localStorage.getItem("outputSheetUrl");
      const savedTopics = localStorage.getItem("topicMaster");

      if (savedMasterUrl) setMasterSheetUrl(savedMasterUrl);
      if (savedOutputUrl) setOutputSheetUrl(savedOutputUrl);

      if (savedTopics) {
        setTopics(JSON.parse(savedTopics));
      } else {
        // 初回はデフォルトの議題を設定
        setTopics(DEFAULT_TOPICS);
        localStorage.setItem("topicMaster", JSON.stringify(DEFAULT_TOPICS));
      }
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

  const handleAddTopic = () => {
    if (!newTopicName.trim()) {
      alert("議題名を入力してください");
      return;
    }

    const newTopic: TopicMaster = {
      id: Date.now().toString(),
      name: newTopicName.trim(),
    };

    const updatedTopics = [...topics, newTopic];
    setTopics(updatedTopics);
    localStorage.setItem("topicMaster", JSON.stringify(updatedTopics));
    setNewTopicName("");
  };

  const handleStartEdit = (topic: TopicMaster) => {
    setEditingTopicId(topic.id);
    setEditingTopicName(topic.name);
  };

  const handleSaveEdit = () => {
    if (!editingTopicName.trim()) {
      alert("議題名を入力してください");
      return;
    }

    const updatedTopics = topics.map((topic) =>
      topic.id === editingTopicId
        ? { ...topic, name: editingTopicName.trim() }
        : topic
    );

    setTopics(updatedTopics);
    localStorage.setItem("topicMaster", JSON.stringify(updatedTopics));
    setEditingTopicId(null);
    setEditingTopicName("");
  };

  const handleCancelEdit = () => {
    setEditingTopicId(null);
    setEditingTopicName("");
  };

  const handleDeleteTopic = (topicId: string) => {
    if (!confirm("この議題を削除しますか？")) {
      return;
    }

    const updatedTopics = topics.filter((topic) => topic.id !== topicId);
    setTopics(updatedTopics);
    localStorage.setItem("topicMaster", JSON.stringify(updatedTopics));
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
                議事録作成時に選択できる議題を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 新規追加 */}
              <div className="flex gap-2">
                <Input
                  placeholder="新しい議題名を入力..."
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddTopic();
                    }
                  }}
                />
                <Button onClick={handleAddTopic}>
                  <Plus className="h-4 w-4 mr-2" />
                  追加
                </Button>
              </div>

              {/* 議題一覧 */}
              <div className="space-y-2">
                {topics.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    議題がありません。上のフォームから追加してください。
                  </div>
                ) : (
                  topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="flex items-center gap-2 p-3 border rounded-lg"
                    >
                      {editingTopicId === topic.id ? (
                        <>
                          <Input
                            value={editingTopicName}
                            onChange={(e) => setEditingTopicName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleSaveEdit();
                              }
                            }}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={handleSaveEdit}>
                            保存
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                            キャンセル
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1">{topic.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEdit(topic)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTopic(topic.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
