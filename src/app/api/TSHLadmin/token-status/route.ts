/**
 * GitHub トークン状態確認 API
 * GET: トークンの有効性とログインユーザー名を返す
 */

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { checkTokenStatus } from "@/lib/github";

export async function GET() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    return Response.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const status = await checkTokenStatus();
    return Response.json(status);
  } catch {
    return Response.json({
      valid: false,
      error: "GitHub 環境変数が設定されていません（GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO）",
    });
  }
}
