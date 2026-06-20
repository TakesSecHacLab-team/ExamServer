import Link from "next/link";
import PublicAppShell from "@/components/layout/PublicAppShell";
import LearningNav from "@/components/learning/LearningNav";
import { flattenLearningNodes, getLearningMap } from "@/lib/learning";

export default function LearnPage() {
  const learningMap = getLearningMap();
  const firstLesson = flattenLearningNodes(learningMap).find(
    (node) => node.status !== "planned" && Boolean(node.lessonSlug)
  );

  return (
    <PublicAppShell
      activeSection="learn"
      eyebrow="次に読む講義"
      title={firstLesson?.title ?? "講義"}
      description={
        firstLesson?.summary ??
        "コンピュータとセキュリティの基礎を、講義から演習へ進む順番で読みます。"
      }
      sidebar={<LearningNav map={learningMap} />}
    >
      <div className="max-w-[42rem] space-y-7">
        {firstLesson?.lessonSlug && (
          <section
            aria-label="次の行動"
            className="border-y border-[var(--border)] py-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={`/learn/${firstLesson.lessonSlug}`}
                prefetch={false}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 sm:w-auto"
              >
                講義を読む
              </Link>
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                読み終えたら、本文末の確認演習へ進みます。
              </p>
            </div>
          </section>
        )}

        <section className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            基礎を短い単位で読む
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
            ネットワーク、Linux、Web、暗号、セキュリティの順に、概念を演習へつなげる粒度で整理しています。
          </p>
        </section>
      </div>
    </PublicAppShell>
  );
}
