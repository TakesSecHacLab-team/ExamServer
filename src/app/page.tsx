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
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            基礎から学ぶ
          </p>
          <h2 className="mt-2 text-lg font-bold text-gray-950">
            コンピュータとセキュリティの基礎
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-700">
            試験やCTFの前に、通信、OS、Web、暗号、メモリの全体像を見ます。
            まずは知識マップから始めます。
          </p>
          <Link
            href="/learn"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            知識マップを開く
          </Link>
        </div>
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
