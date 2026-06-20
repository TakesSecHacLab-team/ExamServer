import Link from "next/link";
import type { LearningMap, LearningNode } from "@/types/learning";

interface LearningNavProps {
  map: LearningMap;
  activeNodeId?: string;
}

export default function LearningNav({ map, activeNodeId }: LearningNavProps) {
  const byId = new Map(map.nodes.map((node) => [node.id, node]));
  const root = byId.get(map.startNodeId);
  const activePath = activeNodeId ? findPath(map.startNodeId, activeNodeId, byId) : [];
  const activeChapterId = activePath.find(
    (node) => node.kind === "chapter" && node.id !== root?.id
  )?.id;
  const chapters =
    root?.children
      ?.map((childId) => byId.get(childId))
      .filter((node): node is LearningNode => node?.kind === "chapter") ?? [];

  if (!root) return null;

  return (
    <nav aria-label="講義内ナビゲーション" className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-[var(--foreground)]">
          講義
        </p>
        <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
          必要な章だけ開いて読みます。
        </p>
      </div>

      <Link
        href="/learn"
        aria-current={activeNodeId ? undefined : "page"}
        className={`block rounded-md px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${
          activeNodeId
            ? "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            : "bg-[var(--primary-soft)] text-[var(--link)]"
        }`}
      >
        講義トップ
      </Link>

      <div className="space-y-1">
        {chapters.map((chapter) => (
          <ChapterGroup
            key={chapter.id}
            chapter={chapter}
            byId={byId}
            activeNodeId={activeNodeId}
            open={chapter.id === activeChapterId}
          />
        ))}
      </div>
    </nav>
  );
}

function ChapterGroup({
  chapter,
  byId,
  activeNodeId,
  open,
}: {
  chapter: LearningNode;
  byId: Map<string, LearningNode>;
  activeNodeId?: string;
  open: boolean;
}) {
  const lessons =
    chapter.children
      ?.map((childId) => byId.get(childId))
      .filter((node): node is LearningNode => Boolean(node)) ?? [];

  return (
    <details className="group rounded-md" open={open}>
      <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]">
        <span className="min-w-0 truncate">{chapter.title}</span>
        <span
          aria-hidden="true"
          className="shrink-0 text-[var(--text-muted)] transition-transform group-open:rotate-180"
        >
          ↓
        </span>
      </summary>
      <div className="mt-1 space-y-1 border-l border-[var(--border)] pl-2">
        {lessons.map((lesson) => (
          <LearningNavItem
            key={lesson.id}
            node={lesson}
            active={lesson.id === activeNodeId}
          />
        ))}
      </div>
    </details>
  );
}

function LearningNavItem({
  node,
  active,
}: {
  node: LearningNode;
  active: boolean;
}) {
  if (!node.lessonSlug || node.status === "planned") {
    return (
      <div className="rounded-md px-3 py-2 text-sm text-[var(--text-muted)]">
        <span className="block truncate">{node.title}</span>
        <span className="mt-0.5 block text-xs text-[var(--warning)]">
          準備中
        </span>
      </div>
    );
  }

  return (
    <Link
      href={`/learn/${node.lessonSlug}`}
      prefetch={false}
      aria-current={active ? "page" : undefined}
      className={`block rounded-md px-3 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${
        active
          ? "bg-[var(--primary-soft)] font-semibold text-[var(--link)]"
          : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
      }`}
    >
      <span className="block truncate">{node.title}</span>
    </Link>
  );
}

function findPath(
  currentId: string,
  targetId: string,
  byId: Map<string, LearningNode>,
  path: LearningNode[] = []
): LearningNode[] {
  const current = byId.get(currentId);
  if (!current) return [];

  const nextPath = [...path, current];
  if (current.id === targetId) return nextPath;

  for (const childId of current.children ?? []) {
    const found = findPath(childId, targetId, byId, nextPath);
    if (found.length > 0) return found;
  }

  return [];
}
