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
  const selectedCount = useAllQuestions ? totalQuestions : questionCount;
  const canStart = selectedCount >= 1 && selectedCount <= totalQuestions;

  const handleStart = () => {
    if (!canStart) return;

    sessionStorage.removeItem("exam-session-state");
    // クエリパラメータで設定を渡す
    const params = new URLSearchParams({
      mode,
      count: useAllQuestions ? String(totalQuestions) : String(questionCount),
      timer: timerEnabled ? "1" : "0",
    });
    router.push(`/exam/${categoryId}/session?${params.toString()}`);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
      <div className="space-y-7">
        <fieldset>
          <legend className="text-base font-bold text-gray-950">
            1. 受験モード
          </legend>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            採点タイミングを選びます。迷ったら本番モードで十分です。
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
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

        <fieldset className="border-t border-gray-200 pt-6">
          <legend className="text-base font-bold text-gray-950">
            2. 出題数
        </legend>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            このカテゴリには全{totalQuestions}問あります。
          </p>
          <div className="mt-3 space-y-3">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50">
            <input
              type="radio"
              name="questionCount"
              checked={useAllQuestions}
              onChange={() => setUseAllQuestions(true)}
              className="accent-blue-600"
            />
            <span className="text-sm font-medium text-gray-800">全問</span>
          </label>
          <label className="flex min-h-11 cursor-pointer flex-wrap items-center gap-3 rounded-md border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50">
            <input
              type="radio"
              name="questionCount"
              checked={!useAllQuestions}
              onChange={() => setUseAllQuestions(false)}
              className="accent-blue-600"
            />
            <span className="text-sm font-medium text-gray-800">
              ランダムで
            </span>
            <input
              type="number"
              min={1}
              max={totalQuestions}
              value={questionCount}
              onChange={(e) =>
                setQuestionCount(
                  Math.max(1, Math.min(totalQuestions, Number(e.target.value)))
                )
              }
              disabled={useAllQuestions}
              className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-100 disabled:opacity-60"
            />
            <span className="text-sm text-gray-700">問</span>
          </label>
        </div>
      </fieldset>

        <fieldset className="border-t border-gray-200 pt-6">
          <legend className="text-base font-bold text-gray-950">
            3. タイマー
        </legend>
          <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50">
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

        <div className="border-t border-gray-200 pt-6">
          <p className="mb-3 text-sm leading-6 text-gray-600">
            {mode === "exam"
              ? "全問解答後にまとめて採点します。"
              : "1問ごとに答え合わせします。"}
            出題数は{selectedCount}問です。
          </p>
          <button
            onClick={handleStart}
            disabled={!canStart}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
          >
            {categoryName} を開始
          </button>
        </div>
      </div>
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
      aria-pressed={selected}
      className={`min-h-28 rounded-md border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      <span className="block font-semibold text-sm text-gray-900">
        {title}
      </span>
      <span className="block text-xs text-gray-500 mt-1">{description}</span>
    </button>
  );
}
