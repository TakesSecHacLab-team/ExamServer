// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ExerciseLink,
  QuotedFigure,
  SafeImage,
  SafeLink,
  SourceNote,
} from "@/components/learning/MdxComponents";

describe("QuotedFigure", () => {
  it("renders source and license information", () => {
    render(
      <QuotedFigure
        src="https://example.com/osi.svg"
        alt="OSI参照モデルの図"
        sourceTitle="OSI Model v1.svg"
        sourceUrl="https://commons.wikimedia.org/wiki/File:OSI_Model_v1.svg"
        licenseNote="CC0 1.0 Universal"
      >
        OSI参照モデルの層を確認する図。
      </QuotedFigure>
    );

    expect(screen.getByAltText("OSI参照モデルの図")).toBeInTheDocument();
    expect(screen.getByText(/OSI Model v1.svg/)).toBeInTheDocument();
    expect(screen.getByText(/CC0 1.0 Universal/)).toBeInTheDocument();
  });

  it("rejects figures without license notes", () => {
    expect(() =>
      render(
        <QuotedFigure
          src="https://example.com/osi.svg"
          alt="OSI参照モデルの図"
          sourceTitle="OSI Model v1.svg"
          sourceUrl="https://commons.wikimedia.org/wiki/File:OSI_Model_v1.svg"
          licenseNote=""
        />
      )
    ).toThrow(/licenseNote/);
  });

  it("rejects unsafe figure URLs", () => {
    expect(() =>
      render(
        <QuotedFigure
          src="javascript:alert(1)"
          alt="OSI参照モデルの図"
          sourceTitle="OSI Model v1.svg"
          sourceUrl="https://commons.wikimedia.org/wiki/File:OSI_Model_v1.svg"
          licenseNote="CC0 1.0 Universal"
        />
      )
    ).toThrow(/src/);
  });

  it("rejects unsafe source note URLs", () => {
    expect(() =>
      render(
        <SourceNote
          title="Bad"
          url="data:text/html,hello"
          publisher="Example"
          licenseNote="Link reference only."
        />
      )
    ).toThrow(/https URL/);
  });

  it("rejects non-internal exercise links", () => {
    expect(() =>
      render(<ExerciseLink href="https://example.com">外部へ進む</ExerciseLink>)
    ).toThrow(/internal href/);
  });

  it("allows safe Markdown-style links", () => {
    render(<SafeLink href="https://example.com/reference">参考</SafeLink>);

    expect(screen.getByRole("link", { name: "参考" })).toHaveAttribute(
      "href",
      "https://example.com/reference"
    );
  });

  it("rejects unsafe Markdown-style links", () => {
    expect(() =>
      render(<SafeLink href="javascript:alert(1)">危ないリンク</SafeLink>)
    ).toThrow(/https URL/);
  });

  it("rejects unsafe Markdown-style images", () => {
    expect(() =>
      render(<SafeImage src="data:image/svg+xml,hello" alt="bad image" />)
    ).toThrow(/src/);
  });
});
