/**
 * 一括アップロードページ
 */

import { getCategories } from "@/lib/questions";
import BulkUploadClient from "./BulkUploadClient";

export default function UploadPage() {
  const categories = getCategories();
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">
        一括アップロード
      </h1>
      <BulkUploadClient categories={categories} />
    </div>
  );
}
