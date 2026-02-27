"use client";

import { useState, useEffect } from "react";
import { Task } from "@/types";

interface Props {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
}

export default function EmailTemplateModal({ task, onClose, onEdit }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch(`/api/tasks/${task.id}/content`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setContent(data.content || "");
      } catch {
        setError("テンプレートの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [task.id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for iOS Safari
      const textarea = document.createElement("textarea");
      textarea.value = content;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Extract delivery date from memo
  const deliveryDate = task.memo.match(/メール配信日: (\S+)/)?.[1] || "";

  return (
    <div
      className="fixed inset-0 bg-black/25 z-20 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-[#fdf8f0] rounded-t-3xl w-full max-w-lg p-6 pb-24 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-[#d4c4a8] rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="mb-4">
          <h3 className="text-base font-black text-[#3d2e1e] leading-snug">
            {task.name}
          </h3>
          {deliveryDate && (
            <p className="text-xs text-[#c4b89a] mt-1">
              配信日: {deliveryDate}
            </p>
          )}
        </div>

        {/* Content area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="animate-spin h-7 w-7 border-[3px] border-[#c4a87a] border-t-transparent rounded-full" />
            <p className="text-xs text-[#c4b89a]">読み込み中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : content ? (
          <div className="bg-white/60 rounded-xl p-4 border border-[#ece2d0]">
            <p className="text-sm text-[#3d2e1e] whitespace-pre-wrap leading-relaxed break-words">
              {content}
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#c4b89a] text-sm">
              テンプレートが登録されていません
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 space-y-2">
          {content && (
            <button
              onClick={handleCopy}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-[#a0845c] text-white active:bg-[#8b7355]"
              }`}
            >
              {copied ? "コピーしました!" : "メール内容をコピー"}
            </button>
          )}
          <button
            onClick={onEdit}
            className="w-full bg-white/80 text-[#a0845c] py-3 rounded-xl font-semibold text-sm border border-[#e0d0b8]"
          >
            タスクを編集
          </button>
          <button
            onClick={onClose}
            className="w-full bg-[#f5ede0] text-[#8b7355] py-3 rounded-xl font-semibold text-sm"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
