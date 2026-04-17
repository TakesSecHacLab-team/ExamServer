/**
 * 一括アップロード API
 *
 * POST: JSON または CSV パース済みの問題配列を受け取り、
 *       questions.json に追記 commit する。
 */

import { NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getFileContent, putFileContent, questionsFilePath } from "@/lib/github";
import type { Question, QuestionFile } from "@/types/exam";

export async function POST(request: NextRequest) {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    return Response.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = await request.json();
  const { categoryId, questions } = body as {
    categoryId: string;
    questions: Question[];
  };

  if (!categoryId || !questions || questions.length === 0) {
    return Response.json(
      { error: "categoryId と questions（1問以上）が必要です" },
      { status: 400 }
    );
  }

  try {
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
    const existingIds = new Set(file.questions.map((q) => q.id));
    const duplicates = questions.filter((q) => existingIds.has(q.id));
    if (duplicates.length > 0) {
      return Response.json(
        {
          error: `重複する問題IDがあります: ${duplicates.map((q) => q.id).join(", ")}`,
        },
        { status: 409 }
      );
    }

    file.questions.push(...questions);

    await putFileContent(
      filePath,
      JSON.stringify(file, null, 2) + "\n",
      `一括追加: ${questions.length}問（${categoryId}）`,
      sha
    );

    return Response.json({ ok: true, added: questions.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "不明なエラー";
    return Response.json({ error: msg }, { status: 500 });
  }
}
