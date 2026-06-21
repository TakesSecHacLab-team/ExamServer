"use client";

type PanelSide = "left" | "right";

interface PanelToggleButtonProps {
  side: PanelSide;
  isOpen: boolean;
  openLabel: string;
  closedLabel: string;
  onClick: () => void;
}

function PanelIcon({ side, isOpen }: { side: PanelSide; isOpen: boolean }) {
  const panelX = side === "left" ? 4 : 13;
  const dividerX = side === "left" ? 8 : 12;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="pointer-events-none h-4 w-4"
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

export default function PanelToggleButton({
  side,
  isOpen,
  openLabel,
  closedLabel,
  onClick,
}: PanelToggleButtonProps) {
  const label = isOpen ? openLabel : closedLabel;

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
    >
      <PanelIcon side={side} isOpen={isOpen} />
    </button>
  );
}
