import fs from "fs";
import path from "path";
import type { LearningMap, LearningNode } from "@/types/learning";
import { getCategories } from "@/lib/categories";

const DATA_DIR = path.join(process.cwd(), "data");

export function getLearningMap(): LearningMap {
  const filePath = path.join(DATA_DIR, "learning-map.json");
  const map = JSON.parse(fs.readFileSync(filePath, "utf-8")) as LearningMap;
  validateLearningMap(
    map,
    getCategories().map((category) => category.id)
  );
  return map;
}

export function validateLearningMap(
  map: LearningMap,
  knownCategoryIds: string[]
): void {
  if (!map.startNodeId) {
    throw new Error("learning map startNodeId is required");
  }

  const nodeIds = new Set<string>();
  const lessonSlugs = new Set<string>();
  const knownCategories = new Set(knownCategoryIds);

  for (const node of map.nodes) {
    if (!node.id) throw new Error("learning node id is required");
    if (nodeIds.has(node.id)) throw new Error(`duplicate node id: ${node.id}`);
    nodeIds.add(node.id);

    if (!node.title.trim()) throw new Error(`node title is empty: ${node.id}`);
    if (!node.summary.trim())
      throw new Error(`node summary is empty: ${node.id}`);
    if (
      node.status &&
      node.status !== "ready" &&
      node.status !== "planned"
    ) {
      throw new Error(`unknown node status: ${node.status}`);
    }

    if (node.lessonSlug) {
      if (lessonSlugs.has(node.lessonSlug)) {
        throw new Error(`duplicate lessonSlug: ${node.lessonSlug}`);
      }
      lessonSlugs.add(node.lessonSlug);
    }

    if (node.externalUrl && !isAllowedExternalUrl(node.externalUrl)) {
      throw new Error(`unsafe externalUrl: ${node.externalUrl}`);
    }

    if (
      node.exerciseCategoryId &&
      !knownCategories.has(node.exerciseCategoryId)
    ) {
      throw new Error(
        `unknown exerciseCategoryId: ${node.exerciseCategoryId}`
      );
    }

    for (const source of node.sources ?? []) {
      if (!source.title.trim()) throw new Error(`source title is empty`);
      if (!source.url.trim()) throw new Error(`source url is empty`);
      if (!source.publisher.trim()) throw new Error(`source publisher is empty`);
      if (!source.usage.trim()) throw new Error(`source usage is empty`);
      if (!source.licenseNote.trim())
        throw new Error(`source licenseNote is required`);
      if (!isAllowedExternalUrl(source.url)) {
        throw new Error(`unsafe source url: ${source.url}`);
      }
    }
  }

  if (!nodeIds.has(map.startNodeId)) {
    throw new Error(`unknown startNodeId: ${map.startNodeId}`);
  }

  for (const node of map.nodes) {
    for (const childId of node.children ?? []) {
      if (!nodeIds.has(childId)) {
        throw new Error(`unknown child id: ${childId}`);
      }
    }

    for (const prerequisiteId of node.prerequisites ?? []) {
      if (!nodeIds.has(prerequisiteId)) {
        throw new Error(`unknown prerequisite id: ${prerequisiteId}`);
      }
    }
  }

  validateReachableTree(map, toNodeMap(map));
}

export function validateLearningContentRegistry(
  map: LearningMap,
  registeredSlugs: string[]
): void {
  const mapSlugs = new Set(
    map.nodes
      .map((node) => node.lessonSlug)
      .filter((slug): slug is string => Boolean(slug))
  );
  const registrySlugs = new Set(registeredSlugs);

  for (const slug of mapSlugs) {
    if (!registrySlugs.has(slug)) {
      throw new Error(`missing lesson content: ${slug}`);
    }
  }

  for (const slug of registrySlugs) {
    if (!mapSlugs.has(slug)) {
      throw new Error(`unmapped lesson content: ${slug}`);
    }
  }
}

function validateReachableTree(
  map: LearningMap,
  byId: Map<string, LearningNode>
): void {
  const reachable = new Set<string>();
  const visiting = new Set<string>();

  const walk = (id: string, pathIds: string[]) => {
    if (visiting.has(id)) {
      throw new Error(
        `cycle detected in learning map: ${[...pathIds, id].join(" -> ")}`
      );
    }
    if (reachable.has(id)) return;

    const node = byId.get(id);
    if (!node) return;

    visiting.add(id);
    for (const childId of node.children ?? []) {
      walk(childId, [...pathIds, id]);
    }
    visiting.delete(id);
    reachable.add(id);
  };

  walk(map.startNodeId, []);

  for (const node of map.nodes) {
    if (!reachable.has(node.id)) {
      throw new Error(`unreachable node: ${node.id}`);
    }
  }
}

function isAllowedExternalUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function flattenLearningNodes(map: LearningMap): LearningNode[] {
  const byId = toNodeMap(map);
  const visited = new Set<string>();
  const result: LearningNode[] = [];

  const walk = (id: string) => {
    if (visited.has(id)) return;
    const node = byId.get(id);
    if (!node) return;

    visited.add(id);
    result.push(node);
    for (const childId of node.children ?? []) walk(childId);
  };

  walk(map.startNodeId);

  for (const node of map.nodes) {
    if (!visited.has(node.id)) walk(node.id);
  }

  return result;
}

export function findLearningNodeBySlug(
  map: LearningMap,
  slug: string
): LearningNode | undefined {
  return map.nodes.find((node) => node.lessonSlug === slug);
}

export function getLearningPath(
  map: LearningMap,
  targetNodeId: string
): LearningNode[] {
  const byId = toNodeMap(map);
  const path: LearningNode[] = [];

  const walk = (id: string): boolean => {
    const node = byId.get(id);
    if (!node) return false;

    path.push(node);
    if (node.id === targetNodeId) return true;

    for (const childId of node.children ?? []) {
      if (walk(childId)) return true;
    }

    path.pop();
    return false;
  };

  return walk(map.startNodeId) ? path : [];
}

export function getNextLearningNode(
  map: LearningMap,
  nodeId: string
): LearningNode | undefined {
  const nodes = flattenLearningNodes(map);
  const currentIndex = nodes.findIndex((node) => node.id === nodeId);
  return currentIndex >= 0 ? nodes[currentIndex + 1] : undefined;
}

export function getNextLessonNode(
  map: LearningMap,
  nodeId: string
): LearningNode | undefined {
  const nodes = flattenLearningNodes(map);
  const currentIndex = nodes.findIndex((node) => node.id === nodeId);
  if (currentIndex < 0) return undefined;

  return nodes
    .slice(currentIndex + 1)
    .find((node) => Boolean(node.lessonSlug || node.externalUrl));
}

function toNodeMap(map: LearningMap): Map<string, LearningNode> {
  return new Map(map.nodes.map((node) => [node.id, node]));
}
