import { ReactNode } from "react";

export function CodeBlock({ children }: { children: ReactNode }) {
  return (
    <pre className="my-4 overflow-x-auto whitespace-pre border border-l-2 border-rule border-l-red-600 bg-paper p-5 font-mono text-[12.5px] leading-[1.7] text-ink-mute">
      {children}
    </pre>
  );
}

/** Inline syntax-coloring spans for use inside <CodeBlock>. */
export const Code = {
  comment: ({ children }: { children: ReactNode }) => (
    <span className="text-ink-faint">{children}</span>
  ),
  keyword: ({ children }: { children: ReactNode }) => (
    <span className="text-red-600">{children}</span>
  ),
  string: ({ children }: { children: ReactNode }) => (
    <span className="text-amber">{children}</span>
  ),
};
