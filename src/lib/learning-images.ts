import learningImages from "../../data/learning-images.json";

export type LearningImageKind = "direct" | "adapted";

export interface LearningImageMeta {
  src: string;
  kind: LearningImageKind;
  sourceTitle: string;
  sourceUrl: string;
  publisher: string;
  licenseName: string;
  licenseUrl: string;
  sourceLanguage: "ja" | "en" | "multi";
  assetLanguage: "ja" | "en" | "multi";
  modificationNote: string;
  translationNote?: string;
  localSha256?: string;
  accessedAt: string;
}

const imageMap = new Map(
  learningImages.images.map((image) => [image.src, image as LearningImageMeta])
);

export function getLearningImageMeta(src: string): LearningImageMeta | undefined {
  return imageMap.get(src);
}

export function getLearningImageMetas(): LearningImageMeta[] {
  return [...imageMap.values()];
}
