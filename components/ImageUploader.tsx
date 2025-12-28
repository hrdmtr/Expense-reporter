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
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 bg-white"
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
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-blue-600 hover:text-blue-500">
                クリックして選択
              </span>
              {" "}または画像をドラッグ&ドロップ
            </div>
            <p className="text-xs text-gray-500">
              JPEG, PNG, PDF（最大10MB）
            </p>
          </div>
        </div>
      ) : (
        <div className="relative border-2 border-gray-300 rounded-lg p-4 bg-white">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-gray-700">
              アップロード済み画像
            </p>
            <button
              onClick={handleClear}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              削除
            </button>
          </div>
          <div className="mt-2">
            <img
              src={imagePreview}
              alt="領収書プレビュー"
              className="max-w-full h-auto rounded border border-gray-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}
