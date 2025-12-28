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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 日付入力 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            日付
          </label>
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            disabled={isExtracting}
          />
        </div>

        {/* 時刻入力 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            時刻
          </label>
          <input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            disabled={isExtracting}
          />
        </div>
      </div>

      {isAutoExtracted && (
        <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-blue-700">自動抽出された日時は編集可能です</span>
        </div>
      )}
    </div>
  );
}
