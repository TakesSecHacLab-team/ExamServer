/**
 * 問題新規登録ページ
 */

import { getCategories } from "@/lib/questions";
import NewQuestionClient from "./NewQuestionClient";

export default function NewQuestionPage() {
  const categories = getCategories();
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">問題登録</h1>
      <NewQuestionClient categories={categories} />
    </div>
  );
}
