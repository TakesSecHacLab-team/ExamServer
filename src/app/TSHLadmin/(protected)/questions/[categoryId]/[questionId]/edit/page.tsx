/**
 * 問題編集ページ
 */

import { notFound } from "next/navigation";
import { getCategories, getQuestions } from "@/lib/questions";
import EditQuestionClient from "./EditQuestionClient";

interface Props {
  params: Promise<{ categoryId: string; questionId: string }>;
}

export default async function EditQuestionPage({ params }: Props) {
  const { categoryId, questionId } = await params;
  const categories = getCategories();
  const questions = getQuestions(categoryId);
  const question = questions.find((q) => q.id === questionId);

  if (!question) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">問題編集</h1>
      <EditQuestionClient
        categories={categories}
        initialQuestion={question}
        initialCategoryId={categoryId}
      />
    </div>
  );
}
