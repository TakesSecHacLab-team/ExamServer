export const BUG_REPORT_CATEGORIES = [
  "表示が崩れる",
  "問題文・解答が違う",
  "操作できない",
  "採点・結果がおかしい",
  "ページが開かない",
  "その他",
] as const;

export const BUG_REPORT_SEVERITIES = [
  "致命的",
  "困る",
  "少し困る",
] as const;

export const BUG_REPORT_LOCATIONS = [
  "講義",
  "演習選択",
  "試験設定",
  "試験中",
  "結果画面",
  "管理画面",
  "不明",
] as const;

export type BugReportCategory = (typeof BUG_REPORT_CATEGORIES)[number];
export type BugReportSeverity = (typeof BUG_REPORT_SEVERITIES)[number];
export type BugReportLocation = (typeof BUG_REPORT_LOCATIONS)[number];

export interface BugReportPayload {
  category?: string;
  severity?: string;
  where?: string;
  detail?: string;
  pageUrl?: string;
  userAgent?: string;
  viewport?: string;
  reportedAt?: string;
  hp?: string;
}

export interface ValidBugReport {
  category: BugReportCategory;
  severity: BugReportSeverity;
  where: BugReportLocation;
  detail: string;
  pageUrl: string;
  userAgent: string;
  viewport: string;
  reportedAt: string;
}

export interface BugReportValidationResult {
  ok: boolean;
  status: number;
  error?: string;
  report?: ValidBugReport;
}

export function inferBugReportLocation(pathname: string): BugReportLocation {
  if (pathname.startsWith("/learn")) return "講義";
  if (pathname.includes("/session")) return "試験中";
  if (pathname.startsWith("/exam/")) return "試験設定";
  if (pathname.startsWith("/TSHLadmin")) return "管理画面";
  if (pathname === "/" || pathname.startsWith("/?")) return "演習選択";
  return "不明";
}

export function validateBugReportPayload(
  payload: BugReportPayload,
  expectedOrigin: string
): BugReportValidationResult {
  if (typeof payload.hp === "string" && payload.hp.trim() !== "") {
    return { ok: false, status: 400, error: "送信できませんでした" };
  }

  const category = normalizeChoice(
    payload.category,
    BUG_REPORT_CATEGORIES,
    "category"
  );
  if (!category.ok) return category;

  const severity = normalizeChoice(
    payload.severity,
    BUG_REPORT_SEVERITIES,
    "severity"
  );
  if (!severity.ok) return severity;

  const where = normalizeChoice(
    payload.where || "不明",
    BUG_REPORT_LOCATIONS,
    "where"
  );
  if (!where.ok) return where;

  const pageUrl = normalizeSameOriginUrl(payload.pageUrl, expectedOrigin);
  if (!pageUrl.ok) return pageUrl;

  const detail = normalizeText(payload.detail, 1000, "detail");
  if (!detail.ok) return detail;

  const userAgent = normalizeText(payload.userAgent, 500, "userAgent");
  if (!userAgent.ok) return userAgent;

  const viewport = normalizeText(payload.viewport, 40, "viewport");
  if (!viewport.ok) return viewport;

  const reportedAt = normalizeReportedAt(payload.reportedAt);
  if (!reportedAt.ok) return reportedAt;

  return {
    ok: true,
    status: 200,
    report: {
      category: category.value,
      severity: severity.value,
      where: where.value,
      detail: detail.value,
      pageUrl: pageUrl.value,
      userAgent: userAgent.value || "未取得",
      viewport: viewport.value || "未取得",
      reportedAt: reportedAt.value,
    },
  };
}

export function formatBugReportIssue(report: ValidBugReport): {
  title: string;
  body: string;
} {
  const detail = report.detail || "補足なし";
  return {
    title: `[Bug] ${report.category} - ${report.where}`,
    body: [
      "## 報告内容",
      "",
      `- 種類: ${report.category}`,
      `- 影響度: ${report.severity}`,
      `- 場所: ${report.where}`,
      "",
      "## 補足",
      "",
      detail,
      "",
      "## 自動取得情報",
      "",
      `- URL: ${report.pageUrl}`,
      `- Viewport: ${report.viewport}`,
      `- User-Agent: ${report.userAgent}`,
      `- Reported at: ${report.reportedAt}`,
      "",
      "## 完了条件メモ",
      "",
      "- [ ] 再現条件を確認する",
      "- [ ] 期待動作を決める",
      "- [ ] 修正または問題データ修正を行う",
      "- [ ] 修正後の画面または問題を確認する",
    ].join("\n"),
  };
}

function normalizeChoice<T extends readonly string[]>(
  value: string | undefined,
  choices: T,
  field: string
):
  | { ok: true; value: T[number] }
  | { ok: false; status: number; error: string } {
  if (!value || !choices.includes(value)) {
    return { ok: false, status: 400, error: `${field} が不正です` };
  }
  return { ok: true, value: value as T[number] };
}

function normalizeSameOriginUrl(
  value: string | undefined,
  expectedOrigin: string
):
  | { ok: true; value: string }
  | { ok: false; status: number; error: string } {
  if (!value) {
    return { ok: false, status: 400, error: "pageUrl は必須です" };
  }

  try {
    const url = new URL(value);
    if (url.origin !== expectedOrigin) {
      return { ok: false, status: 400, error: "pageUrl が不正です" };
    }
    return { ok: true, value: url.toString() };
  } catch {
    return { ok: false, status: 400, error: "pageUrl が不正です" };
  }
}

function normalizeText(
  value: string | undefined,
  maxLength: number,
  field: string
):
  | { ok: true; value: string }
  | { ok: false; status: number; error: string } {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length > maxLength) {
    return {
      ok: false,
      status: 400,
      error: `${field} は${maxLength}文字以内で入力してください`,
    };
  }
  return { ok: true, value: text };
}

function normalizeReportedAt(
  value: string | undefined
):
  | { ok: true; value: string }
  | { ok: false; status: number; error: string } {
  if (!value) {
    return { ok: true, value: new Date().toISOString() };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, status: 400, error: "reportedAt が不正です" };
  }
  return { ok: true, value: date.toISOString() };
}
