"use client";

import { ChangeEvent } from "react";

interface Props {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  isAutoExtracted: boolean;
  isExtracting: boolean;
}

export default function DateTimeInput({
  date,
  time,
  onDateChange,
  onTimeChange,
  isAutoExtracted,
  isExtracting,
}: Props) {
  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value);
  };

  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    onTimeChange(e.target.value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          日時
        </label>
        {isExtracting && (
          <span className="text-xs text-blue-600">
            日時を自動抽出中...
          </span>
        )}
        {isAutoExtracted && !isExtracting && (
          <span className="text-xs text-green-600">
            ✓ 自動抽出済み
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 日付入力 */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            日付
          </label>
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="YYYY-MM-DD"
            disabled={isExtracting}
          />
        </div>

        {/* 時刻入力 */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            時刻
          </label>
          <input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="HH:MM"
            disabled={isExtracting}
          />
        </div>
      </div>

      <p className="text-xs text-gray-500">
        画像から自動抽出された日時は編集可能です
      </p>
    </div>
  );
}
