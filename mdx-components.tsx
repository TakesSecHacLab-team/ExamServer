import type { MDXComponents } from "mdx/types";
import {
  Callout,
  ExerciseLink,
  NextStep,
  QuotedFigure,
  SafeImage,
  SafeLink,
  SourceNote,
} from "@/components/learning/MdxComponents";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: SafeLink,
    img: SafeImage,
    Callout,
    ExerciseLink,
    NextStep,
    QuotedFigure,
    SourceNote,
    ...components,
  };
}
