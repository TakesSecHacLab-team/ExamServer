/**
 * 問題ナビゲーション
 * 画面下部に問題番号を並べ、回答済み・フラグ付きを色分け表示する。
 */

"use client";

import type { AnswerState } from "@/types/exam";

interface Props {
  answers: AnswerState[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export default function QuestionNav({
  answers,
  currentIndex,
  onNavigate,
}: Props) {
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {answers.map((ans, index) => {
        const isCurrent = index === currentIndex;
        const isAnswered = ans.selectedAnswer !== null;
        const isFlagged = ans.flagged;

        return (
          <button
            key={ans.questionId}
            onClick={() => onNavigate(index)}
            className={`
              w-8 h-8 text-xs font-medium rounded transition-all
              ${isCurrent ? "ring-2 ring-blue-500 ring-offset-1" : ""}
              ${isAnswered ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}
              ${isFlagged ? "ring-2 ring-amber-400" : ""}
              hover:opacity-80
            `}
            title={`問${index + 1}${isFlagged ? " (フラグ)" : ""}${isAnswered ? " (回答済)" : ""}`}
          >
            {isFlagged ? "⚑" : index + 1}
          </button>
        );
      })}
    </div>
  );
}
