/**
 * 問題データの構造バリデーションスクリプト
 *
 * data/ 配下の JSON ファイルを検証し、不整合があればエラーを出力する。
 * GitHub Actions から実行される。
 *
 * 使い方: npx tsx scripts/validate-schema.ts
 */

import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import { getLearningSlugs } from "../src/lib/learning-content";
import {
  getLearningMap,
  validateLearningContentRegistry,
} from "../src/lib/learning";
import { getLearningImageMetas } from "../src/lib/learning-images";

// ---------------------------------------------------------------------------
// 型定義（ランタイムチェック用に独立して定義）
// ---------------------------------------------------------------------------

const VALID_STYLES = ["oneshot", "scenario"] as const;
const VALID_TYPES = ["single-choice", "multiple-choice"] as const;

// ---------------------------------------------------------------------------
// メイン
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), "data");
let errorCount = 0;

function error(msg: string) {
  console.error(`  ❌ ${msg}`);
  errorCount++;
}

function info(msg: string) {
  console.log(`  ✔ ${msg}`);
}

function cryptoHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeSvgForHash(value: string) {
  return value.replace(/\r\n/g, "\n");
}

// ---------------------------------------------------------------------------
// categories.json の検証
// ---------------------------------------------------------------------------

function validateCategories(): string[] {
  const filePath = path.join(DATA_DIR, "categories.json");
  console.log("\n📂 categories.json");

  if (!fs.existsSync(filePath)) {
    error("categories.json が見つかりません");
    return [];
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  let categories: unknown[];
  try {
    categories = JSON.parse(raw);
  } catch {
    error("JSON パースエラー");
    return [];
  }

  if (!Array.isArray(categories)) {
    error("配列である必要があります");
    return [];
  }

  const ids: string[] = [];

  for (let i = 0; i < categories.length; i++) {
    const c = categories[i] as Record<string, unknown>;
    const prefix = `[${i}]`;

    if (!c.id || typeof c.id !== "string") error(`${prefix} id が未設定`);
    if (!c.name || typeof c.name !== "string") error(`${prefix} name が未設定`);
    if (!c.description || typeof c.description !== "string")
      error(`${prefix} description が未設定`);
    if (!VALID_STYLES.includes(c.defaultStyle as typeof VALID_STYLES[number]))
      error(`${prefix} defaultStyle が不正: ${c.defaultStyle}`);
    if (typeof c.timeLimit !== "number" || c.timeLimit <= 0)
      error(`${prefix} timeLimit が不正: ${c.timeLimit}`);

    if (typeof c.id === "string") {
      if (ids.includes(c.id)) {
        error(`${prefix} id "${c.id}" が重複`);
      }
      ids.push(c.id);
    }
  }

  info(`${categories.length} カテゴリ、${ids.length} 個の有効な ID`);
  return ids;
}

// ---------------------------------------------------------------------------
// 問題の検証
// ---------------------------------------------------------------------------

function validateQuestion(
  q: Record<string, unknown>,
  prefix: string,
  allIds: Set<string>
) {
  // ID
  if (!q.id || typeof q.id !== "string") {
    error(`${prefix} id が未設定`);
  } else {
    if (allIds.has(q.id)) {
      error(`${prefix} id "${q.id}" がカテゴリ横断で重複`);
    }
    allIds.add(q.id);
  }

  // style
  if (q.style && !VALID_STYLES.includes(q.style as typeof VALID_STYLES[number])) {
    error(`${prefix} style が不正: ${q.style}`);
  }

  // type
  if (!VALID_TYPES.includes(q.type as typeof VALID_TYPES[number])) {
    error(`${prefix} type が不正: ${q.type}`);
  }

  // text
  if (!q.text || typeof q.text !== "string" || (q.text as string).trim() === "") {
    error(`${prefix} 問題文が空`);
  }

  // options
  if (!Array.isArray(q.options)) {
    error(`${prefix} options が配列でない`);
  } else {
    const opts = q.options as string[];
    if (opts.length < 2 || opts.length > 6) {
      error(`${prefix} 選択肢数が範囲外: ${opts.length}（2〜6）`);
    }
    for (let i = 0; i < opts.length; i++) {
      if (!opts[i] || typeof opts[i] !== "string" || opts[i].trim() === "") {
        error(`${prefix} options[${i}] が空`);
      }
    }
    // 選択肢の重複チェック
    const unique = new Set(opts.map((o) => o.trim()));
    if (unique.size !== opts.length) {
      error(`${prefix} 選択肢に重複あり`);
    }

    // answer の範囲チェック
    const optLen = opts.length;
    if (q.type === "single-choice") {
      if (typeof q.answer !== "number") {
        error(`${prefix} single-choice の answer が数値でない`);
      } else if (q.answer < 0 || q.answer >= optLen) {
        error(`${prefix} answer(${q.answer}) が options 範囲外（0〜${optLen - 1}）`);
      }
    } else if (q.type === "multiple-choice") {
      if (!Array.isArray(q.answer)) {
        error(`${prefix} multiple-choice の answer が配列でない`);
      } else {
        const ans = q.answer as number[];
        if (ans.length < 1) {
          error(`${prefix} answer が空配列`);
        }
        for (const a of ans) {
          if (typeof a !== "number" || a < 0 || a >= optLen) {
            error(`${prefix} answer 値 ${a} が options 範囲外`);
          }
        }
      }
    }
  }

  // explanation
  if (!q.explanation || typeof q.explanation !== "string" || (q.explanation as string).trim() === "") {
    error(`${prefix} 解説が空`);
  }
}

// ---------------------------------------------------------------------------
// カテゴリごとの問題データ検証
// ---------------------------------------------------------------------------

function validateExamData(categoryIds: string[]) {
  const allQuestionIds = new Set<string>();

  for (const catId of categoryIds) {
    const examDir = path.join(DATA_DIR, "exams", catId);
    console.log(`\n📂 ${catId}/`);

    if (!fs.existsSync(examDir)) {
      error(`ディレクトリが見つかりません: ${examDir}`);
      continue;
    }

    // meta.json
    const metaPath = path.join(examDir, "meta.json");
    if (!fs.existsSync(metaPath)) {
      error("meta.json が見つかりません");
    } else {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
        if (meta.categoryId !== catId) {
          error(`meta.json の categoryId (${meta.categoryId}) がディレクトリ名 (${catId}) と不一致`);
        }
        info("meta.json OK");
      } catch {
        error("meta.json パースエラー");
      }
    }

    // questions.json
    const questionsPath = path.join(examDir, "questions.json");
    if (fs.existsSync(questionsPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
        if (!Array.isArray(data.questions)) {
          error("questions.json の questions が配列でない");
        } else {
          for (let i = 0; i < data.questions.length; i++) {
            validateQuestion(data.questions[i], `questions[${i}]`, allQuestionIds);
          }
          info(`questions.json: ${data.questions.length} 問`);
        }
      } catch {
        error("questions.json パースエラー");
      }
    }

    // scenario-*.json
    const scenarioFiles = fs.existsSync(examDir)
      ? fs.readdirSync(examDir).filter((f) => f.startsWith("scenario-") && f.endsWith(".json"))
      : [];

    for (const sf of scenarioFiles) {
      const scenarioPath = path.join(examDir, sf);
      try {
        const scenario = JSON.parse(fs.readFileSync(scenarioPath, "utf-8"));
        const prefix = `${sf}`;

        if (!scenario.id || typeof scenario.id !== "string")
          error(`${prefix} id が未設定`);
        if (!scenario.title || typeof scenario.title !== "string")
          error(`${prefix} title が未設定`);
        if (!scenario.scenario || typeof scenario.scenario !== "string")
          error(`${prefix} scenario 本文が空`);

        if (!Array.isArray(scenario.questions)) {
          error(`${prefix} questions が配列でない`);
        } else {
          for (let i = 0; i < scenario.questions.length; i++) {
            validateQuestion(
              scenario.questions[i],
              `${prefix} questions[${i}]`,
              allQuestionIds
            );
          }
          info(`${sf}: ${scenario.questions.length} 問`);
        }

        // シナリオ画像の存在チェック
        if (Array.isArray(scenario.scenarioImages)) {
          for (const img of scenario.scenarioImages) {
            const imgPath = path.join(process.cwd(), "public", img);
            if (!fs.existsSync(imgPath)) {
              error(`${prefix} 参照画像が見つかりません: ${img}`);
            }
          }
        }
      } catch {
        error(`${sf} パースエラー`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 学習マップの検証
// ---------------------------------------------------------------------------

function validateLearningData() {
  console.log("\n📂 learning-map.json");

  try {
    const learningMap = getLearningMap();
    validateLearningContentRegistry(learningMap, getLearningSlugs());
    info(`${learningMap.nodes.length} 学習ノード`);
  } catch (err) {
    error(err instanceof Error ? err.message : "learning-map.json の検証エラー");
  }
}

function listMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listMdxFiles(fullPath);
    if (entry.isFile() && entry.name.endsWith(".mdx")) return [fullPath];
    return [];
  });
}

function getQuotedFigureAttrs(block: string): Record<string, string> {
  const attrs: Record<string, string> = {};

  for (const match of block.matchAll(/(\w+)="([^"]*)"/g)) {
    attrs[match[1]] = match[2];
  }

  return attrs;
}

function validateLearningAssets() {
  console.log("\n📂 learning assets");

  const contentDir = path.join(process.cwd(), "src", "content", "learning");
  const publicDir = path.join(process.cwd(), "public");
  const generatedAssetScript = path.join(
    process.cwd(),
    "scripts",
    "ensure-learning-assets.mjs"
  );
  const refs = new Set<string>();
  const imageMetas = getLearningImageMetas();
  const imageMetaBySrc = new Map(imageMetas.map((image) => [image.src, image]));

  for (const filePath of listMdxFiles(contentDir)) {
    const raw = fs.readFileSync(filePath, "utf-8");
    for (const match of raw.matchAll(/src="(\/learning\/[^"]+)"/g)) {
      refs.add(match[1]);
    }

    for (const match of raw.matchAll(/<QuotedFigure\s+([\s\S]*?)>/g)) {
      const attrs = getQuotedFigureAttrs(match[1]);
      const imageMeta = attrs.src ? imageMetaBySrc.get(attrs.src) : undefined;
      if (!imageMeta) continue;

      const relPath = path.relative(process.cwd(), filePath);
      const expectedLicenseNote = `${imageMeta.licenseName} / ${imageMeta.publisher}`;
      const expectedAttrs = {
        sourceTitle: imageMeta.sourceTitle,
        sourceUrl: imageMeta.sourceUrl,
        licenseNote: expectedLicenseNote,
      };

      for (const [key, expectedValue] of Object.entries(expectedAttrs)) {
        if (attrs[key] !== expectedValue) {
          error(
            `${relPath} の ${attrs.src} は ${key} が learning-images.json と一致しません: ${attrs[key] ?? "(未指定)"}`
          );
        }
      }
    }
  }

  if (fs.existsSync(generatedAssetScript)) {
    error(
      "自動生成の学習画像スクリプトは禁止です: scripts/ensure-learning-assets.mjs"
    );
  }

  const seenManifestSrc = new Set<string>();
  for (const image of imageMetas) {
    if (seenManifestSrc.has(image.src)) {
      error(`learning-images.json の src が重複しています: ${image.src}`);
    }
    seenManifestSrc.add(image.src);

    if (image.kind !== "direct" && image.kind !== "adapted") {
      error(`画像は direct/adapted のみ許可: ${image.src}`);
    }
    if (image.kind === "adapted" && !image.modificationNote.trim()) {
      error(`加工引用の modificationNote が空です: ${image.src}`);
    }
    if (
      image.kind === "direct" &&
      /日本語化|簡略化|再作図/.test(image.modificationNote)
    ) {
      error(`直接引用画像を加工図として説明しないでください: ${image.src}`);
    }
    if (
      image.sourceLanguage === "en" &&
      (!("translationNote" in image) ||
        typeof image.translationNote !== "string" ||
        !image.translationNote.trim())
    ) {
      error(`英語出典画像は日本語の訳注が必要です: ${image.src}`);
    }
    if (
      image.assetLanguage !== "ja" &&
      image.assetLanguage !== "en" &&
      image.assetLanguage !== "multi"
    ) {
      error(`assetLanguage は ja/en/multi のみ許可: ${image.src}`);
    }
    for (const [key, value] of Object.entries(image)) {
      if (typeof value === "string" && value.trim() === "") {
        error(`learning-images.json の ${key} が空です: ${image.src}`);
      }
    }
    for (const urlKey of ["sourceUrl", "licenseUrl"] as const) {
      try {
        const url = new URL(image[urlKey]);
        if (url.protocol !== "https:") {
          error(`${urlKey} は https URL にしてください: ${image.src}`);
        }
      } catch {
        error(`${urlKey} が不正です: ${image.src}`);
      }
    }
  }

  for (const ref of [...refs].sort()) {
    const imageMeta = imageMetaBySrc.get(ref);
    if (!imageMeta) {
      error(`学習画像が learning-images.json に未登録です: ${ref}`);
    }

    const assetPath = path.join(publicDir, ref.slice(1));
    if (!fs.existsSync(assetPath)) {
      error(`学習コンテンツの参照画像が見つかりません: ${ref}`);
      continue;
    }

    if (path.extname(assetPath) === ".svg") {
      const rawAsset = fs.readFileSync(assetPath, "utf-8");
      if (rawAsset.includes("ExamServer learning diagram")) {
        error(`自動生成/自作図マーカーが残っています: ${ref}`);
      }

      if (imageMeta?.kind === "direct") {
        if (!/^[a-f0-9]{64}$/.test(imageMeta.localSha256 ?? "")) {
          error(`直接引用画像は localSha256 が必要です: ${ref}`);
        } else {
          const hash = cryptoHash(normalizeSvgForHash(rawAsset));
          if (hash !== imageMeta.localSha256) {
            error(`直接引用画像の SHA-256 が manifest と一致しません: ${ref}`);
          }
        }
      }
    }
  }

  for (const image of imageMetas) {
    if (!refs.has(image.src)) {
      error(`learning-images.json の画像が教材から参照されていません: ${image.src}`);
    }
  }

  info(`${refs.size} 個の学習画像参照`);
}

// ---------------------------------------------------------------------------
// 実行
// ---------------------------------------------------------------------------

console.log("=== ExamServer 問題データバリデーション ===");

const categoryIds = validateCategories();
validateExamData(categoryIds);
validateLearningData();
validateLearningAssets();

console.log(`\n${"=".repeat(40)}`);
if (errorCount > 0) {
  console.error(`\n❌ ${errorCount} 件のエラーが見つかりました`);
  process.exit(1);
} else {
  console.log("\n✅ すべてのチェックに通過しました");
  process.exit(0);
}
