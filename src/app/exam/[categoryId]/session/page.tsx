/**
 * 受験セッション画面
 * 問題の表示・回答・ナビゲーション・採点を行うメインページ。
 * クエリパラメータで受験設定を受け取る。
 */

"use client";

import { useSearchParams, useParams } from "next/navigation";
import { Suspense } from "react";
import ExamSession from "@/components/exam/ExamSession";

/** useSearchParams を使うため Suspense でラップ */
export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      }
    >
      <SessionContent />
    </Suspense>
  );
}

function SessionContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const categoryId = params.categoryId as string;
  const mode = (searchParams.get("mode") ?? "exam") as "exam" | "drill";
  const count = Number(searchParams.get("count") ?? "10");
  const timer = searchParams.get("timer") === "1";

  return (
    <ExamSession
      categoryId={categoryId}
      mode={mode}
      questionCount={count}
      timerEnabled={timer}
    />
  );
}
