import type { MDXComponents } from "mdx/types";
import {
  Callout,
  ExerciseLink,
  Heading2,
  Heading3,
  NextStep,
  QuotedFigure,
  SafeImage,
  SafeLink,
  SourceNote,
} from "@/components/learning/MdxComponents";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: SafeLink,
    h2: Heading2,
    h3: Heading3,
    img: SafeImage,
    Callout,
    ExerciseLink,
    NextStep,
    QuotedFigure,
    SourceNote,
    ...components,
  };
}
