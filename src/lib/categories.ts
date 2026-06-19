import fs from "fs";
import path from "path";
import type { Category } from "@/types/exam";

const DATA_DIR = path.join(process.cwd(), "data");

export function getCategories(): Category[] {
  const filePath = path.join(DATA_DIR, "categories.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Category[];
}
