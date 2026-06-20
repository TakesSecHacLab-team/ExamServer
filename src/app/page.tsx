import Link from "next/link";
import { getAllQuestions, getCategories } from "@/lib/questions";
import CategorySelector from "@/components/CategorySelector";
import PublicAppShell from "@/components/layout/PublicAppShell";

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
    <PublicAppShell
      activeSection="exam"
      eyebrow="演習"
      title="試験カテゴリを選ぶ"
      description="選択中のカテゴリから設定へ進みます。ほかを解く時だけカテゴリを切り替えます。"
      sidebar={
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-950">演習の流れ</p>
            <ol className="mt-2 space-y-2 text-sm leading-6 text-gray-600">
              <li>1. カテゴリを選ぶ</li>
              <li>2. モードと出題数を決める</li>
              <li>3. 解いて結果を見る</li>
            </ol>
          </div>
          <Link
            href="/learn"
            className="block rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 transition-colors hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            先に講義を読む
          </Link>
        </div>
      }
    >
      <div className="max-w-5xl">
        <CategorySelector categories={categories} />
      </div>
    </PublicAppShell>
  );
}
