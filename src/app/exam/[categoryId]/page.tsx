/**
 * 試験設定画面
 * モード選択（本番/一問一答）、問題数、タイマーON/OFFを設定して試験を開始する。
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryById, getAllQuestions } from "@/lib/questions";
import ExamSetupForm from "@/components/exam/ExamSetupForm";

interface Props {
  params: Promise<{ categoryId: string }>;
}

export default async function ExamSetupPage({ params }: Props) {
  const { categoryId } = await params;
  const category = getCategoryById(categoryId);
  if (!category) notFound();

  const totalQuestions = getAllQuestions(categoryId).length;

  return (
    <main className="flex-1">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-block text-sm text-blue-600 hover:text-blue-800 mb-1"
          >
            ← カテゴリ選択に戻る
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{category.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{category.description}</p>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 py-8">
        {totalQuestions === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">まだ問題が登録されていません。</p>
            <p className="text-sm mt-2">
              管理画面から問題をアップロードしてください。
            </p>
          </div>
        ) : (
          <ExamSetupForm
            categoryId={category.id}
            categoryName={category.name}
            totalQuestions={totalQuestions}
            timeLimit={category.timeLimit}
          />
        )}
      </section>
    </main>
  );
}
