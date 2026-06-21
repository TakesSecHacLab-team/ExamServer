"use client";

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import PanelToggleButton from "./PanelToggleButton";

interface DocsWorkspaceProps {
  sidebar?: ReactNode;
  rightSidebar?: ReactNode;
  children: ReactNode;
}

export default function DocsWorkspace({
  sidebar,
  rightSidebar,
  children,
}: DocsWorkspaceProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const hasSidebar = Boolean(sidebar);
  const hasRightSidebar = Boolean(rightSidebar);
  const workspaceStyle = {
    "--docs-left-width": hasSidebar
      ? isSidebarOpen
        ? "18rem"
        : "3.75rem"
      : "0rem",
    "--docs-right-width": hasRightSidebar
      ? isRightSidebarOpen
        ? "14rem"
        : "3.75rem"
      : "0rem",
  } as CSSProperties;

  return (
    <div
      className="docs-workspace mx-auto grid max-w-[100rem] pb-24 lg:grid-cols-[var(--docs-left-width)_minmax(0,1fr)] lg:pb-0 xl:grid-cols-[var(--docs-left-width)_minmax(0,1fr)_var(--docs-right-width)]"
      data-left-open={isSidebarOpen}
      data-right-open={hasRightSidebar ? isRightSidebarOpen : undefined}
      style={workspaceStyle}
    >
      {hasSidebar && (
        <aside
          className="hidden h-[calc(100dvh-3.5rem)] self-start overflow-hidden border-r border-[var(--border)] bg-[var(--surface-subtle)] transition-[width] duration-200 lg:sticky lg:top-14 lg:block"
        >
          <div className="flex h-full flex-col px-3 py-4">
            <div className="mb-4 flex justify-end">
              <PanelToggleButton
                side="left"
                isOpen={isSidebarOpen}
                openLabel="講義ナビを隠す"
                closedLabel="講義ナビを表示"
                onClick={() => setIsSidebarOpen((current) => !current)}
              />
            </div>
            <div
              aria-hidden={!isSidebarOpen}
              inert={!isSidebarOpen}
              className={`min-h-0 overflow-y-auto transition-opacity duration-150 ${
                isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              {sidebar}
            </div>
          </div>
        </aside>
      )}

      <div className="min-w-0">
        {children}
      </div>

      {hasRightSidebar && (
        <aside className="hidden h-[calc(100dvh-3.5rem)] self-start overflow-hidden border-l border-[var(--border)] bg-[var(--surface-subtle)] transition-[width] duration-200 xl:sticky xl:top-14 xl:block">
          <div className="flex h-full flex-col px-3 py-4">
            <div className="mb-4 flex justify-end">
              <PanelToggleButton
                side="right"
                isOpen={isRightSidebarOpen}
                openLabel="このページを隠す"
                closedLabel="このページを表示"
                onClick={() => setIsRightSidebarOpen((current) => !current)}
              />
            </div>
            <div
              aria-hidden={!isRightSidebarOpen}
              inert={!isRightSidebarOpen}
              className={`min-h-0 overflow-y-auto transition-opacity duration-150 ${
                isRightSidebarOpen
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              {rightSidebar}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
