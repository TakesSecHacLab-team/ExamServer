"use client";

import type { ReactNode } from "react";

interface LessonReadingLayoutProps {
  mobileOutline: ReactNode;
  children: ReactNode;
}

export default function LessonReadingLayout({
  mobileOutline,
  children,
}: LessonReadingLayoutProps) {
  return (
    <div className="lesson-reading-layout mx-auto w-full">
      <div className="min-w-0">
        {mobileOutline}
        {children}
      </div>
    </div>
  );
}
