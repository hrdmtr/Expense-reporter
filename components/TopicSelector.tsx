"use client";

import { TopicMaster } from "@/types";

interface Props {
  topics: TopicMaster[];
  selectedTopicIds: string[];
  onTopicToggle: (topicId: string) => void;
  isLoading: boolean;
}

export default function TopicSelector({
  topics,
  selectedTopicIds,
  onTopicToggle,
  isLoading,
}: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          議題
        </label>
        <div className="text-sm text-gray-500">
          議題を読み込み中...
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          議題
        </label>
        <div className="text-sm text-gray-500">
          議題が登録されていません。設定画面で議題を追加してください。
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedTopicIds.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{selectedTopicIds.length}件の議題を選択中</span>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {topics.map((topic) => (
          <label
            key={topic.id}
            className={`
              flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-all
              ${
                selectedTopicIds.includes(topic.id)
                  ? "bg-blue-50 border-2 border-blue-500"
                  : "bg-gray-50 border-2 border-transparent hover:border-gray-300"
              }
            `}
          >
            <input
              type="checkbox"
              checked={selectedTopicIds.includes(topic.id)}
              onChange={() => onTopicToggle(topic.id)}
              className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded transition-all"
            />
            <span className={`text-sm font-medium ${
              selectedTopicIds.includes(topic.id) ? "text-blue-900" : "text-gray-700"
            }`}>
              {topic.name}
            </span>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        複数の議題を選択できます
      </div>
    </div>
  );
}
