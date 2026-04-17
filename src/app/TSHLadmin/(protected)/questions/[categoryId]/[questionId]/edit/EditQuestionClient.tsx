/**
 * 問題編集のクライアント部分
 */

"use client";

import { useRouter } from "next/navigation";
import type { Category, Question } from "@/types/exam";
import QuestionForm from "@/components/admin/QuestionForm";

interface Props {
  categories: Category[];
  initialQuestion: Question;
  initialCategoryId: string;
}

export default function EditQuestionClient({
  categories,
  initialQuestion,
  initialCategoryId,
}: Props) {
  const router = useRouter();

  const handleSubmit = async (data: {
    categoryId: string;
    question: Question;
  }) => {
    const res = await fetch("/api/TSHLadmin/questions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: data.categoryId,
        question: data.question,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "更新に失敗しました");
    }

    router.push("/TSHLadmin/questions");
  };

  return (
    <QuestionForm
      categories={categories}
      initialQuestion={initialQuestion}
      initialCategoryId={initialCategoryId}
      onSubmit={handleSubmit}
      submitLabel="更新"
    />
  );
}
