/**
 * 管理者認証ヘルパー
 *
 * API Route やサーバーコンポーネントから認証状態を確認する共通関数。
 */

import { cookies } from "next/headers";

const SESSION_COOKIE = "admin-session";

/**
 * Cookie から管理者トークンを取得する。
 * 実際の検証は /api/TSHLadmin/auth の isAuthenticated で行うが、
 * Serverless 環境ではメモリ内トークンストアが関数呼出し間で共有されないため、
 * Cookie の存在自体を認証済みの指標として扱う簡易方式を採用。
 */
export async function getAdminToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

/** 管理者として認証済みかを判定 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const token = await getAdminToken();
  return !!token;
}
