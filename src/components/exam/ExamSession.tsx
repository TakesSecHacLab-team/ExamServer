/**
 * 受験セッション
 * useExamSession フックで状態管理し、モードに応じた表示を切り替える。
 */

"use client";

import { useEffect, useState } from "react";
import type { ExamMode, Category } from "@/types/exam";
import { useExamSession } from "@/hooks/useExamSession";
import ExamShell from "@/components/exam/ExamShell";
import OneshotLayout from "@/components/exam/layouts/OneshotLayout";
import ScenarioLayout from "@/components/exam/layouts/ScenarioLayout";
import DrillFeedback from "@/components/exam/DrillFeedback";
import ResultView from "@/components/exam/ResultView";

interface Props {
  categoryId: string;
  mode: ExamMode;
  questionCount: number;
  timerEnabled: boolean;
}

export default function ExamSession({
  categoryId,
  mode,
  questionCount,
  timerEnabled,
}: Props) {
  const [category, setCategory] = useState<Category | null>(null);

  // カテゴリ情報を取得（サーバーから）
  useEffect(() => {
    fetch(`/api/categories?id=${categoryId}`)
      .then((res) => res.json())
      .then((data) => setCategory(data))
      .catch(() => {});
  }, [categoryId]);

  const session = useExamSession({
    categoryId,
    mode,
    questionCount,
    timerEnabled,
    timeLimit: category?.timeLimit ?? 5400,
  });

  // ローディング中
  if (session.loading || !category) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">問題を読み込み中...</p>
      </div>
    );
  }

  // 問題がない
  if (session.questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">この試験には問題がありません。</p>
      </div>
    );
  }

  // 試験終了 → 結果表示
  if (session.finished && session.batchResult) {
    return (
      <ResultView
        categoryId={categoryId}
        categoryName={category.name}
        mode={mode}
        result={session.batchResult}
        questions={session.questions}
      />
    );
  }

  // 一問一答モードで全問完了
  if (session.finished && mode === "drill") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg font-semibold text-gray-800">
          全問完了しました！
        </p>
        <a
          href={`/exam/${categoryId}`}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          設定画面に戻る
        </a>
      </div>
    );
  }

  const currentQuestion = session.questions[session.currentIndex];
  const currentAnswer = session.answers[session.currentIndex];
  const isScenario = currentQuestion.style === "scenario";
  const parentScenario = isScenario
    ? session.scenarioMap[currentQuestion.id]
    : null;

  const resultProps = session.drillResult
    ? {
        correctAnswer: session.drillResult.answer,
        userAnswer: currentAnswer.selectedAnswer,
      }
    : undefined;
  const handlePrimaryNext =
    mode === "drill" && session.drillResult
      ? session.nextDrill
      : mode === "drill"
        ? session.submitDrill
        : session.goNext;
  const handlePrimaryFinish =
    mode === "drill" && session.drillResult
      ? session.nextDrill
      : mode === "drill"
        ? session.submitDrill
        : session.finishExam;

  return (
    <ExamShell
      categoryName={category.name}
      currentIndex={session.currentIndex}
      totalCount={session.questions.length}
      answers={session.answers}
      remainingTime={session.remainingTime}
      isFlagged={currentAnswer.flagged}
      isScenario={isScenario}
      onFlag={session.toggleFlag}
      onPrev={session.goPrev}
      onNext={handlePrimaryNext}
      onNavigate={session.goTo}
      onFinish={handlePrimaryFinish}
    >
      {/* style に応じてレイアウトを切り替え */}
      {isScenario && parentScenario ? (
        <ScenarioLayout
          scenario={parentScenario}
          question={currentQuestion}
          selectedAnswer={currentAnswer.selectedAnswer}
          onAnswer={session.setAnswer}
          showResult={resultProps}
          disabled={session.drillResult !== null}
        />
      ) : (
        <OneshotLayout
          question={currentQuestion}
          selectedAnswer={currentAnswer.selectedAnswer}
          onAnswer={session.setAnswer}
          showResult={resultProps}
          disabled={session.drillResult !== null}
        />
      )}

      {/* 一問一答モードのフィードバック表示 */}
      {mode === "drill" && session.drillResult && (
        <DrillFeedback
          result={session.drillResult}
          onNext={session.nextDrill}
        />
      )}
    </ExamShell>
  );
}
