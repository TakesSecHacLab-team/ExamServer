/**
 * 問題一覧ページ
 * カテゴリ絞り込み・検索付き。編集・削除リンク。
 */

import { getCategories, getQuestions, getScenarios } from "@/lib/questions";
import QuestionListClient from "./QuestionListClient";
import type { Question } from "@/types/exam";

interface QuestionWithCategory extends Question {
  categoryId: string;
  categoryName: string;
}

export default function QuestionsPage() {
  const categories = getCategories();

  // 全カテゴリの問題を結合
  const allQuestions: QuestionWithCategory[] = [];
  for (const cat of categories) {
    const questions = getQuestions(cat.id);
    for (const q of questions) {
      allQuestions.push({ ...q, categoryId: cat.id, categoryName: cat.name });
    }
    const scenarios = getScenarios(cat.id);
    for (const s of scenarios) {
      for (const q of s.questions) {
        allQuestions.push({ ...q, categoryId: cat.id, categoryName: cat.name });
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">問題一覧</h1>
        <a
          href="/TSHLadmin/questions/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 問題登録
        </a>
      </div>

      <QuestionListClient
        questions={allQuestions}
        categories={categories}
      />
    </div>
  );
}
