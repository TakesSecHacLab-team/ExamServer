"use client";

/**
 * カテゴリ選択コンポーネント
 * 目的別にカテゴリを選択し、概要・出題範囲・学習進捗を表示する。
 */

import { useState } from "react";
import Link from "next/link";
import type { Category, CategoryProgress, QuestionStyle } from "@/types/exam";
import { CATEGORY_DETAILS, CATEGORY_GROUPS } from "@/lib/category-details";
import { loadCategoryProgress } from "@/lib/storage";

interface CategoryWithCount extends Category {
  questionCount: number;
}

interface Props {
  categories: CategoryWithCount[];
}

export default function CategorySelector({ categories }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [progress, setProgress] = useState<CategoryProgress | null>(null);

  const selected = categories.find((c) => c.id === selectedId);
  const detail = selectedId ? CATEGORY_DETAILS[selectedId] : null;

  const handleCategoryChange = (nextId: string) => {
    setSelectedId(nextId);
    setProgress(nextId ? loadCategoryProgress(nextId) : null);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-5" aria-label="カテゴリ一覧">
        {CATEGORY_GROUPS.map((group) => {
          const groupCategories = categories.filter(
            (category) => CATEGORY_DETAILS[category.id]?.group === group.id
          );

          if (groupCategories.length === 0) return null;

          return (
            <section key={group.id} aria-labelledby={`group-${group.key}`}>
              <div className="mb-3">
                <h2
                  id={`group-${group.key}`}
                  className="text-base font-bold text-gray-900"
                >
                  {group.id}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {group.description}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {groupCategories.map((category) => (
                  <CategoryButton
                    key={category.id}
                    category={category}
                    selected={category.id === selectedId}
                    onSelect={() => handleCategoryChange(category.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* 選択後の詳細表示 */}
      {selected && detail && (
        <div className="space-y-5 animate-in fade-in">
          {/* 試験概要 */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {selected.name}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {detail.overview}
            </p>

            <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
              <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {selected.defaultStyle === "scenario"
                  ? "長文シナリオ"
                  : "一問一答"}
              </span>
              <span>制限時間: {Math.floor(selected.timeLimit / 60)}分</span>
            </div>
          </div>

          {/* 出題範囲 */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              出題範囲
            </h3>
            <div className="space-y-3">
              {detail.domains.map((domain) => (
                <div key={domain.name}>
                  <p className="text-sm font-medium text-gray-800">
                    {domain.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {domain.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 学習進捗 */}
          {progress && (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                学習進捗
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {progress.bestScore}%
                  </p>
                  <p className="text-xs text-gray-500">最高得点</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {progress.attempts}
                  </p>
                  <p className="text-xs text-gray-500">挑戦回数</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {Object.keys(progress.questionHistory).length}
                  </p>
                  <p className="text-xs text-gray-500">解答済み問題</p>
                </div>
              </div>
            </div>
          )}

          {/* 試験開始ボタン */}
          <Link
            href={`/exam/${selected.id}`}
            className="block w-full text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {selected.name} の設定へ進む
          </Link>
        </div>
      )}
    </div>
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
      className={`w-full rounded-lg border px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <span className="block text-sm font-semibold text-gray-900">
        {category.name}
      </span>
      <span className="mt-1 block text-xs leading-relaxed text-gray-500">
        {category.description}
      </span>
      <span className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
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
        <span className="mt-2 block text-xs font-medium text-blue-700">
          選択中
        </span>
      )}
    </button>
  );
}

function styleLabel(style: QuestionStyle): string {
  return style === "scenario" ? "長文" : "一問一答";
}
