/**
 * 問題データの読み込み・変換
 *
 * data/ 配下のJSONファイルからカテゴリ・問題データを読み込む。
 * クライアント向けには正解・解説を除外した PublicQuestion を返す。
 */

import fs from "fs";
import path from "path";
import type {
  Category,
  Question,
  QuestionFile,
  PublicQuestion,
  Scenario,
  PublicScenario,
  ExamMeta,
} from "@/types/exam";

/** data ディレクトリのパス */
const DATA_DIR = path.join(process.cwd(), "data");

// ---------------------------------------------------------------------------
// カテゴリ
// ---------------------------------------------------------------------------

/** カテゴリ一覧を取得 */
export function getCategories(): Category[] {
  const filePath = path.join(DATA_DIR, "categories.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Category[];
}

/** IDからカテゴリを取得 */
export function getCategoryById(id: string): Category | undefined {
  return getCategories().find((c) => c.id === id);
}

// ---------------------------------------------------------------------------
// 問題データ（サーバー側：正解付き）
// ---------------------------------------------------------------------------

/** カテゴリの問題データディレクトリパスを返す */
function getExamDir(categoryId: string): string {
  return path.join(DATA_DIR, "exams", categoryId);
}

/** カテゴリのメタ情報を取得 */
export function getExamMeta(categoryId: string): ExamMeta | null {
  const metaPath = path.join(getExamDir(categoryId), "meta.json");
  if (!fs.existsSync(metaPath)) return null;
  return JSON.parse(fs.readFileSync(metaPath, "utf-8")) as ExamMeta;
}

/** 一問一答型の問題を取得（正解付き） */
export function getQuestions(categoryId: string): Question[] {
  const questionsPath = path.join(getExamDir(categoryId), "questions.json");
  if (!fs.existsSync(questionsPath)) return [];
  const data = JSON.parse(
    fs.readFileSync(questionsPath, "utf-8")
  ) as QuestionFile;
  return data.questions;
}

/** シナリオ一覧を取得（正解付き） */
export function getScenarios(categoryId: string): Scenario[] {
  const examDir = getExamDir(categoryId);
  if (!fs.existsSync(examDir)) return [];

  return fs
    .readdirSync(examDir)
    .filter((f) => f.startsWith("scenario-") && f.endsWith(".json"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(examDir, f), "utf-8");
      return JSON.parse(raw) as Scenario;
    });
}

/**
 * カテゴリ内の全問題を取得（正解付き）
 * oneshot問題 → scenario問題の順で結合。シナリオ内の小問順序は維持。
 */
export function getAllQuestions(categoryId: string): Question[] {
  const oneshot = getQuestions(categoryId);
  const scenarios = getScenarios(categoryId);
  const scenarioQuestions = scenarios.flatMap((s) => s.questions);
  return [...oneshot, ...scenarioQuestions];
}

/** IDから問題を検索（カテゴリ横断） */
export function findQuestionById(questionId: string): Question | undefined {
  const categories = getCategories();
  for (const cat of categories) {
    const all = getAllQuestions(cat.id);
    const found = all.find((q) => q.id === questionId);
    if (found) return found;
  }
  return undefined;
}

/** カテゴリ内でIDから問題を検索 */
export function findQuestionByIdInCategory(
  categoryId: string,
  questionId: string
): Question | undefined {
  return getAllQuestions(categoryId).find((q) => q.id === questionId);
}

// ---------------------------------------------------------------------------
// クライアント向け（正解・解説を除外）
// ---------------------------------------------------------------------------

/** 問題から正解・解説を除外する */
export function toPublicQuestion(q: Question): PublicQuestion {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { answer, explanation, ...publicFields } = q;
  return publicFields;
}

/** シナリオから正解・解説を除外する */
export function toPublicScenario(s: Scenario): PublicScenario {
  return {
    id: s.id,
    title: s.title,
    scenario: s.scenario,
    scenarioImages: s.scenarioImages,
    questions: s.questions.map(toPublicQuestion),
  };
}
