/**
 * 結果画面
 * 試験終了後のスコア表示、各問の正誤・解説を一覧表示する。
 * localStorage にも結果を保存する。
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import type {
  BatchAnswerResponse,
  PublicQuestion,
  ExamMode,
} from "@/types/exam";
import { saveExamResult } from "@/lib/storage";
import MarkdownContent from "@/components/exam/MarkdownContent";

interface Props {
  categoryId: string;
  categoryName: string;
  mode: ExamMode;
  result: BatchAnswerResponse;
  questions: PublicQuestion[];
}

export default function ResultView({
  categoryId,
  categoryName,
  mode,
  result,
  questions,
}: Props) {
  // 結果を localStorage に保存
  useEffect(() => {
    saveExamResult({
      categoryId,
      mode,
      results: result.results,
      totalScore: result.totalScore,
      correctCount: result.correctCount,
      totalCount: result.totalCount,
      timestamp: new Date().toISOString(),
    });
  }, [categoryId, mode, result]);

  const questionMap = new Map(questions.map((q) => [q.id, q]));

  return (
    <main className="exam-production-surface min-h-screen bg-gray-50">
      {/* スコアヘッダー */}
      <header className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-gray-500 mb-2">{categoryName} 結果</p>

          <div className="text-5xl font-bold mb-2">
            <span
              className={
                result.totalScore >= 65 ? "text-green-600" : "text-red-600"
              }
            >
              {result.totalScore}
            </span>
            <span className="text-2xl text-gray-400">%</span>
          </div>

          <p className="text-sm text-gray-500">
            {result.correctCount} / {result.totalCount} 問正解
          </p>
        </div>
      </header>

      {/* 各問の結果一覧 */}
      <section className="max-w-3xl mx-auto px-6 py-8 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">問題別の結果</h2>

        {result.results.map((r, index) => {
          const question = questionMap.get(r.questionId);
          if (!question) return null;

          const isCorrect = r.score === 1;
          const isPartial = r.score > 0 && r.score < 1;

          return (
            <details
              key={r.questionId}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-center gap-3">
                {/* 正誤アイコン */}
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    isCorrect
                      ? "bg-green-500"
                      : isPartial
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                >
                  {isCorrect ? "○" : isPartial ? "△" : "×"}
                </span>

                <span className="text-sm text-gray-500">問{index + 1}</span>

                <span className="text-sm text-gray-800 flex-1 truncate">
                  {question.text.replace(/[#*`_]/g, "").slice(0, 60)}
                </span>
              </summary>

              <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
                {/* 問題文 */}
                <MarkdownContent className="text-gray-700">
                  {question.text}
                </MarkdownContent>

                {/* 選択肢と正誤 */}
                <div className="space-y-1">
                  {question.options.map((opt, optIndex) => {
                    const correctSet = new Set(
                      Array.isArray(r.correctAnswer)
                        ? r.correctAnswer
                        : [r.correctAnswer]
                    );
                    const userSet = new Set(
                      r.userAnswer === null
                        ? []
                        : Array.isArray(r.userAnswer)
                          ? r.userAnswer
                          : [r.userAnswer]
                    );

                    const isCorrectOpt = correctSet.has(optIndex);
                    const isSelectedOpt = userSet.has(optIndex);

                    let optStyle = "text-gray-600";
                    let prefix = "  ";
                    if (isCorrectOpt && isSelectedOpt) {
                      optStyle = "text-green-700 font-medium";
                      prefix = "○";
                    } else if (!isCorrectOpt && isSelectedOpt) {
                      optStyle = "text-red-600";
                      prefix = "×";
                    } else if (isCorrectOpt && !isSelectedOpt) {
                      optStyle = "text-amber-600";
                      prefix = "→";
                    }

                    return (
                      <p key={optIndex} className={`text-sm ${optStyle}`}>
                        {prefix} {opt}
                      </p>
                    );
                  })}
                </div>

                {/* 解説 */}
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    解説
                  </p>
                  <MarkdownContent className="text-gray-700">
                    {r.explanation}
                  </MarkdownContent>
                </div>
              </div>
            </details>
          );
        })}
      </section>

      {/* フッター */}
      <footer className="max-w-3xl mx-auto px-6 pb-12 flex gap-4">
        <Link
          href={`/exam/${categoryId}`}
          className="px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          もう一度挑戦
        </Link>
        <Link
          href="/"
          className="px-6 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
        >
          トップに戻る
        </Link>
      </footer>
    </main>
  );
}
