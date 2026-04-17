/**
 * 管理画面の認証付きレイアウト
 * ログイン済みでなければログインページへリダイレクト。
 * サイドバーなしのシンプルなヘッダー + コンテンツ構成。
 */

import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/TSHLadmin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
