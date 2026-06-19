import { describe, expect, it } from "vitest";
import type { LearningMap } from "@/types/learning";
import {
  findLearningNodeBySlug,
  flattenLearningNodes,
  getLearningMap,
  getLearningPath,
  getNextLearningNode,
  getNextLessonNode,
  validateLearningContentRegistry,
  validateLearningMap,
} from "@/lib/learning";
import { getLearningSlugs } from "@/lib/learning-content";

const baseMap: LearningMap = {
  startNodeId: "network",
  nodes: [
    {
      id: "network",
      title: "Network Foundations",
      summary: "通信の基礎を扱う章。",
      kind: "chapter",
      children: ["osi-model"],
    },
    {
      id: "osi-model",
      title: "OSI参照モデル",
      summary: "通信を層で分けて見るための入口。",
      kind: "lesson",
      lessonSlug: "network/osi-model",
      exerciseCategoryId: "thm-basics",
      prerequisites: ["network"],
      sources: [
        {
          title: "OSI Model v1.svg",
          url: "https://commons.wikimedia.org/wiki/File:OSI_Model_v1.svg",
          publisher: "Wikimedia Commons",
          usage: "OSI参照モデルの全体像を示す図として参照",
          licenseNote: "CC0 1.0 Universal",
        },
      ],
    },
  ],
};

describe("learning map utilities", () => {
  it("loads and validates the repository learning map", () => {
    const map = getLearningMap();

    expect(findLearningNodeBySlug(map, "network/osi-model")?.title).toBe(
      "OSI参照モデル"
    );
  });

  it("flattens the tree in display order", () => {
    expect(flattenLearningNodes(baseMap).map((node) => node.id)).toEqual([
      "network",
      "osi-model",
    ]);
  });

  it("finds a lesson by slug", () => {
    expect(findLearningNodeBySlug(baseMap, "network/osi-model")?.id).toBe(
      "osi-model"
    );
  });

  it("returns the current path from root to a lesson", () => {
    expect(getLearningPath(baseMap, "osi-model").map((node) => node.id)).toEqual(
      ["network", "osi-model"]
    );
  });

  it("rejects duplicate node ids", () => {
    const broken: LearningMap = {
      ...baseMap,
      nodes: [...baseMap.nodes, { ...baseMap.nodes[1], title: "重複" }],
    };

    expect(() => validateLearningMap(broken, ["thm-basics"])).toThrow(
      /duplicate node id/
    );
  });

  it("rejects unknown exercise categories", () => {
    const broken: LearningMap = {
      ...baseMap,
      nodes: [
        baseMap.nodes[0],
        { ...baseMap.nodes[1], exerciseCategoryId: "missing-category" },
      ],
    };

    expect(() => validateLearningMap(broken, ["thm-basics"])).toThrow(
      /unknown exerciseCategoryId/
    );
  });

  it("rejects embedded sources without license notes", () => {
    const broken: LearningMap = {
      ...baseMap,
      nodes: [
        baseMap.nodes[0],
        {
          ...baseMap.nodes[1],
          sources: [{ ...baseMap.nodes[1].sources![0], licenseNote: "" }],
        },
      ],
    };

    expect(() => validateLearningMap(broken, ["thm-basics"])).toThrow(
      /licenseNote/
    );
  });

  it("rejects unsafe external URLs", () => {
    const broken: LearningMap = {
      ...baseMap,
      nodes: [
        ...baseMap.nodes,
        {
          id: "external",
          title: "External",
          summary: "外部リンク。",
          kind: "external",
          externalUrl: "javascript:alert(1)",
        },
      ],
    };

    expect(() => validateLearningMap(broken, ["thm-basics"])).toThrow(
      /unsafe externalUrl/
    );
  });

  it("rejects unreachable nodes", () => {
    const broken: LearningMap = {
      ...baseMap,
      nodes: [
        ...baseMap.nodes,
        {
          id: "orphan",
          title: "Orphan",
          summary: "ツリーから到達できない講義。",
          kind: "lesson",
          lessonSlug: "orphan",
        },
      ],
    };

    expect(() => validateLearningMap(broken, ["thm-basics"])).toThrow(
      /unreachable node/
    );
  });

  it("rejects child cycles", () => {
    const broken: LearningMap = {
      ...baseMap,
      nodes: [
        { ...baseMap.nodes[0], children: ["osi-model"] },
        { ...baseMap.nodes[1], children: ["network"] },
      ],
    };

    expect(() => validateLearningMap(broken, ["thm-basics"])).toThrow(
      /cycle/
    );
  });

  it("skips placeholder chapters for next lesson navigation", () => {
    const map: LearningMap = {
      startNodeId: "root",
      nodes: [
        {
          id: "root",
          title: "Root",
          summary: "Root.",
          kind: "chapter",
          children: ["lesson-1", "placeholder", "lesson-2"],
        },
        {
          id: "lesson-1",
          title: "Lesson 1",
          summary: "First lesson.",
          kind: "lesson",
          status: "ready",
          lessonSlug: "lesson-1",
        },
        {
          id: "placeholder",
          title: "Placeholder",
          summary: "Coming later.",
          kind: "chapter",
        },
        {
          id: "lesson-2",
          title: "Lesson 2",
          summary: "Second lesson.",
          kind: "lesson",
          status: "ready",
          lessonSlug: "lesson-2",
        },
      ],
    };

    expect(getNextLearningNode(map, "lesson-1")?.id).toBe("placeholder");
    expect(getNextLessonNode(map, "lesson-1")?.id).toBe("lesson-2");
  });

  it("does not use planned external nodes as next lesson navigation", () => {
    const map: LearningMap = {
      startNodeId: "root",
      nodes: [
        {
          id: "root",
          title: "Root",
          summary: "Root.",
          kind: "chapter",
          status: "ready",
          children: ["lesson-1", "external"],
        },
        {
          id: "lesson-1",
          title: "Lesson 1",
          summary: "First lesson.",
          kind: "lesson",
          status: "ready",
          lessonSlug: "lesson-1",
        },
        {
          id: "external",
          title: "External",
          summary: "Planned external step.",
          kind: "external",
          status: "planned",
          externalUrl: "https://example.com",
        },
      ],
    };

    expect(getNextLearningNode(map, "lesson-1")?.id).toBe("external");
    expect(getNextLessonNode(map, "lesson-1")).toBeUndefined();
  });

  it("keeps learning map lesson slugs and content registry in sync", () => {
    const map = getLearningMap();

    expect(() =>
      validateLearningContentRegistry(map, getLearningSlugs())
    ).not.toThrow();
  });

  it("rejects lesson slug registry drift", () => {
    expect(() => validateLearningContentRegistry(baseMap, [])).toThrow(
      /missing lesson content/
    );
    expect(() =>
      validateLearningContentRegistry(baseMap, ["network/osi-model", "extra"])
    ).toThrow(/unmapped lesson content/);
  });
});
