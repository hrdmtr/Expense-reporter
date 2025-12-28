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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          議題
        </label>
        {selectedTopicIds.length > 0 && (
          <span className="text-xs text-gray-600">
            {selectedTopicIds.length}件選択中
          </span>
        )}
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
        {topics.map((topic) => (
          <label
            key={topic.id}
            className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedTopicIds.includes(topic.id)}
              onChange={() => onTopicToggle(topic.id)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-900">
              {topic.name}
            </span>
          </label>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        複数の議題を選択できます
      </p>
    </div>
  );
}
