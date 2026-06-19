/**
 * 問題登録・編集フォーム
 *
 * カテゴリ/スタイル/タイプはドロップダウン・ラジオで選択。
 * 選択肢は 4〜6 の動的追加。
 * スタイルが scenario の場合はシナリオ本文欄を表示。
 * プレビュー機能付き。
 */

"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type {
  Category,
  Question,
  QuestionStyle,
  QuestionType,
} from "@/types/exam";

interface Props {
  categories: Category[];
  /** 編集時に初期値として渡す */
  initialQuestion?: Question;
  initialCategoryId?: string;
  /** シナリオ編集時のシナリオメタ情報 */
  initialScenarioMeta?: { id: string; title: string; scenario: string };
  onSubmit: (data: {
    categoryId: string;
    question: Question;
    scenarioMeta?: { id: string; title: string; scenario: string };
  }) => Promise<void>;
  submitLabel?: string;
}

const MIN_OPTIONS = 4;
const MAX_OPTIONS = 6;

export default function QuestionForm({
  categories,
  initialQuestion,
  initialCategoryId,
  initialScenarioMeta,
  onSubmit,
  submitLabel = "保存",
}: Props) {
  // カテゴリ
  const [categoryId, setCategoryId] = useState(
    initialCategoryId || categories[0]?.id || ""
  );

  // カテゴリ変更時にデフォルトスタイルを自動適用
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const defaultStyle = selectedCategory?.defaultStyle || "oneshot";

  // 問題フィールド
  const [id, setId] = useState(initialQuestion?.id || "");
  const [style, setStyle] = useState<QuestionStyle>(
    initialQuestion?.style || defaultStyle
  );
  const [type, setType] = useState<QuestionType>(
    initialQuestion?.type || "single-choice"
  );
  const [text, setText] = useState(initialQuestion?.text || "");
  const [options, setOptions] = useState<string[]>(
    initialQuestion?.options || ["", "", "", ""]
  );
  const [answer, setAnswer] = useState<number | number[]>(
    initialQuestion?.answer ?? 0
  );
  const [explanation, setExplanation] = useState(
    initialQuestion?.explanation || ""
  );

  // シナリオメタ情報（style=scenario 時のみ）
  const [scenarioId, setScenarioId] = useState(
    initialScenarioMeta?.id || ""
  );
  const [scenarioTitle, setScenarioTitle] = useState(
    initialScenarioMeta?.title || ""
  );
  const [scenarioText, setScenarioText] = useState(
    initialScenarioMeta?.scenario || ""
  );

  // UI状態
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // -----------------------------------------------------------------------
  // 選択肢操作
  // -----------------------------------------------------------------------

  const handleCategoryChange = (nextCategoryId: string) => {
    setCategoryId(nextCategoryId);
    if (!initialQuestion) {
      const nextCategory = categories.find((c) => c.id === nextCategoryId);
      setStyle(nextCategory?.defaultStyle || "oneshot");
    }
  };

  const handleTypeChange = (nextType: QuestionType) => {
    setType(nextType);
    setAnswer((current) => {
      if (nextType === "single-choice") {
        return typeof current === "number" ? current : 0;
      }
      return Array.isArray(current) ? current : [];
    });
  };

  const addOption = () => {
    if (options.length < MAX_OPTIONS) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length <= MIN_OPTIONS) return;
    const next = options.filter((_, i) => i !== index);
    setOptions(next);

    // 回答インデックスの調整
    if (type === "single-choice") {
      const a = answer as number;
      if (a === index) setAnswer(0);
      else if (a > index) setAnswer(a - 1);
    } else {
      setAnswer(
        (answer as number[])
          .filter((a) => a !== index)
          .map((a) => (a > index ? a - 1 : a))
      );
    }
  };

  const updateOption = (index: number, value: string) => {
    setOptions(options.map((o, i) => (i === index ? value : o)));
  };

  // 正解のトグル
  const toggleAnswer = (index: number) => {
    if (type === "single-choice") {
      setAnswer(index);
    } else {
      const arr = answer as number[];
      if (arr.includes(index)) {
        setAnswer(arr.filter((a) => a !== index));
      } else {
        setAnswer([...arr, index].sort());
      }
    }
  };

  // -----------------------------------------------------------------------
  // バリデーション
  // -----------------------------------------------------------------------

  const validate = (): string | null => {
    if (!categoryId) return "カテゴリを選択してください";
    if (!id.trim()) return "問題IDを入力してください";
    if (!text.trim()) return "問題文を入力してください";
    if (options.some((o) => !o.trim())) return "空の選択肢があります";
    if (type === "multiple-choice" && (answer as number[]).length < 2) {
      return "複数選択では正解を2つ以上選択してください";
    }
    if (!explanation.trim()) return "解説を入力してください";
    if (style === "scenario") {
      if (!scenarioId.trim()) return "シナリオIDを入力してください";
      if (!scenarioTitle.trim()) return "シナリオタイトルを入力してください";
      if (!scenarioText.trim()) return "シナリオ本文を入力してください";
    }
    return null;
  };

  // -----------------------------------------------------------------------
  // 送信
  // -----------------------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const question: Question = {
        id: id.trim(),
        style,
        type,
        text: text.trim(),
        options: options.map((o) => o.trim()),
        answer,
        explanation: explanation.trim(),
      };

      const scenarioMeta =
        style === "scenario"
          ? {
              id: scenarioId.trim(),
              title: scenarioTitle.trim(),
              scenario: scenarioText.trim(),
            }
          : undefined;

      await onSubmit({ categoryId, question, scenarioMeta });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  // -----------------------------------------------------------------------
  // 描画
  // -----------------------------------------------------------------------

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* カテゴリ */}
      <Field label="カテゴリ">
        <select
          value={categoryId}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="input"
          disabled={!!initialCategoryId}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      {/* 問題ID */}
      <Field label="問題ID">
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="input"
          placeholder="例: lpic1-101-006"
          disabled={!!initialQuestion}
        />
      </Field>

      {/* スタイル */}
      <Field label="問題スタイル">
        <div className="flex gap-4">
          <RadioOption
            label="一問一答"
            checked={style === "oneshot"}
            onChange={() => setStyle("oneshot")}
          />
          <RadioOption
            label="長文シナリオ"
            checked={style === "scenario"}
            onChange={() => setStyle("scenario")}
          />
        </div>
      </Field>

      {/* シナリオ本文（style=scenario 時のみ） */}
      {style === "scenario" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
          <p className="text-sm font-semibold text-blue-700">シナリオ情報</p>
          <Field label="シナリオID">
            <input
              type="text"
              value={scenarioId}
              onChange={(e) => setScenarioId(e.target.value)}
              className="input"
              placeholder="例: sc-scenario-02"
            />
          </Field>
          <Field label="シナリオタイトル">
            <input
              type="text"
              value={scenarioTitle}
              onChange={(e) => setScenarioTitle(e.target.value)}
              className="input"
              placeholder="例: Webアプリケーションのセキュリティ対策"
            />
          </Field>
          <Field label="シナリオ本文（Markdown対応）">
            <textarea
              value={scenarioText}
              onChange={(e) => setScenarioText(e.target.value)}
              className="input min-h-[200px]"
              placeholder="A社は従業員300名の中堅製造業者であり..."
            />
          </Field>
        </div>
      )}

      {/* タイプ */}
      <Field label="回答形式">
        <div className="flex gap-4">
          <RadioOption
            label="単一選択"
            checked={type === "single-choice"}
            onChange={() => handleTypeChange("single-choice")}
          />
          <RadioOption
            label="複数選択"
            checked={type === "multiple-choice"}
            onChange={() => handleTypeChange("multiple-choice")}
          />
        </div>
      </Field>

      {/* 問題文 */}
      <Field label="問題文（Markdown対応）">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input min-h-[100px]"
          placeholder="問題文を入力..."
        />
      </Field>

      {/* 選択肢 */}
      <Field label={`選択肢（${MIN_OPTIONS}〜${MAX_OPTIONS}択）`}>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleAnswer(i)}
                className={`w-8 h-8 flex-shrink-0 rounded border-2 text-xs font-bold transition-colors ${
                  type === "single-choice"
                    ? (answer as number) === i
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300 text-gray-400 hover:border-green-400"
                    : (answer as number[]).includes(i)
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300 text-gray-400 hover:border-green-400"
                }`}
                title="正解に設定"
              >
                {i + 1}
              </button>
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                className="input flex-1"
                placeholder={`選択肢 ${i + 1}`}
              />
              {options.length > MIN_OPTIONS && (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="text-sm text-red-400 hover:text-red-600"
                  title="削除"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {options.length < MAX_OPTIONS && (
            <button
              type="button"
              onClick={addOption}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + 選択肢を追加
            </button>
          )}
        </div>
      </Field>

      {/* 解説 */}
      <Field label="解説（Markdown対応）">
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="input min-h-[80px]"
          placeholder="解説を入力..."
        />
      </Field>

      {/* プレビュー */}
      <div>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-sm text-blue-600 hover:text-blue-800 mb-2"
        >
          {showPreview ? "▲ プレビューを閉じる" : "▼ プレビューを表示"}
        </button>

        {showPreview && (
          <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
            <div className="prose prose-sm max-w-none text-gray-800">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
            </div>
            <ul className="space-y-1">
              {options.map((opt, i) => {
                const isCorrect =
                  type === "single-choice"
                    ? (answer as number) === i
                    : (answer as number[]).includes(i);
                return (
                  <li
                    key={i}
                    className={`text-sm px-3 py-2 rounded ${
                      isCorrect
                        ? "bg-green-50 text-green-800 border border-green-300"
                        : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    {opt || `(選択肢 ${i + 1})`}
                    {isCorrect && (
                      <span className="ml-2 text-xs font-semibold text-green-600">
                        正解
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">解説</p>
              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {explanation}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* エラー */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* 送信 */}
      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? "保存中..." : submitLabel}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// サブコンポーネント
// ---------------------------------------------------------------------------

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function RadioOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="accent-blue-600"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}
