export type LearningNodeKind = "chapter" | "lesson" | "exercise" | "external";

export interface LearningSource {
  title: string;
  url: string;
  publisher: string;
  usage: string;
  licenseNote: string;
}

export interface LearningModule {
  slug: string;
  title: string;
  lead: string;
  level: string;
  sources: LearningSource[];
  next?: string;
}

export interface LearningNode {
  id: string;
  title: string;
  summary: string;
  kind: LearningNodeKind;
  status?: "ready" | "planned";
  children?: string[];
  prerequisites?: string[];
  lessonSlug?: string;
  exerciseCategoryId?: string;
  externalUrl?: string;
  sources?: LearningSource[];
}

export interface LearningMap {
  startNodeId: string;
  nodes: LearningNode[];
}
