/**
 * 一括アップロードのクライアント部分
 *
 * CSV / JSON ファイルを読み込み、バリデーション + プレビュー後に一括登録。
 * CSV は一問一答 (oneshot) 専用。JSON は全スタイル対応。
 * style 省略時はカテゴリの defaultStyle を自動適用。
 */

"use client";

import { useState } from "react";
import type { Category, Question, QuestionStyle, QuestionType } from "@/types/exam";

interface Props {
  categories: Category[];
}

interface ParseResult {
  questions: Question[];
  errors: string[];
}

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

export default function BulkUploadClient({ categories }: Props) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const defaultStyle = selectedCategory?.defaultStyle || "oneshot";

  // ---------------------------------------------------------------------------
  // ファイル読み込み
  // ---------------------------------------------------------------------------

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsed(null);
    setResult(null);

    const text = await file.text();
    const isJson = file.name.endsWith(".json");

    if (isJson) {
      setParsed(parseJson(text, defaultStyle));
    } else {
      setParsed(parseCsv(text, defaultStyle));
    }
  };

  // ---------------------------------------------------------------------------
  // アップロード
  // ---------------------------------------------------------------------------

  const handleUpload = async () => {
    if (!parsed || parsed.questions.length === 0) return;
    setUploading(true);
    setResult(null);

    try {
      const res = await fetch("/api/TSHLadmin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          questions: parsed.questions,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(`${data.added} 問を登録しました`);
        setParsed(null);
      } else {
        setResult(`エラー: ${data.error}`);
      }
    } catch {
      setResult("通信エラーが発生しました");
    } finally {
      setUploading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // テンプレートダウンロード
  // ---------------------------------------------------------------------------

  const downloadCsvTemplate = () => {
    const optionHeaders = Array.from(
      { length: MAX_OPTIONS },
      (_, i) => `option${i + 1}`
    );
    const blankOptions = Array(MAX_OPTIONS - 4).fill("");
    const csvRows = [
      ["id", "type", "text", ...optionHeaders, "answer", "explanation"],
      [
        "example-001",
        "single-choice",
        "問題文を入力",
        "選択肢A",
        "選択肢B",
        "選択肢C",
        "選択肢D",
        ...blankOptions,
        "1",
        "解説文を入力",
      ],
      [
        "example-002",
        "multiple-choice",
        "全て選べ...",
        "A",
        "B",
        "C",
        "D",
        ...blankOptions,
        "0,2",
        "解説文",
      ],
    ];
    const csv = csvRows.map(toCsvLine).join("\n") + "\n";
    downloadFile("template.csv", csv);
  };

  const downloadJsonTemplate = () => {
    const json = JSON.stringify(
      {
        questions: [
          {
            id: "example-001",
            style: "oneshot",
            type: "single-choice",
            text: "問題文を入力",
            options: ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
            answer: 1,
            explanation: "解説文を入力",
          },
        ],
      },
      null,
      2
    );
    downloadFile("template.json", json);
  };

  // ---------------------------------------------------------------------------
  // 描画
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* カテゴリ選択 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          カテゴリ
        </label>
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setParsed(null);
            setResult(null);
          }}
          className="input w-64"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* テンプレート */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">
          テンプレートをダウンロード
        </p>
        <div className="flex gap-3">
          <button
            onClick={downloadCsvTemplate}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            CSV テンプレート
          </button>
          <button
            onClick={downloadJsonTemplate}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            JSON テンプレート
          </button>
        </div>
      </div>

      {/* ファイル選択 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          ファイルを選択（CSV / JSON）
        </label>
        <input
          type="file"
          accept=".csv,.json"
          onChange={handleFile}
          className="text-sm"
        />
      </div>

      {/* パースエラー */}
      {parsed?.errors && parsed.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-700 mb-1">
            バリデーションエラー
          </p>
          <ul className="text-xs text-red-600 list-disc list-inside space-y-0.5">
            {parsed.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* プレビュー */}
      {parsed && parsed.questions.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">
            プレビュー（{parsed.questions.length} 問）
          </p>
          <div className="overflow-x-auto max-h-80 border border-gray-200 rounded-lg">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-100">
                <tr className="text-left text-gray-600">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">スタイル</th>
                  <th className="px-3 py-2">タイプ</th>
                  <th className="px-3 py-2">問題文</th>
                  <th className="px-3 py-2">選択肢数</th>
                  <th className="px-3 py-2">正解</th>
                </tr>
              </thead>
              <tbody>
                {parsed.questions.map((q) => (
                  <tr key={q.id} className="border-t border-gray-100">
                    <td className="px-3 py-1.5 font-mono">{q.id}</td>
                    <td className="px-3 py-1.5">{q.style}</td>
                    <td className="px-3 py-1.5">{q.type}</td>
                    <td className="px-3 py-1.5 max-w-xs truncate">
                      {q.text}
                    </td>
                    <td className="px-3 py-1.5">{q.options.length}</td>
                    <td className="px-3 py-1.5">
                      {Array.isArray(q.answer)
                        ? q.answer.join(", ")
                        : q.answer}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || parsed.errors.length > 0}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {uploading
              ? "アップロード中..."
              : `${parsed.questions.length} 問を登録`}
          </button>
        </div>
      )}

      {/* 結果 */}
      {result && (
        <p
          className={`text-sm font-semibold ${
            result.startsWith("エラー") ? "text-red-600" : "text-green-600"
          }`}
        >
          {result}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// パーサー
// ---------------------------------------------------------------------------

function parseJson(text: string, defaultStyle: QuestionStyle): ParseResult {
  const errors: string[] = [];
  try {
    const data = JSON.parse(text);
    const questions: Question[] = [];

    const raw = Array.isArray(data) ? data : data.questions;
    if (!Array.isArray(raw)) {
      return { questions: [], errors: ["JSON の形式が正しくありません。questions 配列が必要です。"] };
    }

    for (let i = 0; i < raw.length; i++) {
      const q = raw[i];
      const errs = validateQuestion(q, i, defaultStyle);
      if (errs.length > 0) {
        errors.push(...errs);
      } else {
        questions.push({
          id: q.id,
          style: q.style || defaultStyle,
          type: q.type,
          text: q.text,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
        });
      }
    }

    return { questions, errors };
  } catch (e: unknown) {
    return {
      questions: [],
      errors: [`JSON パースエラー: ${e instanceof Error ? e.message : "不明"}`],
    };
  }
}

function parseCsv(text: string, defaultStyle: QuestionStyle): ParseResult {
  const errors: string[] = [];
  const questions: Question[] = [];

  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) {
    return { questions: [], errors: ["CSV にデータ行がありません"] };
  }

  // ヘッダースキップ
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const requiredColumns = 3 + MAX_OPTIONS + 2;
    if (cols.length < requiredColumns) {
      errors.push(`行${i + 1}: 列数が不足しています（最低${requiredColumns}列必要）`);
      continue;
    }

    const [id, type, qtext, ...rest] = cols;
    const optionValues = rest.slice(0, MAX_OPTIONS);
    const answerStr = rest[MAX_OPTIONS] ?? "";
    const explanation = rest[MAX_OPTIONS + 1] ?? "";
    const options = optionValues.filter((o) => o && o.trim());

    // answer パース
    let answer: number | number[];
    if (answerStr.includes(",")) {
      answer = answerStr.split(",").map((a) => parseInt(a.trim(), 10));
    } else {
      answer = parseInt(answerStr, 10);
    }

    const q = {
      id,
      style: defaultStyle as QuestionStyle,
      type: type as QuestionType,
      text: qtext,
      options,
      answer,
      explanation: explanation || "",
    };

    const errs = validateQuestion(q, i - 1, defaultStyle);
    if (errs.length > 0) {
      errors.push(...errs);
    } else {
      questions.push(q);
    }
  }

  return { questions, errors };
}

/** CSV 行をパースする（引用符対応） */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

/** 問題データのバリデーション */
function validateQuestion(
  q: Record<string, unknown>,
  index: number,
  defaultStyle: QuestionStyle
): string[] {
  const errors: string[] = [];
  const prefix = `問題${index + 1}`;

  if (!q.id) errors.push(`${prefix}: ID が未設定`);
  if (!q.text) errors.push(`${prefix}: 問題文が空`);
  if (!q.type || !["single-choice", "multiple-choice"].includes(q.type as string)) {
    errors.push(`${prefix}: type が不正（single-choice / multiple-choice）`);
  }

  const style = (q.style as string) || defaultStyle;
  if (!["oneshot", "scenario"].includes(style)) {
    errors.push(`${prefix}: style が不正（oneshot / scenario）`);
  }

  const opts = q.options;
  if (!Array.isArray(opts) || opts.length < MIN_OPTIONS || opts.length > MAX_OPTIONS) {
    errors.push(`${prefix}: 選択肢は ${MIN_OPTIONS}〜${MAX_OPTIONS} 個必要`);
  }

  if (!q.explanation) errors.push(`${prefix}: 解説が空`);

  return errors;
}

/** CSV 行として安全に出力する */
function toCsvLine(values: string[]): string {
  return values
    .map((value) =>
      /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
    )
    .join(",");
}

/** ファイルをダウンロードさせる */
function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain; charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
