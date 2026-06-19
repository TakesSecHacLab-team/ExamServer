import Link from "next/link";
import { getAllQuestions, getCategories } from "@/lib/questions";
import CategorySelector from "@/components/CategorySelector";

/**
 * トップページ
 * 目的別にカテゴリを選択し、試験の概要と出題範囲を表示する。
 */
export default function HomePage() {
  const categories = getCategories().map((category) => ({
    id: category.id,
    name: category.name,
    defaultStyle: category.defaultStyle,
    timeLimit: category.timeLimit,
    questionCount: getAllQuestions(category.id).length,
  }));

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">ExamServer</h1>
          <p className="text-sm text-gray-500 mt-1">
            資格試験と実践基礎の演習
          </p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-8 flex-1">
        <CategorySelector categories={categories} />
      </section>

      <footer className="border-t border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto text-right">
          <Link
            href="/TSHLadmin"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            管理者ログイン
          </Link>
        </div>
      </footer>
    </main>
  );
}
