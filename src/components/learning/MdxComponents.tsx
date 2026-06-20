import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactNode,
} from "react";
import { slugifyHeading } from "@/lib/heading-slug";
import { getLearningImageMeta } from "@/lib/learning-images";

interface CalloutProps {
  title?: string;
  children: ReactNode;
}

export function Callout({ title, children }: CalloutProps) {
  return (
    <aside className="my-6 rounded-md border border-[var(--border)] bg-[var(--primary-soft)] px-4 py-3">
      {title && (
        <p className="mb-1 text-sm font-semibold text-[var(--foreground)]">
          {title}
        </p>
      )}
      <div className="text-sm leading-7 text-[var(--foreground)]">
        {children}
      </div>
    </aside>
  );
}

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  children: ReactNode;
};

export function Heading2({ children, ...props }: HeadingProps) {
  const id = props.id ?? slugifyHeading(toPlainText(children));

  return (
    <h2 {...props} id={id} className="scroll-mt-24">
      {children}
    </h2>
  );
}

export function Heading3({ children, ...props }: HeadingProps) {
  const id = props.id ?? slugifyHeading(toPlainText(children));

  return (
    <h3 {...props} id={id} className="scroll-mt-24">
      {children}
    </h3>
  );
}

interface SourceNoteProps {
  title: string;
  url: string;
  publisher: string;
  licenseNote: string;
}

export function SourceNote({
  title,
  url,
  publisher,
  licenseNote,
}: SourceNoteProps) {
  assertRequired("SourceNote", { title, url, publisher, licenseNote });
  const safeUrl = assertHttpsUrl("SourceNote", "url", url);

  return (
    <p className="my-4 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs leading-6 text-[var(--text-muted)]">
      参照:{" "}
      <a
        href={safeUrl}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-[var(--link)] hover:text-[var(--primary-hover)]"
      >
        {title}
      </a>{" "}
      / {publisher} / {licenseNote}
    </p>
  );
}

type SafeLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export function SafeLink({ href, children, className }: SafeLinkProps) {
  if (isInternalHref(href)) {
    return (
      <Link
        href={href}
        prefetch={false}
        className={
          className ??
          "font-medium text-[var(--link)] hover:text-[var(--primary-hover)]"
        }
      >
        {children}
      </Link>
    );
  }

  const safeHref = assertHttpsUrl("SafeLink", "href", href);
  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noreferrer"
      className={
        className ??
        "font-medium text-[var(--link)] hover:text-[var(--primary-hover)]"
      }
    >
      {children}
    </a>
  );
}

type SafeImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt"
> & {
  src: string;
  alt: string;
};

export function SafeImage({ src, alt, ...props }: SafeImageProps) {
  assertRequired("SafeImage", { src, alt });
  const safeSrc = assertSafeAssetUrl("SafeImage", "src", src);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={safeSrc}
      alt={alt}
      loading={props.loading ?? "lazy"}
      decoding={props.decoding ?? "async"}
    />
  );
}

interface QuotedFigureProps {
  src: string;
  alt: string;
  sourceTitle: string;
  sourceUrl: string;
  licenseNote: string;
  width?: number;
  height?: number;
  children?: ReactNode;
}

export function QuotedFigure({
  src,
  alt,
  sourceTitle,
  sourceUrl,
  licenseNote,
  width,
  height,
  children,
}: QuotedFigureProps) {
  const imageMeta = getLearningImageMeta(src);
  const resolvedSourceTitle = imageMeta?.sourceTitle ?? sourceTitle;
  const resolvedSourceUrl = imageMeta?.sourceUrl ?? sourceUrl;
  const resolvedLicenseNote = imageMeta
    ? `${imageMeta.licenseName} / ${imageMeta.publisher}`
    : licenseNote;

  assertRequired("QuotedFigure", {
    src,
    alt,
    sourceTitle: resolvedSourceTitle,
    sourceUrl: resolvedSourceUrl,
    licenseNote: resolvedLicenseNote,
  });
  const safeSrc = assertSafeAssetUrl("QuotedFigure", "src", src);
  const safeSourceUrl = assertHttpsUrl(
    "QuotedFigure",
    "sourceUrl",
    resolvedSourceUrl
  );
  const safeLicenseUrl = imageMeta
    ? assertHttpsUrl("QuotedFigure", "licenseUrl", imageMeta.licenseUrl)
    : undefined;

  return (
    <figure className="my-8 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={safeSrc}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className="max-h-[520px] w-full bg-[var(--surface)] object-contain p-4"
      />
      <figcaption className="border-t border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-xs leading-6 text-[var(--text-muted)]">
        {children && (
          <span className="block text-[var(--foreground)]">{children}</span>
        )}
        <span>
          出典:{" "}
          <a
            href={safeSourceUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--link)] hover:text-[var(--primary-hover)]"
          >
            {resolvedSourceTitle}
          </a>{" "}
          / {resolvedLicenseNote}
        </span>
        {imageMeta && safeLicenseUrl && (
          <span className="block">
            ライセンス:{" "}
            <a
              href={safeLicenseUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--link)] hover:text-[var(--primary-hover)]"
            >
              {imageMeta.licenseName}
            </a>
          </span>
        )}
        {imageMeta && (
          <span className="block">
            {imageMeta.kind === "adapted" ? "加工引用" : "引用"}:{" "}
            {imageMeta.modificationNote} 参照日: {imageMeta.accessedAt}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

interface NextStepProps {
  href: string;
  title: string;
  children: ReactNode;
}

export function NextStep({ href, title, children }: NextStepProps) {
  const safeHref = assertInternalHref("NextStep", href);

  return (
    <div className="my-8 rounded-md border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-xs font-semibold uppercase text-[var(--text-muted)]">
        次に読む
      </p>
      <Link
        href={safeHref}
        prefetch={false}
        className="mt-1 block text-base font-semibold text-[var(--foreground)] hover:text-[var(--link)]"
      >
        {title}
      </Link>
      <div className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
        {children}
      </div>
    </div>
  );
}

interface ExerciseLinkProps {
  href: string;
  children: ReactNode;
}

export function ExerciseLink({ href, children }: ExerciseLinkProps) {
  const safeHref = assertInternalHref("ExerciseLink", href);

  return (
    <Link
      href={safeHref}
      prefetch={false}
      className="my-6 block rounded-md bg-[var(--primary)] px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
    >
      {children}
    </Link>
  );
}

function assertRequired(component: string, props: Record<string, string>) {
  for (const [key, value] of Object.entries(props)) {
    if (!value || value.trim() === "") {
      throw new Error(`${component} requires ${key}`);
    }
  }
}

function assertHttpsUrl(component: string, prop: string, value: string) {
  try {
    const url = new URL(value);
    if (url.protocol === "https:") return value;
  } catch {
    // handled below
  }

  throw new Error(`${component} requires ${prop} to be an https URL`);
}

function assertInternalHref(component: string, value: string) {
  if (isInternalHref(value)) return value;
  throw new Error(`${component} requires an internal href`);
}

function assertSafeAssetUrl(component: string, prop: string, value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return assertHttpsUrl(component, prop, value);
}

function isInternalHref(value: string) {
  return value.startsWith("/") && !value.startsWith("//");
}

function toPlainText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(toPlainText).join("");
  }

  if (node && typeof node === "object" && "props" in node) {
    const props = node.props as { children?: ReactNode };
    return toPlainText(props.children);
  }

  return "";
}
