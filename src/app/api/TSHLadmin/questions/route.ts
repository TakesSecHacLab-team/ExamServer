/**
 * 管理者用 問題 CRUD API
 *
 * GET: 問題一覧（正解付き、カテゴリ絞り込み対応）
 * POST: 問題の新規追加
 * PUT: 問題の更新
 * DELETE: 問題の削除
 *
 * 書き込み操作は GitHub API 経由でリポジトリに commit する。
 */

import { NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCategories, getQuestions, getScenarios } from "@/lib/questions";
import {
  getFileContent,
  putFileContent,
  questionsFilePath,
  scenarioFilePath,
} from "@/lib/github";
import type { Question, QuestionFile, Scenario } from "@/types/exam";

// ---------------------------------------------------------------------------
// 認証チェック
// ---------------------------------------------------------------------------

async function requireAuth() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    return Response.json({ error: "認証が必要です" }, { status: 401 });
  }
  return null;
}

// ---------------------------------------------------------------------------
// GET: 問題一覧（正解付き）
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const authErr = await requireAuth();
  if (authErr) return authErr;

  const categoryId = request.nextUrl.searchParams.get("categoryId");

  if (!categoryId) {
    // 全カテゴリの問題数を返す
    const categories = getCategories();
    const summary = categories.map((c) => {
      const questions = getQuestions(c.id);
      const scenarios = getScenarios(c.id);
      const scenarioQuestionCount = scenarios.reduce(
        (sum, s) => sum + s.questions.length,
        0
      );
      return {
        categoryId: c.id,
        categoryName: c.name,
        questionCount: questions.length,
        scenarioCount: scenarios.length,
        scenarioQuestionCount,
      };
    });
    return Response.json(summary);
  }

  // 特定カテゴリの問題を返す
  const questions = getQuestions(categoryId);
  const scenarios = getScenarios(categoryId);
  return Response.json({ questions, scenarios });
}

// ---------------------------------------------------------------------------
// POST: 問題の新規追加
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const authErr = await requireAuth();
  if (authErr) return authErr;

  const body = await request.json();
  const { categoryId, question, scenario } = body as {
    categoryId: string;
    question?: Question;
    scenario?: Scenario;
  };

  if (!categoryId) {
    return Response.json({ error: "categoryId は必須です" }, { status: 400 });
  }

  try {
    if (scenario) {
      // シナリオ追加
      const filePath = scenarioFilePath(categoryId, scenario.id);
      const existing = await getFileContent(filePath);
      if (existing) {
        return Response.json(
          { error: `シナリオ ${scenario.id} は既に存在します` },
          { status: 409 }
        );
      }
      await putFileContent(
        filePath,
        JSON.stringify(scenario, null, 2) + "\n",
        `問題追加: シナリオ ${scenario.id}（${categoryId}）`
      );
      return Response.json({ ok: true, type: "scenario", id: scenario.id });
    }

    if (question) {
      // 一問一答追加
      const filePath = questionsFilePath(categoryId);
      const existing = await getFileContent(filePath);

      let file: QuestionFile;
      let sha: string | undefined;

      if (existing) {
        file = JSON.parse(existing.content) as QuestionFile;
        sha = existing.sha;
      } else {
        file = { questions: [] };
      }

      // ID 重複チェック
      if (file.questions.some((q) => q.id === question.id)) {
        return Response.json(
          { error: `問題 ID ${question.id} は既に存在します` },
          { status: 409 }
        );
      }

      file.questions.push(question);
      await putFileContent(
        filePath,
        JSON.stringify(file, null, 2) + "\n",
        `問題追加: ${question.id}（${categoryId}）`,
        sha
      );
      return Response.json({ ok: true, type: "question", id: question.id });
    }

    return Response.json(
      { error: "question または scenario が必要です" },
      { status: 400 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "不明なエラー";
    return Response.json({ error: msg }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PUT: 問題の更新
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest) {
  const authErr = await requireAuth();
  if (authErr) return authErr;

  const body = await request.json();
  const { categoryId, question, scenario } = body as {
    categoryId: string;
    question?: Question;
    scenario?: Scenario;
  };

  if (!categoryId) {
    return Response.json({ error: "categoryId は必須です" }, { status: 400 });
  }

  try {
    if (scenario) {
      const filePath = scenarioFilePath(categoryId, scenario.id);
      const existing = await getFileContent(filePath);
      await putFileContent(
        filePath,
        JSON.stringify(scenario, null, 2) + "\n",
        `問題更新: シナリオ ${scenario.id}（${categoryId}）`,
        existing?.sha
      );
      return Response.json({ ok: true, type: "scenario", id: scenario.id });
    }

    if (question) {
      const filePath = questionsFilePath(categoryId);
      const existing = await getFileContent(filePath);
      if (!existing) {
        return Response.json({ error: "問題ファイルが見つかりません" }, { status: 404 });
      }

      const file = JSON.parse(existing.content) as QuestionFile;
      const idx = file.questions.findIndex((q) => q.id === question.id);
      if (idx === -1) {
        return Response.json(
          { error: `問題 ID ${question.id} が見つかりません` },
          { status: 404 }
        );
      }

      file.questions[idx] = question;
      await putFileContent(
        filePath,
        JSON.stringify(file, null, 2) + "\n",
        `問題更新: ${question.id}（${categoryId}）`,
        existing.sha
      );
      return Response.json({ ok: true, type: "question", id: question.id });
    }

    return Response.json(
      { error: "question または scenario が必要です" },
      { status: 400 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "不明なエラー";
    return Response.json({ error: msg }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE: 問題の削除
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  const authErr = await requireAuth();
  if (authErr) return authErr;

  const { categoryId, questionId } = await request.json();

  if (!categoryId || !questionId) {
    return Response.json(
      { error: "categoryId と questionId は必須です" },
      { status: 400 }
    );
  }

  try {
    const filePath = questionsFilePath(categoryId);
    const existing = await getFileContent(filePath);
    if (!existing) {
      return Response.json({ error: "問題ファイルが見つかりません" }, { status: 404 });
    }

    const file = JSON.parse(existing.content) as QuestionFile;
    const before = file.questions.length;
    file.questions = file.questions.filter((q) => q.id !== questionId);

    if (file.questions.length === before) {
      return Response.json(
        { error: `問題 ID ${questionId} が見つかりません` },
        { status: 404 }
      );
    }

    await putFileContent(
      filePath,
      JSON.stringify(file, null, 2) + "\n",
      `問題削除: ${questionId}（${categoryId}）`,
      existing.sha
    );
    return Response.json({ ok: true, deleted: questionId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "不明なエラー";
    return Response.json({ error: msg }, { status: 500 });
  }
}
