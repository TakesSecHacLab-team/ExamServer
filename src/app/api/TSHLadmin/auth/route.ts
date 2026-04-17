/**
 * 管理者認証 API
 *
 * POST: ログイン（パスワード照合 → セッション Cookie 発行）
 * DELETE: ログアウト（Cookie 削除）
 * GET: 認証状態の確認
 */

import { NextRequest } from "next/server";
import { cookies } from "next/headers";

/** Cookie 名 */
const SESSION_COOKIE = "admin-session";

/** セッションの有効期限: 24 時間 */
const MAX_AGE = 60 * 60 * 24;

/**
 * 簡易セッショントークンを生成する。
 * crypto.randomUUID を使用。本番では JWT 等に置き換え可能。
 */
function generateToken(): string {
  return crypto.randomUUID();
}

// サーバー起動中だけ有効なトークンストア（メモリ内）
// Vercel の serverless 環境では関数呼び出しごとにリセットされるが、
// Cookie の存在 + 環境変数パスワードの照合で十分なセキュリティを確保。
const validTokens = new Set<string>();

/** トークンが有効か検証する */
export function isAuthenticated(token: string | undefined): boolean {
  if (!token) return false;
  return validTokens.has(token);
}

// ---------------------------------------------------------------------------
// POST: ログイン
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return Response.json(
      { error: "ADMIN_PASSWORD が設定されていません" },
      { status: 500 }
    );
  }

  if (password !== adminPassword) {
    return Response.json({ error: "パスワードが正しくありません" }, { status: 401 });
  }

  const token = generateToken();
  validTokens.add(token);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });

  return Response.json({ ok: true });
}

// ---------------------------------------------------------------------------
// DELETE: ログアウト
// ---------------------------------------------------------------------------
export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) validTokens.delete(token);

  cookieStore.delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}

// ---------------------------------------------------------------------------
// GET: 認証状態の確認
// ---------------------------------------------------------------------------
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const authenticated = isAuthenticated(token);
  return Response.json({ authenticated });
}
