import Link from "next/link";
import { notFound } from "next/navigation";
import PublicAppShell from "@/components/layout/PublicAppShell";
import LearningNav from "@/components/learning/LearningNav";
import {
  findLearningNodeBySlug,
  getLearningMap,
  getLearningPath,
  getNextLessonNode,
} from "@/lib/learning";
import {
  getLearningLessonHeadings,
  getLearningSlugs,
  loadLearningLesson,
  type LearningHeading,
} from "@/lib/learning-content";

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
  const headings = getLearningLessonHeadings(slug);

  return (
    <PublicAppShell
      activeSection="learn"
      eyebrow="講義"
      title={node.title}
      description={node.summary}
      sidebar={<LearningNav map={learningMap} activeNodeId={node.id} />}
    >
      <div className="grid max-w-[64rem] gap-10 xl:grid-cols-[minmax(0,70ch)_13rem]">
        <div className="min-w-0">
          <nav
            aria-label="現在地"
            className="mb-6 text-sm text-[var(--text-muted)]"
          >
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link
                  href="/learn"
                  className="font-medium text-[var(--link)] hover:text-[var(--primary-hover)]"
                >
                  知識マップ
                </Link>
              </li>
              {currentPath.map((pathNode) => (
                <li key={pathNode.id} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="text-[var(--border-strong)]"
                  >
                    /
                  </span>
                  <span
                    className={
                      pathNode.id === node.id
                        ? "text-[var(--foreground)]"
                        : undefined
                    }
                  >
                    {pathNode.title}
                  </span>
                </li>
              ))}
            </ol>
          </nav>

          <details className="group mb-7 rounded-md border border-[var(--border)] bg-[var(--surface)] xl:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 text-sm font-semibold text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus)]">
              <span>このページ</span>
              <span
                aria-hidden="true"
                className="text-[var(--text-muted)] transition-transform group-open:rotate-180"
              >
                ↓
              </span>
            </summary>
            <div className="border-t border-[var(--border)] px-3 py-3">
              <ArticleOutline headings={headings} />
            </div>
          </details>

          <article className="learning-article">
            <Lesson />
          </article>

          <div className="mt-10 grid gap-3 border-t border-[var(--border)] pt-5 sm:grid-cols-2">
            {nextNode?.lessonSlug && (
              <Link
                href={`/learn/${nextNode.lessonSlug}`}
                prefetch={false}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
              >
                <p className="text-sm font-semibold text-[var(--link)]">
                  次に読む
                </p>
                <p className="mt-1 text-base font-semibold text-[var(--foreground)]">
                  {nextNode.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  {nextNode.summary}
                </p>
              </Link>
            )}

            {node.exerciseCategoryId && (
              <Link
                href={`/exam/${node.exerciseCategoryId}`}
                prefetch={false}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
              >
                <p className="text-sm font-semibold text-[var(--text-muted)]">
                  確認演習
                </p>
                <p className="mt-1 text-base font-semibold text-[var(--foreground)]">
                  関連する演習へ進む
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  読んだ内容を問題で確認します。
                </p>
              </Link>
            )}
          </div>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-24 border-l border-[var(--border)] pl-4">
            <p className="text-xs font-semibold text-[var(--foreground)]">
              このページ
            </p>
            <div className="mt-3">
              <ArticleOutline headings={headings} />
            </div>
          </div>
        </aside>
      </div>
    </PublicAppShell>
  );
}

function ArticleOutline({ headings }: { headings: LearningHeading[] }) {
  if (headings.length === 0) {
    return (
      <p className="text-xs leading-5 text-[var(--text-muted)]">
        見出しはありません。
      </p>
    );
  }

  return (
    <nav aria-label="このページ">
      <ol className="space-y-2">
        {headings.map((heading) => (
          <li key={`${heading.id}-${heading.level}`}>
            <a
              href={`#${heading.id}`}
              className={`block rounded-sm text-xs leading-5 text-[var(--text-muted)] transition-colors hover:text-[var(--link)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${
                heading.level === 3 ? "pl-3" : ""
              }`}
            >
              {heading.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
