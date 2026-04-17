/**
 * カテゴリ情報取得 API
 *
 * GET /api/categories         → 全カテゴリ一覧
 * GET /api/categories?id=lpic1 → 単一カテゴリ
 */

import { NextRequest } from "next/server";
import { getCategories, getCategoryById } from "@/lib/questions";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (id) {
    const category = getCategoryById(id);
    if (!category) {
      return Response.json(
        { error: `カテゴリが見つかりません: ${id}` },
        { status: 404 }
      );
    }
    return Response.json(category);
  }

  return Response.json(getCategories());
}
