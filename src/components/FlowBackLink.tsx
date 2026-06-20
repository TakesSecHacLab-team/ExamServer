"use client";

import Link from "next/link";

interface Props {
  href: string;
  label: string;
}

export default function FlowBackLink({ href, label }: Props) {
  return (
    <div className="mb-5">
      <Link
        href={href}
        className="inline-flex min-h-10 items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        ← {label}
      </Link>
    </div>
  );
}
