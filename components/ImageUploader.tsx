"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";

interface Props {
  onImageSelect: (file: File) => void;
  onImageClear: () => void;
  imagePreview: string | null;
}

export default function ImageUploader({ onImageSelect, onImageClear, imagePreview }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    // ファイルタイプチェック
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      alert("JPEG, PNG, またはPDFファイルのみアップロード可能です");
      return;
    }

    // ファイルサイズチェック（10MB以下）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("ファイルサイズは10MB以下にしてください");
      return;
    }

    onImageSelect(file);
  };

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImageClear();
  };

  return (
    <div className="space-y-4">
      {!imagePreview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all min-h-[240px] flex items-center justify-center
            ${isDragging
              ? "border-blue-500 bg-blue-50 scale-105"
              : "border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-white"
            }
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="text-base text-gray-700">
              <span className="font-semibold text-blue-600 hover:text-blue-700">
                クリックして選択
              </span>
              <span className="text-gray-500"> または </span>
              <span className="text-gray-600">ドラッグ&ドロップ</span>
            </div>
            <p className="text-sm text-gray-500">
              JPEG、PNG、PDF（最大10MB）
            </p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden bg-white border border-gray-200">
          <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">
                画像アップロード完了
              </p>
            </div>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
            >
              削除
            </button>
          </div>
          <div className="p-4 flex justify-center bg-gray-50">
            <img
              src={imagePreview}
              alt="領収書プレビュー"
              className="max-w-full max-h-[400px] h-auto rounded-lg shadow-md object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
