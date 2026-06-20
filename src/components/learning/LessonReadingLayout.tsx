"use client";

import type { ReactNode } from "react";
import { useState } from "react";

interface LessonReadingLayoutProps {
  outline: ReactNode;
  children: ReactNode;
}

function SidePanelIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="4.5" width="13" height="11" rx="2" />
      <path d="M12 5v10" />
      <rect
        x="13"
        y="5.25"
        width="3"
        height="9.5"
        rx="1"
        className={isOpen ? "fill-current opacity-35" : "opacity-0"}
        stroke="none"
      />
    </svg>
  );
}

export default function LessonReadingLayout({
  outline,
  children,
}: LessonReadingLayoutProps) {
  const [isOutlineOpen, setIsOutlineOpen] = useState(true);

  return (
    <div className="mx-auto w-fit max-w-full">
      <div
        className={`grid gap-10 ${
          isOutlineOpen
            ? "xl:grid-cols-[minmax(0,78ch)_13rem]"
            : "xl:grid-cols-[minmax(0,92ch)_2.25rem]"
        }`}
      >
        <div
          className={`min-w-0 ${
            isOutlineOpen ? "" : "lesson-outline-closed"
          }`}
        >
          {children}
        </div>

        <aside className="hidden xl:block">
          <div
            className={`sticky top-24 ${
              isOutlineOpen ? "border-l border-[var(--border)] pl-4" : ""
            }`}
          >
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                aria-expanded={isOutlineOpen}
                aria-label={isOutlineOpen ? "このページを隠す" : "このページを表示"}
                title={isOutlineOpen ? "このページを隠す" : "このページを表示"}
                onClick={() => setIsOutlineOpen((current) => !current)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
              >
                <SidePanelIcon isOpen={isOutlineOpen} />
              </button>
            </div>

            {isOutlineOpen && outline}
          </div>
        </aside>
      </div>
    </div>
  );
}
