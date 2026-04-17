"use client";

/**
 * カテゴリ選択コンポーネント
 * プルダウンでカテゴリを選択すると、試験概要・出題ドメイン・学習進捗を表示する。
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Category, CategoryProgress } from "@/types/exam";
import { CATEGORY_DETAILS } from "@/lib/category-details";
import { loadCategoryProgress } from "@/lib/storage";

interface Props {
  categories: Category[];
}

export default function CategorySelector({ categories }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [progress, setProgress] = useState<CategoryProgress | null>(null);

  const selected = categories.find((c) => c.id === selectedId);
  const detail = selectedId ? CATEGORY_DETAILS[selectedId] : null;

  // 選択変更時に進捗を読み込む
  useEffect(() => {
    if (selectedId) {
      setProgress(loadCategoryProgress(selectedId));
    } else {
      setProgress(null);
    }
  }, [selectedId]);

  return (
    <div className="space-y-6">
      {/* プルダウン */}
      <div>
        <label
          htmlFor="category-select"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          試験カテゴリ
        </label>
        <select
          id="category-select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- 試験を選択してください --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
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

          {/* 出題ドメイン */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              出題ドメイン
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
