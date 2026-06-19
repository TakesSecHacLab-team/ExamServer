import Link from "next/link";
import { notFound } from "next/navigation";
import {
  findLearningNodeBySlug,
  getLearningMap,
  getLearningPath,
  getNextLessonNode,
} from "@/lib/learning";
import { getLearningSlugs, loadLearningLesson } from "@/lib/learning-content";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export function generateStaticParams() {
  return getLearningSlugs().map((slug) => ({ slug: slug.split("/") }));
}

export default async function LearningLessonPage({ params }: Props) {
  const { slug: slugParts } = await params;
  const slug = slugParts.join("/");
  const learningMap = getLearningMap();
  const node = findLearningNodeBySlug(learningMap, slug);
  const lessonModule = await loadLearningLesson(slug);

  if (!node || !lessonModule) notFound();

  const Lesson = lessonModule.default;
  const currentPath = getLearningPath(learningMap, node.id);
  const nextNode = getNextLessonNode(learningMap, node.id);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-5">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link href="/learn" className="text-blue-700 hover:text-blue-900">
              知識マップ
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600">{node.title}</span>
          </div>
          <div className="mt-4 max-w-3xl">
            <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
              {node.title}
            </h1>
            <p className="mt-3 text-base leading-7 text-gray-600">
              {node.summary}
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 py-8 lg:grid-cols-[18rem_1fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              現在地
            </p>
            <ol className="mt-2 space-y-2 text-sm text-gray-700">
              {currentPath.map((pathNode) => (
                <li key={pathNode.id}>{pathNode.title}</li>
              ))}
            </ol>
          </div>

          {nextNode && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                次
              </p>
              {nextNode.lessonSlug ? (
                <Link
                  href={`/learn/${nextNode.lessonSlug}`}
                  prefetch={false}
                  className="mt-2 block text-sm font-semibold text-blue-700 hover:text-blue-900"
                >
                  {nextNode.title}
                </Link>
              ) : (
                <p className="mt-2 text-sm font-semibold text-gray-800">
                  {nextNode.title}
                </p>
              )}
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {nextNode.summary}
              </p>
            </div>
          )}

          {node.exerciseCategoryId && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                確認演習
              </p>
              <Link
                href={`/exam/${node.exerciseCategoryId}`}
                prefetch={false}
                className="mt-2 block text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                関連する演習へ進む
              </Link>
            </div>
          )}
        </aside>

        <article className="rounded-lg border border-gray-200 bg-white px-5 py-6 md:px-8">
          <div className="learning-article">
            <Lesson />
          </div>
        </article>
      </section>
    </main>
  );
}
