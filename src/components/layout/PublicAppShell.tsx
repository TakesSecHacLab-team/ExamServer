import Link from "next/link";
import type { ReactNode } from "react";
import ThemeSelector from "./ThemeSelector";

type PublicSection = "learn" | "exam" | "admin";

interface PublicAppShellProps {
  activeSection: PublicSection;
  title: string;
  description?: string;
  eyebrow?: string;
  sidebar?: ReactNode;
  children: ReactNode;
  hideMobileTabs?: boolean;
}

const NAV_ITEMS: Array<{
  section: PublicSection;
  href: string;
  label: string;
  description: string;
}> = [
  {
    section: "learn",
    href: "/learn",
    label: "講義",
    description: "基礎を読む",
  },
  {
    section: "exam",
    href: "/",
    label: "演習",
    description: "問題を解く",
  },
];

export default function PublicAppShell({
  activeSection,
  title,
  description,
  eyebrow,
  sidebar,
  children,
  hideMobileTabs = false,
}: PublicAppShellProps) {
  if (activeSection === "learn") {
    return (
      <DocsAppShell
        title={title}
        description={description}
        eyebrow={eyebrow}
        sidebar={sidebar}
      >
        {children}
      </DocsAppShell>
    );
  }

  return (
    <div className="exam-production-surface min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--surface)] focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--link)] focus:shadow"
      >
        本文へ移動
      </a>

      <div className="mx-auto grid min-h-[100dvh] max-w-7xl lg:grid-cols-[16rem_minmax(0,1fr)]">
        <SideNavigation activeSection={activeSection} sidebar={sidebar} />

        <div className="min-w-0 pb-24 lg:pb-0">
          <header className="border-b border-[var(--border)] bg-[var(--surface)]/92 px-5 py-6 backdrop-blur sm:px-8 lg:px-10">
            <div className="flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-4xl">
                {eyebrow && (
                  <p className="text-sm font-semibold text-[var(--link)]">
                    {eyebrow}
                  </p>
                )}
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
                  {title}
                </h1>
                {description && (
                  <p className="mt-3 max-w-[65ch] text-base leading-7 text-[var(--text-muted)]">
                    {description}
                  </p>
                )}
              </div>
              <ThemeSelector modernLightLabel="本番風" />
            </div>
          </header>

          <main id="main-content" className="px-5 py-6 sm:px-8 lg:px-10">
            {children}
          </main>
        </div>
      </div>

      {!hideMobileTabs && <MobileBottomTabs activeSection={activeSection} />}
    </div>
  );
}

function DocsAppShell({
  title,
  description,
  eyebrow,
  sidebar,
  children,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  sidebar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--surface)] focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-[var(--link)] focus:shadow"
      >
        本文へ移動
      </a>

      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/92 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[92rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href="/learn"
            className="rounded-md text-sm font-semibold text-[var(--foreground)] transition-colors hover:text-[var(--link)]"
          >
            ExamServer Docs
          </Link>
          <nav
            aria-label="主要ナビゲーション"
            className="ml-4 hidden items-center gap-1 lg:flex"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.section}
                href={item.href}
                aria-current={item.section === "learn" ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${
                  item.section === "learn"
                    ? "bg-[var(--primary-soft)] text-[var(--link)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto">
            <ThemeSelector />
          </div>
        </div>

        {sidebar && (
          <details className="group border-t border-[var(--border)] lg:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 text-sm font-semibold text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus)]">
              <span>Navigation</span>
              <span
                aria-hidden="true"
                className="text-[var(--text-muted)] transition-transform group-open:rotate-180"
              >
                ↓
              </span>
            </summary>
            <div className="max-h-[62dvh] overflow-y-auto border-t border-[var(--border)] bg-[var(--surface)] px-4 py-4">
              <nav
                aria-label="主要ナビゲーション"
                className="mb-4 grid grid-cols-2 gap-2"
              >
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.section}
                    href={item.href}
                    aria-current={
                      item.section === "learn" ? "page" : undefined
                    }
                    className={`rounded-md px-3 py-2 text-center text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${
                      item.section === "learn"
                        ? "bg-[var(--primary-soft)] text-[var(--link)]"
                        : "bg-[var(--surface-muted)] text-[var(--text-muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              {sidebar}
            </div>
          </details>
        )}
      </header>

      <div className="mx-auto grid max-w-[92rem] lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-[var(--border)] bg-[var(--surface-subtle)] lg:block">
          <div className="sticky top-14 h-[calc(100dvh-3.5rem)] overflow-y-auto px-4 py-5">
            {sidebar}
          </div>
        </aside>

        <main id="main-content" className="min-w-0 px-5 py-8 sm:px-8 lg:px-10">
          <div className="max-w-[48rem]">
            {eyebrow && (
              <p className="text-sm font-semibold text-[var(--link)]">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-2 text-[2rem] font-semibold leading-tight text-[var(--foreground)] sm:text-[2.35rem]">
              {title}
            </h1>
            {description && (
              <p className="mt-4 max-w-[66ch] text-base leading-8 text-[var(--text-muted)]">
                {description}
              </p>
            )}
          </div>

          <div className="mt-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SideNavigation({
  activeSection,
  sidebar,
}: {
  activeSection: PublicSection;
  sidebar?: ReactNode;
}) {
  return (
    <aside className="hidden border-r border-[var(--border)] bg-[var(--surface)] lg:block">
      <div className="sticky top-0 flex h-[100dvh] flex-col overflow-y-auto px-4 py-5">
        <Link
          href="/"
          className="rounded-md px-3 py-2 text-base font-bold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
        >
          ExamServer
        </Link>

        <nav aria-label="公開ナビゲーション" className="mt-5 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.section}
              href={item.href}
              aria-current={
                activeSection === item.section ? "page" : undefined
              }
              className={`block rounded-md px-3 py-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${
                activeSection === item.section
                  ? "bg-[var(--primary-soft)] text-[var(--link)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
                {item.description}
              </span>
            </Link>
          ))}
        </nav>

        {sidebar && (
          <div className="mt-6 border-t border-[var(--border)] pt-5">
            {sidebar}
          </div>
        )}

        <div className="mt-auto border-t border-[var(--border)] pt-4">
          <Link
            href="/TSHLadmin"
            className="block rounded-md px-3 py-2 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
          >
            管理者ログイン
          </Link>
        </div>
      </div>
    </aside>
  );
}

function MobileBottomTabs({
  activeSection,
}: {
  activeSection: PublicSection;
}) {
  return (
    <nav
      aria-label="主要ナビゲーション"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.section}
            href={item.href}
            aria-current={activeSection === item.section ? "page" : undefined}
            className={`min-h-11 rounded-md px-3 py-2 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${
              activeSection === item.section
                ? "bg-[var(--primary)] text-[var(--surface)]"
                : "bg-[var(--surface-muted)] text-[var(--text-muted)] hover:bg-[var(--primary-soft)] hover:text-[var(--foreground)]"
            }`}
          >
            <span className="block text-sm font-semibold">{item.label}</span>
            <span
              className={`mt-0.5 block text-[11px] ${
                activeSection === item.section
                  ? "text-[var(--surface)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              {item.description}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
