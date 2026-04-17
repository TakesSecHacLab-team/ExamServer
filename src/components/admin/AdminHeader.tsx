/**
 * 管理画面ヘッダー
 * ナビゲーションリンクとログアウトボタン。
 */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/TSHLadmin/questions", label: "問題一覧" },
  { href: "/TSHLadmin/questions/new", label: "問題登録" },
  { href: "/TSHLadmin/upload", label: "一括アップロード" },
];

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/TSHLadmin/auth", { method: "DELETE" });
    router.push("/TSHLadmin");
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/TSHLadmin/questions"
            className="text-base font-bold text-gray-900"
          >
            ExamServer 管理
          </Link>

          <nav className="flex items-center gap-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  pathname === item.href
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          ログアウト
        </button>
      </div>
    </header>
  );
}
