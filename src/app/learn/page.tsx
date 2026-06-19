import Link from "next/link";
import {
  flattenLearningNodes,
  getLearningMap,
  getLearningPath,
} from "@/lib/learning";
import type { LearningMap, LearningNode } from "@/types/learning";

export default function LearnPage() {
  const learningMap = getLearningMap();
  const firstLesson = flattenLearningNodes(learningMap).find(
    (node) => node.lessonSlug
  );
  const currentPath = firstLesson
    ? getLearningPath(learningMap, firstLesson.id)
    : [];

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-5">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/"
            className="text-sm text-blue-700 hover:text-blue-900"
          >
            ExamServerに戻る
          </Link>
          <div className="mt-4 max-w-3xl">
            <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
              コンピュータとセキュリティの基礎
            </h1>
            <p className="mt-3 text-base leading-7 text-gray-600">
              いきなり攻撃手法へ行く前に、通信、OS、Web、暗号、メモリをざっと地図にします。
              まずは全体を見て、今日読むところだけ決めれば十分です。
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 py-8 lg:grid-cols-[18rem_1fr]">
        <aside className="order-2 space-y-4 lg:order-1">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              今日の入口
            </p>
            {firstLesson ? (
              <>
                <Link
                  href={`/learn/${firstLesson.lessonSlug}`}
                  prefetch={false}
                  className="mt-2 block text-base font-semibold text-gray-950 hover:text-blue-700"
                >
                  {firstLesson.title}
                </Link>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {firstLesson.summary}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-gray-600">
                最初の講義はまだ登録されていません。
              </p>
            )}
          </div>

          {currentPath.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                現在地
              </p>
              <ol className="mt-2 space-y-2 text-sm text-gray-700">
                {currentPath.map((node) => (
                  <li key={node.id}>{node.title}</li>
                ))}
              </ol>
            </div>
          )}

        </aside>

        <div className="order-1 rounded-lg border border-gray-200 bg-white p-5 lg:order-2">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-950">全体ツリー</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              最初から全部読む必要はありません。今は、どんな棚があるかだけ見れば大丈夫です。
            </p>
          </div>
          <LearningTree map={learningMap} />
        </div>
      </section>
    </main>
  );
}

function LearningTree({ map }: { map: LearningMap }) {
  const byId = new Map(map.nodes.map((node) => [node.id, node]));
  const root = byId.get(map.startNodeId);
  if (!root) return null;

  return <LearningTreeNode node={root} byId={byId} depth={0} />;
}

function LearningTreeNode({
  node,
  byId,
  depth,
}: {
  node: LearningNode;
  byId: Map<string, LearningNode>;
  depth: number;
}) {
  const hasChildren = (node.children ?? []).length > 0;
  const content = (
    <div
      className={`rounded-lg border px-4 py-3 ${
        node.lessonSlug
          ? "border-blue-200 bg-blue-50"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
            {node.lessonSlug ? (
          <Link
            href={`/learn/${node.lessonSlug}`}
            prefetch={false}
            className="font-semibold text-gray-950 hover:text-blue-700"
          >
            {node.title}
          </Link>
        ) : node.externalUrl ? (
          <a
            href={node.externalUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-gray-950 hover:text-blue-700"
          >
            {node.title}
          </a>
        ) : (
          <p className="font-semibold text-gray-950">{node.title}</p>
        )}
        {(node.status === "planned" ||
          (!node.lessonSlug &&
            !node.externalUrl &&
            (node.kind !== "chapter" || !hasChildren))) && (
          <span className="text-xs text-gray-500">準備中</span>
        )}
      </div>
      <p className="mt-1 text-sm leading-6 text-gray-600">{node.summary}</p>
    </div>
  );

  return (
    <div className={depth === 0 ? "space-y-3" : "mt-3 space-y-3"}>
      {content}
      {hasChildren && (
        <div className="ml-4 space-y-3 border-l border-gray-200 pl-4">
          {node.children!.map((childId) => {
            const child = byId.get(childId);
            return child ? (
              <LearningTreeNode
                key={child.id}
                node={child}
                byId={byId}
                depth={depth + 1}
              />
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
