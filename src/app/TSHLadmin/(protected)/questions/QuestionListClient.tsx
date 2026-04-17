/**
 * 問題一覧のクライアント部分
 * カテゴリ絞り込み・テキスト検索・削除ダイアログ。
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Question } from "@/types/exam";

interface QuestionWithCategory extends Question {
  categoryId: string;
  categoryName: string;
}

interface Props {
  questions: QuestionWithCategory[];
  categories: Category[];
}

export default function QuestionListClient({ questions, categories }: Props) {
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  // フィルタ＆検索
  const filtered = questions.filter((q) => {
    if (filterCategory && q.categoryId !== filterCategory) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        q.id.toLowerCase().includes(s) ||
        q.text.toLowerCase().includes(s) ||
        q.options.some((o) => o.toLowerCase().includes(s))
      );
    }
    return true;
  });

  const handleDelete = async (q: QuestionWithCategory) => {
    if (!confirm(`問題「${q.id}」を削除しますか？`)) return;

    setDeleting(q.id);
    try {
      const res = await fetch("/api/TSHLadmin/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: q.categoryId,
          questionId: q.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "削除に失敗しました");
      } else {
        router.refresh();
      }
    } catch {
      alert("通信エラーが発生しました");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* フィルタ */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input sm:w-48"
        >
          <option value="">全カテゴリ</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ID・問題文・選択肢で検索..."
          className="input flex-1"
        />
      </div>

      {/* 件数 */}
      <p className="text-sm text-gray-500">
        {filtered.length} / {questions.length} 件
      </p>

      {/* テーブル */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">
          問題がありません
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-600">
                <th className="py-2 pr-3 font-semibold">ID</th>
                <th className="py-2 pr-3 font-semibold">カテゴリ</th>
                <th className="py-2 pr-3 font-semibold">スタイル</th>
                <th className="py-2 pr-3 font-semibold">タイプ</th>
                <th className="py-2 pr-3 font-semibold">問題文</th>
                <th className="py-2 font-semibold w-24">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr
                  key={q.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-2 pr-3 font-mono text-xs text-gray-600">
                    {q.id}
                  </td>
                  <td className="py-2 pr-3">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs">
                      {q.categoryName}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-xs text-gray-500">
                    {q.style === "scenario" ? "シナリオ" : "一問一答"}
                  </td>
                  <td className="py-2 pr-3 text-xs text-gray-500">
                    {q.type === "multiple-choice" ? "複数" : "単一"}
                  </td>
                  <td className="py-2 pr-3 max-w-xs truncate text-gray-700">
                    {q.text}
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/TSHLadmin/questions/${q.categoryId}/${q.id}/edit`}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        編集
                      </a>
                      <button
                        onClick={() => handleDelete(q)}
                        disabled={deleting === q.id}
                        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        {deleting === q.id ? "..." : "削除"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
