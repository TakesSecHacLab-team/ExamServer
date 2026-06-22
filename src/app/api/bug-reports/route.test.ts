import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createIssueMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/github", () => ({
  createIssue: createIssueMock,
}));

import { POST } from "./route";

beforeEach(() => {
  createIssueMock.mockReset();
  createIssueMock.mockResolvedValue({
    number: 123,
    url: "https://github.com/TakesSecHacLab-team/ExamServer/issues/123",
  });
});

describe("POST /api/bug-reports", () => {
  it("creates a GitHub issue from selected report fields", async () => {
    const response = await POST(
      request({
        category: "表示が崩れる",
        severity: "困る",
        where: "講義",
        detail: "見出しが重なっています。",
        pageUrl: "https://example.test/learn/web/auth",
        userAgent: "Vitest",
        viewport: "390x844",
        reportedAt: "2026-06-22T12:00:00.000Z",
      })
    );

    await expect(response.json()).resolves.toEqual({
      ok: true,
      issueUrl: "https://github.com/TakesSecHacLab-team/ExamServer/issues/123",
    });
    expect(createIssueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "[Bug] 表示が崩れる - 講義",
        body: expect.stringContaining("見出しが重なっています。"),
      })
    );
  });

  it("rejects missing selected fields", async () => {
    const response = await POST(
      request({
        severity: "困る",
        where: "講義",
        pageUrl: "https://example.test/learn/web/auth",
      })
    );

    expect(response.status).toBe(400);
    expect(createIssueMock).not.toHaveBeenCalled();
  });

  it("rejects honeypot submissions", async () => {
    const response = await POST(
      request({
        category: "表示が崩れる",
        severity: "困る",
        where: "講義",
        pageUrl: "https://example.test/learn/web/auth",
        hp: "bot value",
      })
    );

    expect(response.status).toBe(400);
    expect(createIssueMock).not.toHaveBeenCalled();
  });

  it("rejects cross-origin submissions", async () => {
    const response = await POST(
      request(
        {
          category: "表示が崩れる",
          severity: "困る",
          where: "講義",
          pageUrl: "https://example.test/learn/web/auth",
        },
        { origin: "https://attacker.test" }
      )
    );

    expect(response.status).toBe(403);
    expect(createIssueMock).not.toHaveBeenCalled();
  });
});

function request(
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest("https://example.test/api/bug-reports", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://example.test",
      referer: "https://example.test/",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}
