"use client";

import type { ReactNode } from "react";
import { useState } from "react";

interface DocsWorkspaceProps {
  sidebar?: ReactNode;
  children: ReactNode;
}

function SidePanelIcon({
  side,
  isOpen,
}: {
  side: "left" | "right";
  isOpen: boolean;
}) {
  const panelX = side === "left" ? 4 : 13;
  const dividerX = side === "left" ? 8 : 12;

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
      <path d={`M${dividerX} 5v10`} />
      <rect
        x={panelX}
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

export default function DocsWorkspace({
  sidebar,
  children,
}: DocsWorkspaceProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const hasSidebar = Boolean(sidebar);

  return (
    <div
      className={`mx-auto grid max-w-[100rem] pb-24 lg:pb-0 ${
        hasSidebar && isSidebarOpen
          ? "lg:grid-cols-[18rem_minmax(0,1fr)]"
          : "lg:grid-cols-[0_minmax(0,1fr)]"
      }`}
    >
      {hasSidebar && (
        <aside
          aria-hidden={!isSidebarOpen}
          className={`hidden overflow-hidden bg-[var(--surface-subtle)] transition-[opacity,border-color] duration-200 lg:block ${
            isSidebarOpen
              ? "border-r border-[var(--border)] opacity-100"
              : "pointer-events-none border-r-0 opacity-0"
          }`}
        >
          <div className="sticky top-24 h-[calc(100dvh-6rem)] overflow-y-auto px-4 py-5">
            {sidebar}
          </div>
        </aside>
      )}

      <div className="min-w-0">
        {hasSidebar && (
          <div className="sticky top-24 z-30 hidden h-0 px-5 sm:px-8 lg:flex lg:px-10">
            <button
              type="button"
              aria-expanded={isSidebarOpen}
              aria-label={isSidebarOpen ? "講義ナビを隠す" : "講義ナビを表示"}
              title={isSidebarOpen ? "講義ナビを隠す" : "講義ナビを表示"}
              onClick={() => setIsSidebarOpen((current) => !current)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
            >
              <SidePanelIcon side="left" isOpen={isSidebarOpen} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
