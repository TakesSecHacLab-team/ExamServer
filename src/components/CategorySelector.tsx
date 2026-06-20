"use client";

/**
 * カテゴリ選択コンポーネント
 * 目的別にカテゴリを選択し、概要・出題範囲・学習進捗を表示する。
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { CategoryProgress, QuestionStyle } from "@/types/exam";
import {
  CATEGORY_DETAILS,
  CATEGORY_GROUPS,
  type CategoryDetail as CategoryDetailData,
  type CategoryGroup,
} from "@/lib/category-details";
import { loadCategoryProgress } from "@/lib/storage";

interface CategoryWithCount {
  id: string;
  name: string;
  defaultStyle: QuestionStyle;
  timeLimit: number;
  questionCount: number;
}

interface Props {
  categories: CategoryWithCount[];
}

export default function CategorySelector({ categories }: Props) {
  const initialCategory =
    categories.find((category) => category.questionCount > 0) ?? categories[0];
  const [selectedId, setSelectedId] = useState(initialCategory?.id ?? "");
  const [progress, setProgress] = useState<CategoryProgress | null>(null);

  const selected = categories.find((c) => c.id === selectedId);
  const detail = selectedId ? CATEGORY_DETAILS[selectedId] : null;

  const handleCategoryChange = (nextId: string) => {
    if (nextId === selectedId) return;

    setSelectedId(nextId);
    setProgress(null);
  };

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) {
        setProgress(selectedId ? loadCategoryProgress(selectedId) : null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="order-2 lg:hidden">
        <details className="group rounded-lg border border-gray-200 bg-white">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-gray-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600">
            <span>カテゴリを切り替える</span>
            <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-gray-500">
              <span className="max-w-[12rem] truncate text-right">
                {selected?.name ?? "未選択"}
              </span>
              <span
                aria-hidden="true"
                className="transition-transform group-open:rotate-180"
              >
                ↓
              </span>
            </span>
          </summary>
          <nav
            aria-label="カテゴリ一覧"
            className="border-t border-gray-200 px-4 py-4"
          >
            <CategoryList
              categories={categories}
              selectedId={selectedId}
              onSelect={handleCategoryChange}
              idPrefix="mobile"
            />
          </nav>
        </details>
      </div>

      <nav
        aria-label="カテゴリ一覧"
        className="order-1 hidden rounded-lg border border-gray-200 bg-white p-4 lg:block"
      >
        <CategoryList
          categories={categories}
          selectedId={selectedId}
          onSelect={handleCategoryChange}
          idPrefix="desktop"
        />
      </nav>

      {selected && detail && (
        <CategoryDetail
          selected={selected}
          detail={detail}
          progress={progress}
        />
      )}
    </div>
  );
}

function CategoryList({
  categories,
  selectedId,
  onSelect,
  idPrefix,
}: {
  categories: CategoryWithCount[];
  selectedId: string;
  onSelect: (nextId: string) => void;
  idPrefix: string;
}) {
  return (
    <>
      <div className="mb-4">
        <h2 className="text-base font-bold text-gray-950">カテゴリ</h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          ほかのカテゴリに切り替える時だけ使います。
        </p>
      </div>

      <div className="space-y-5">
        {CATEGORY_GROUPS.map((group) => {
          const groupCategories = categories.filter(
            (category) => getCategoryGroup(category.id) === group.id
          );

          if (groupCategories.length === 0) return null;

          const headingId = `group-${idPrefix}-${group.key}`;

          return (
            <section key={group.id} aria-labelledby={headingId}>
              <div>
                <h3
                  id={headingId}
                  className="text-sm font-semibold text-gray-900"
                >
                  {group.id}
                </h3>
                <p className="mt-1 hidden text-xs leading-5 text-gray-500 sm:block">
                  {group.description}
                </p>
              </div>

              <div className="mt-2 space-y-1">
                {groupCategories.map((category) => (
                  <CategoryButton
                    key={category.id}
                    category={category}
                    selected={category.id === selectedId}
                    onSelect={() => onSelect(category.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function CategoryDetail({
  selected,
  detail,
  progress,
}: {
  selected: CategoryWithCount;
  detail: CategoryDetailData;
  progress: CategoryProgress | null;
}) {
  const questionReady = selected.questionCount > 0;

  return (
    <section className="order-1 min-w-0 rounded-lg border border-gray-200 bg-white p-5 sm:p-6 lg:order-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">選択中</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-gray-950">
            {selected.name}
          </h2>
        </div>
        <StatusBadge ready={questionReady} count={selected.questionCount} />
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <InfoBlock
          label="形式"
          value={
            selected.defaultStyle === "scenario" ? "長文シナリオ" : "一問一答"
          }
        />
        <InfoBlock
          label="制限時間"
          value={`${Math.floor(selected.timeLimit / 60)}分`}
        />
        <InfoBlock label="問題数" value={`${selected.questionCount}問`} />
      </dl>

      <div className="mt-6">
        {questionReady ? (
          <Link
            href={`/exam/${selected.id}`}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
          >
            設定へ進む
          </Link>
        ) : (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            このカテゴリは準備中です。問題が登録されるまで開始できません。
          </p>
        )}
      </div>

      <div className="mt-6 divide-y divide-gray-200 border-t border-gray-200">
        <DisclosureSection title="概要">
          <p className="max-w-[65ch] text-sm leading-7 text-gray-600">
            {detail.overview}
          </p>
        </DisclosureSection>

        <DisclosureSection title="出題範囲">
          <div className="divide-y divide-gray-100">
            {detail.domains.map((domain) => (
              <div key={domain.name} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-medium text-gray-900">
                  {domain.name}
                </p>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {domain.description}
                </p>
              </div>
            ))}
          </div>
        </DisclosureSection>

        {progress && (
          <DisclosureSection title="学習進捗">
            <dl className="grid gap-3 sm:grid-cols-3">
              <InfoBlock label="最高得点" value={`${progress.bestScore}%`} />
              <InfoBlock label="挑戦回数" value={`${progress.attempts}`} />
              <InfoBlock
                label="解答済み"
                value={`${Object.keys(progress.questionHistory).length}`}
              />
            </dl>
          </DisclosureSection>
        )}
      </div>
    </section>
  );
}

function DisclosureSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="group">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-semibold text-gray-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600">
        <span>{title}</span>
        <span
          aria-hidden="true"
          className="text-gray-500 transition-transform group-open:rotate-180"
        >
          ↓
        </span>
      </summary>
      <div className="pb-4">{children}</div>
    </details>
  );
}

function CategoryButton({
  category,
  selected,
  onSelect,
}: {
  category: CategoryWithCount;
  selected: boolean;
  onSelect: () => void;
}) {
  const detail = CATEGORY_DETAILS[category.id];
  const stateLabel =
    category.questionCount === 0 ? "準備中" : `${category.questionCount}問`;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`min-h-11 w-full rounded-md px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
        selected
          ? "bg-blue-50 text-blue-900"
          : "text-gray-700 hover:bg-gray-50 hover:text-gray-950"
      }`}
    >
      <span className="block text-sm font-semibold">{category.name}</span>
      <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span>{styleLabel(category.defaultStyle)}</span>
        <span aria-hidden="true">/</span>
        <span>{Math.floor(category.timeLimit / 60)}分</span>
        <span aria-hidden="true">/</span>
        <span
          className={
            category.questionCount === 0 ? "text-amber-700" : "text-gray-600"
          }
        >
          {stateLabel}
        </span>
      </span>
      {selected && detail && (
        <span className="mt-1 block text-xs font-medium text-blue-700">
          選択中
        </span>
      )}
    </button>
  );
}

function StatusBadge({ ready, count }: { ready: boolean; count: number }) {
  return (
    <span
      className={`inline-flex w-fit rounded-md border px-2.5 py-1 text-xs font-semibold ${
        ready
          ? "border-blue-200 bg-blue-50 text-blue-800"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      {ready ? `${count}問` : "準備中"}
    </span>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-3">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-gray-950">{value}</dd>
    </div>
  );
}

function styleLabel(style: QuestionStyle): string {
  return style === "scenario" ? "長文" : "一問一答";
}

function getCategoryGroup(categoryId: string): CategoryGroup {
  return CATEGORY_DETAILS[categoryId]?.group ?? "その他";
}
