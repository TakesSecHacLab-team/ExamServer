/**
 * 試験設定フォーム
 * モード・問題数・タイマーを設定して受験を開始する。
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ExamMode } from "@/types/exam";

interface Props {
  categoryId: string;
  categoryName: string;
  totalQuestions: number;
  timeLimit: number;
}

export default function ExamSetupForm({
  categoryId,
  categoryName,
  totalQuestions,
  timeLimit,
}: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<ExamMode>("exam");
  const [useAllQuestions, setUseAllQuestions] = useState(true);
  const [questionCount, setQuestionCount] = useState(
    Math.min(10, totalQuestions)
  );
  const [timerEnabled, setTimerEnabled] = useState(true);

  const handleStart = () => {
    // クエリパラメータで設定を渡す
    const params = new URLSearchParams({
      mode,
      count: useAllQuestions ? String(totalQuestions) : String(questionCount),
      timer: timerEnabled ? "1" : "0",
    });
    router.push(`/exam/${categoryId}/session?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* モード選択 */}
      <fieldset>
        <legend className="text-sm font-semibold text-gray-700 mb-3">
          受験モード
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ModeOption
            selected={mode === "exam"}
            onClick={() => setMode("exam")}
            title="本番モード"
            description="全問解答後にまとめて採点。本番試験のシミュレーション向け。"
          />
          <ModeOption
            selected={mode === "drill"}
            onClick={() => setMode("drill")}
            title="一問一答モード"
            description="1問ずつ即座に答え合わせ。暗記・復習向け。"
          />
        </div>
      </fieldset>

      {/* 問題数 */}
      <fieldset>
        <legend className="text-sm font-semibold text-gray-700 mb-3">
          出題数（全{totalQuestions}問）
        </legend>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="questionCount"
              checked={useAllQuestions}
              onChange={() => setUseAllQuestions(true)}
              className="accent-blue-600"
            />
            <span className="text-sm text-gray-700">全問</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="questionCount"
              checked={!useAllQuestions}
              onChange={() => setUseAllQuestions(false)}
              className="accent-blue-600"
            />
            <span className="text-sm text-gray-700">ランダムで</span>
            <input
              type="number"
              min={1}
              max={totalQuestions}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              disabled={useAllQuestions}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
            />
            <span className="text-sm text-gray-700">問</span>
          </label>
        </div>
      </fieldset>

      {/* タイマー */}
      <fieldset>
        <legend className="text-sm font-semibold text-gray-700 mb-3">
          タイマー
        </legend>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={timerEnabled}
            onChange={(e) => setTimerEnabled(e.target.checked)}
            className="accent-blue-600"
          />
          <span className="text-sm text-gray-700">
            制限時間あり（{Math.floor(timeLimit / 60)}分）
          </span>
        </label>
      </fieldset>

      {/* 開始ボタン */}
      <button
        onClick={handleStart}
        className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        {categoryName} を開始
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// サブコンポーネント
// ---------------------------------------------------------------------------

function ModeOption({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-lg border-2 transition-all ${
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <span className="block font-semibold text-sm text-gray-900">
        {title}
      </span>
      <span className="block text-xs text-gray-500 mt-1">{description}</span>
    </button>
  );
}
