/**
 * 試験設定画面
 * モード選択（本番/一問一答）、問題数、タイマーON/OFFを設定して試験を開始する。
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryById, getAllQuestions } from "@/lib/questions";
import ExamSetupForm from "@/components/exam/ExamSetupForm";
import PublicAppShell from "@/components/layout/PublicAppShell";

interface Props {
  params: Promise<{ categoryId: string }>;
}

export default async function ExamSetupPage({ params }: Props) {
  const { categoryId } = await params;
  const category = getCategoryById(categoryId);
  if (!category) notFound();

  const totalQuestions = getAllQuestions(categoryId).length;

  return (
    <PublicAppShell
      activeSection="exam"
      eyebrow="演習設定"
      title={category.name}
      description={category.description}
      sidebar={
        <div className="space-y-4">
          <Link
            href="/"
            className="block rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            カテゴリ選択に戻る
          </Link>
          <div>
            <p className="text-sm font-semibold text-gray-950">設定の順番</p>
            <ol className="mt-2 space-y-2 text-sm leading-6 text-gray-600">
              <li>1. 受験モード</li>
              <li>2. 出題数</li>
              <li>3. タイマー</li>
              <li>4. 開始</li>
            </ol>
          </div>
        </div>
      }
    >
      <section className="max-w-3xl">
        {totalQuestions === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white px-5 py-12 text-center text-gray-500">
            <p className="text-lg font-semibold text-gray-800">
              まだ問題が登録されていません
            </p>
            <p className="mt-2 text-sm">
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
    </PublicAppShell>
  );
}
