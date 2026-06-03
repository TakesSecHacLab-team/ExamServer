"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  children: string;
  className?: string;
}

export default function MarkdownContent({ children, className = "" }: Props) {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre({ children }) {
            return (
              <pre className="overflow-x-auto rounded-md border border-gray-200 bg-gray-950 p-4 text-[13px] leading-6 text-gray-100">
                {children}
              </pre>
            );
          },
          code({ className, children, ...props }) {
            return (
              <code
                className={`${className ?? ""} whitespace-pre font-mono`}
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
