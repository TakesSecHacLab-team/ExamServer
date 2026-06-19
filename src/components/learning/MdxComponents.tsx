import Link from "next/link";
import type { ReactNode } from "react";

interface CalloutProps {
  title?: string;
  children: ReactNode;
}

export function Callout({ title, children }: CalloutProps) {
  return (
    <aside className="my-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
      {title && (
        <p className="mb-1 text-sm font-semibold text-blue-900">{title}</p>
      )}
      <div className="text-sm leading-7 text-blue-950">{children}</div>
    </aside>
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
    <p className="my-4 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs leading-6 text-gray-600">
      参照:{" "}
      <a
        href={safeUrl}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-blue-700 hover:text-blue-900"
      >
        {title}
      </a>{" "}
      / {publisher} / {licenseNote}
    </p>
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
  assertRequired("QuotedFigure", {
    src,
    alt,
    sourceTitle,
    sourceUrl,
    licenseNote,
  });
  const safeSrc = assertSafeAssetUrl("QuotedFigure", "src", src);
  const safeSourceUrl = assertHttpsUrl("QuotedFigure", "sourceUrl", sourceUrl);

  return (
    <figure className="my-8 overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={safeSrc}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className="max-h-[520px] w-full bg-white object-contain p-4"
      />
      <figcaption className="border-t border-gray-100 bg-gray-50 px-4 py-3 text-xs leading-6 text-gray-600">
        {children && <span className="block text-gray-700">{children}</span>}
        <span>
          出典:{" "}
          <a
            href={safeSourceUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-blue-700 hover:text-blue-900"
          >
            {sourceTitle}
          </a>{" "}
          / {licenseNote}
        </span>
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
    <div className="my-8 rounded-lg border border-gray-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        次に読む
      </p>
      <Link
        href={safeHref}
        prefetch={false}
        className="mt-1 block text-base font-semibold text-gray-950 hover:text-blue-700"
      >
        {title}
      </Link>
      <div className="mt-2 text-sm leading-7 text-gray-600">{children}</div>
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
      className="my-6 block rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
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
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  throw new Error(`${component} requires an internal href`);
}

function assertSafeAssetUrl(component: string, prop: string, value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return assertHttpsUrl(component, prop, value);
}
