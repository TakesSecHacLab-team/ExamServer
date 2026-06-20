import fs from "fs";
import path from "path";
import type { ComponentType } from "react";
import { slugifyHeading } from "@/lib/heading-slug";

type LessonModule = {
  default: ComponentType<Record<string, unknown>>;
};

export interface LearningHeading {
  id: string;
  title: string;
  level: 2 | 3;
}

const lessonImports: Record<string, () => Promise<LessonModule>> = {
  "network/osi-model": () =>
    import("@/content/learning/network/osi-model.mdx") as Promise<LessonModule>,
  "network/dns-resolution": () =>
    import("@/content/learning/network/dns-resolution.mdx") as Promise<LessonModule>,
  "network/ip-addressing": () =>
    import("@/content/learning/network/ip-addressing.mdx") as Promise<LessonModule>,
  "network/ports": () =>
    import("@/content/learning/network/ports.mdx") as Promise<LessonModule>,
  "network/http": () =>
    import("@/content/learning/network/http.mdx") as Promise<LessonModule>,
  "network/tls": () =>
    import("@/content/learning/network/tls.mdx") as Promise<LessonModule>,
  "linux/filesystem": () =>
    import("@/content/learning/linux/filesystem.mdx") as Promise<LessonModule>,
  "linux/permissions": () =>
    import("@/content/learning/linux/permissions.mdx") as Promise<LessonModule>,
  "linux/processes": () =>
    import("@/content/learning/linux/processes.mdx") as Promise<LessonModule>,
  "linux/shell": () =>
    import("@/content/learning/linux/shell.mdx") as Promise<LessonModule>,
  "linux/logs": () =>
    import("@/content/learning/linux/logs.mdx") as Promise<LessonModule>,
  "web/cookies": () =>
    import("@/content/learning/web/cookies.mdx") as Promise<LessonModule>,
  "web/auth": () =>
    import("@/content/learning/web/auth.mdx") as Promise<LessonModule>,
  "web/cors": () =>
    import("@/content/learning/web/cors.mdx") as Promise<LessonModule>,
  "binary/numeral-systems": () =>
    import("@/content/learning/binary/numeral-systems.mdx") as Promise<LessonModule>,
  "binary/memory": () =>
    import("@/content/learning/binary/memory.mdx") as Promise<LessonModule>,
  "binary/stack-heap": () =>
    import("@/content/learning/binary/stack-heap.mdx") as Promise<LessonModule>,
  "binary/file-format": () =>
    import("@/content/learning/binary/file-format.mdx") as Promise<LessonModule>,
  "crypto/hash": () =>
    import("@/content/learning/crypto/hash.mdx") as Promise<LessonModule>,
  "crypto/symmetric": () =>
    import("@/content/learning/crypto/symmetric.mdx") as Promise<LessonModule>,
  "crypto/asymmetric": () =>
    import("@/content/learning/crypto/asymmetric.mdx") as Promise<LessonModule>,
  "crypto/signature": () =>
    import("@/content/learning/crypto/signature.mdx") as Promise<LessonModule>,
  "crypto/pki": () =>
    import("@/content/learning/crypto/pki.mdx") as Promise<LessonModule>,
  "security/vulnerabilities": () =>
    import("@/content/learning/security/vulnerabilities.mdx") as Promise<LessonModule>,
  "security/attack-surface": () =>
    import("@/content/learning/security/attack-surface.mdx") as Promise<LessonModule>,
  "security/defense": () =>
    import("@/content/learning/security/defense.mdx") as Promise<LessonModule>,
  "security/logs": () =>
    import("@/content/learning/security/logs.mdx") as Promise<LessonModule>,
};

export function getLearningSlugs(): string[] {
  return Object.keys(lessonImports);
}

export async function loadLearningLesson(slug: string) {
  return lessonImports[slug]?.();
}

export function getLearningLessonHeadings(slug: string): LearningHeading[] {
  if (!lessonImports[slug]) return [];

  const filePath = path.join(
    process.cwd(),
    "src",
    "content",
    "learning",
    `${slug}.mdx`
  );

  if (!fs.existsSync(filePath)) return [];

  const raw = fs.readFileSync(filePath, "utf-8");
  const counts = new Map<string, number>();

  return [...raw.matchAll(/^(#{2,3})\s+(.+)$/gm)].map((match) => {
    const level = match[1].length as 2 | 3;
    const title = match[2].trim().replace(/<[^>]+>/g, "");
    const baseId = slugifyHeading(title);
    const count = counts.get(baseId) ?? 0;
    counts.set(baseId, count + 1);

    return {
      id: count === 0 ? baseId : `${baseId}-${count + 1}`,
      title,
      level,
    };
  });
}
