/**
 * 試験画面の外枠
 * ヘッダー（カテゴリ名・問番号・タイマー）、本体エリア、フッター（ナビ）を提供する。
 */

"use client";

import { ReactNode } from "react";
import type { AnswerState } from "@/types/exam";
import QuestionNav from "@/components/exam/QuestionNav";

interface Props {
  categoryName: string;
  currentIndex: number;
  totalCount: number;
  answers: AnswerState[];
  /** タイマー表示（nullの場合は非表示） */
  remainingTime: number | null;
  isFlagged: boolean;
  /** シナリオ問題の場合 true — 本体エリアを広く取る */
  isScenario?: boolean;
  onFlag: () => void;
  onPrev: () => void;
  onNext: () => void;
  onNavigate: (index: number) => void;
  onFinish: () => void;
  children: ReactNode;
}

export default function ExamShell({
  categoryName,
  currentIndex,
  totalCount,
  answers,
  remainingTime,
  isFlagged,
  isScenario = false,
  onFlag,
  onPrev,
  onNext,
  onNavigate,
  onFinish,
  children,
}: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">
              {categoryName}
            </span>
            <span className="text-sm text-gray-500">
              問{currentIndex + 1}/{totalCount}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* フラグボタン */}
            <button
              onClick={onFlag}
              className={`text-sm px-2 py-1 rounded transition-colors ${
                isFlagged
                  ? "bg-amber-100 text-amber-700"
                  : "text-gray-400 hover:text-amber-600"
              }`}
              title="フラグを切り替え"
            >
              ⚑
            </button>

            {/* タイマー */}
            {remainingTime !== null && (
              <span className="text-sm font-mono text-gray-600">
                {formatTime(remainingTime)}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* 本体 */}
      <main className="flex-1 overflow-auto">
        <div
          className={`mx-auto px-4 py-6 ${
            isScenario ? "max-w-7xl" : "max-w-4xl"
          }`}
        >
          {children}
        </div>
      </main>

      {/* フッター: 前へ/次へ + ナビゲーション */}
      <footer className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* 前へ/次へボタン */}
          <div className="flex items-center justify-between">
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-colors"
            >
              前へ
            </button>

            <div className="flex items-center gap-2">
              {currentIndex < totalCount - 1 ? (
                <button
                  onClick={onNext}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  次へ
                </button>
              ) : (
                <button
                  onClick={onFinish}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  終了
                </button>
              )}
            </div>
          </div>

          {/* 問題ナビゲーション */}
          <QuestionNav
            answers={answers}
            currentIndex={currentIndex}
            onNavigate={onNavigate}
          />
        </div>
      </footer>
    </div>
  );
}

/** 秒数を MM:SS 形式に変換 */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
