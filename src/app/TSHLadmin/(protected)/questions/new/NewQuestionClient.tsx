/**
 * 問題新規登録のクライアント部分
 */

"use client";

import { useRouter } from "next/navigation";
import type { Category, Question } from "@/types/exam";
import QuestionForm from "@/components/admin/QuestionForm";

interface Props {
  categories: Category[];
}

export default function NewQuestionClient({ categories }: Props) {
  const router = useRouter();

  const handleSubmit = async (data: {
    categoryId: string;
    question: Question;
    scenarioMeta?: { id: string; title: string; scenario: string };
  }) => {
    // シナリオ問題の場合はシナリオごと送信
    const body = data.scenarioMeta
      ? {
          categoryId: data.categoryId,
          scenario: {
            id: data.scenarioMeta.id,
            title: data.scenarioMeta.title,
            scenario: data.scenarioMeta.scenario,
            questions: [data.question],
          },
        }
      : {
          categoryId: data.categoryId,
          question: data.question,
        };

    const res = await fetch("/api/TSHLadmin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "保存に失敗しました");
    }

    router.push("/TSHLadmin/questions");
  };

  return (
    <QuestionForm
      categories={categories}
      onSubmit={handleSubmit}
      submitLabel="登録"
    />
  );
}
