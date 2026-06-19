import type { ComponentType } from "react";

type LessonModule = {
  default: ComponentType<Record<string, unknown>>;
};

const lessonImports: Record<string, () => Promise<LessonModule>> = {
  "network/osi-model": () =>
    import("@/content/learning/network/osi-model.mdx") as Promise<LessonModule>,
};

export function getLearningSlugs(): string[] {
  return Object.keys(lessonImports);
}

export async function loadLearningLesson(slug: string) {
  return lessonImports[slug]?.();
}
