import type { MDXComponents } from "mdx/types";
import {
  Callout,
  ExerciseLink,
  NextStep,
  QuotedFigure,
  SourceNote,
} from "@/components/learning/MdxComponents";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Callout,
    ExerciseLink,
    NextStep,
    QuotedFigure,
    SourceNote,
    ...components,
  };
}
