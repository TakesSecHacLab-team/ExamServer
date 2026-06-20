import Link from "next/link";
import FlowBackLink from "@/components/FlowBackLink";
import type { CategoryGroup, QuestionStyle } from "@/types/exam";

export type CategoryBucket = "certification" | "other";

interface CategoryWithCount {
  id: string;
  name: string;
  description: string;
  group: CategoryGroup;
  defaultStyle: QuestionStyle;
  timeLimit: number;
  questionCount: number;
}

interface Props {
  categories: CategoryWithCount[];
  bucket: CategoryBucket | null;
}

const GROUP_ORDER: Record<CategoryGroup, number> = {
  certification: 0,
  lab: 1,
  demo: 2,
};

export default function CategorySelector({ categories, bucket }: Props) {
  if (!bucket) {
    return <BucketChoices categories={categories} />;
  }

  const visibleCategories = sortCategoriesForSelection(
    categories.filter((category) => categoryMatchesBucket(category, bucket))
  );

  return (
    <div>
      <FlowBackLink href="/" label="演習の種類に戻る" />

      <div className="space-y-3">
        {visibleCategories.map((category) => (
          <CategoryRow key={category.id} category={category} bucket={bucket} />
        ))}
      </div>
    </div>
  );
}

function BucketChoices({ categories }: { categories: CategoryWithCount[] }) {
  const certificationCount = categories.filter(
    (category) => category.group === "certification"
  ).length;
  const otherCount = categories.length - certificationCount;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <BucketChoice
        href="/?bucket=certification"
        title="資格試験"
        description={`${certificationCount}カテゴリ`}
      />
      <BucketChoice
        href="/?bucket=other"
        title="それ以外"
        description={`${otherCount}カテゴリ`}
      />
    </div>
  );
}

function BucketChoice({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-28 items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-4 transition-colors hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
    >
      <span>
        <span className="block text-lg font-bold text-gray-950">{title}</span>
        <span className="mt-1 block text-sm text-gray-500">{description}</span>
      </span>
      <span
        aria-hidden="true"
        className="text-lg font-semibold text-gray-400 transition-colors group-hover:text-blue-700"
      >
        →
      </span>
    </Link>
  );
}

function CategoryRow({
  category,
  bucket,
}: {
  category: CategoryWithCount;
  bucket: CategoryBucket;
}) {
  const ready = category.questionCount > 0;
  const setupHref = `/exam/${category.id}?bucket=${bucket}`;

  return (
    <article className="rounded-lg border border-gray-200 bg-white">
      <div className="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        {ready ? (
          <Link
            href={setupHref}
            className="min-w-0 rounded-md py-1 text-base font-bold text-gray-950 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {category.name}
          </Link>
        ) : (
          <span className="min-w-0 py-1 text-base font-bold text-gray-500">
            {category.name}
          </span>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span>{styleLabel(category.defaultStyle)}</span>
          <span aria-hidden="true">/</span>
          <span>{Math.floor(category.timeLimit / 60)}分</span>
          <span aria-hidden="true">/</span>
          <span className={ready ? "text-gray-600" : "text-amber-700"}>
            {ready ? `${category.questionCount}問` : "準備中"}
          </span>
        </div>
      </div>

      <details className="group border-t border-gray-100">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600">
          <span>概要</span>
          <span
            aria-hidden="true"
            className="text-gray-500 transition-transform group-open:rotate-180"
          >
            ↓
          </span>
        </summary>
        <div className="px-4 pb-4 text-sm leading-7 text-gray-600">
          <p>{category.description}</p>
          {!ready && (
            <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
              このカテゴリは問題が登録されるまで開始できません。
            </p>
          )}
        </div>
      </details>
    </article>
  );
}

function sortCategoriesForSelection(
  categories: CategoryWithCount[]
): CategoryWithCount[] {
  return categories
    .map((category, index) => ({ category, index }))
    .sort((a, b) => {
      const groupDiff =
        GROUP_ORDER[a.category.group] - GROUP_ORDER[b.category.group];
      if (groupDiff !== 0) return groupDiff;

      const readyDiff =
        Number(b.category.questionCount > 0) -
        Number(a.category.questionCount > 0);
      if (readyDiff !== 0) return readyDiff;

      return a.index - b.index;
    })
    .map(({ category }) => category);
}

function categoryMatchesBucket(
  category: CategoryWithCount,
  bucket: CategoryBucket
): boolean {
  if (bucket === "certification") return category.group === "certification";
  return category.group !== "certification";
}

function styleLabel(style: QuestionStyle): string {
  return style === "scenario" ? "長文" : "一問一答";
}
