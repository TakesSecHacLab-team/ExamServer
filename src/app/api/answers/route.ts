/**
 * 単問の回答検証 API
 *
 * POST /api/answers
 * 正解データはサーバー側でのみ参照し、クライアントには回答後にのみ返す。
 */

import { NextRequest } from "next/server";
import { findQuestionById } from "@/lib/questions";
import { scoreQuestion } from "@/lib/scoring";
import type { AnswerResponse } from "@/types/exam";

interface AnswerRequestBody {
  questionId: string;
  answer: number | number[];
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as AnswerRequestBody;

  if (!body.questionId || body.answer === undefined) {
    return Response.json(
      { error: "questionId と answer は必須です" },
      { status: 400 }
    );
  }

  const question = findQuestionById(body.questionId);
  if (!question) {
    return Response.json(
      { error: `問題が見つかりません: ${body.questionId}` },
      { status: 404 }
    );
  }

  const score = scoreQuestion(question, body.answer);

  const response: AnswerResponse = {
    correct: score === 1,
    score,
    answer: question.answer,
    explanation: question.explanation,
  };

  return Response.json(response);
}
