import { useState, useMemo } from "react";
import { CodeXmlIcon } from "lucide-react";
import hljs from "highlight.js/lib/core";
import tsx from "highlight.js/lib/languages/typescript";
import "../highlight.css";

hljs.registerLanguage("tsx", tsx);

export function DemoSection({
  id,
  title,
  description,
  code,
  children,
}: {
  id?: string;
  title: string;
  description: string;
  code: string;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);
  const collapsedHeight = 96;
  const highlightedCode = useMemo(
    () => hljs.highlight(code, { language: "tsx" }).value,
    [code],
  );

  const codeCallbackRef = (node: HTMLDivElement | null) => {
    if (node) {
      setFullHeight(node.scrollHeight);
    }
  };

  return (
    <section id={id} className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-foreground-muted mt-0.5">{description}</p>
      </div>
      <div className="rounded-lg border border-border">
        <div className="p-4 h-52 flex items-center justify-center">
          {children}
        </div>
        <div className="border-t border-border relative bg-background-muted/50">
          <div
            ref={codeCallbackRef}
            className="overflow-hidden transition-[max-height] duration-300"
            style={{
              maxHeight: expanded ? fullHeight : collapsedHeight,
            }}
          >
            <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto">
              <code
                className="hljs"
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            </pre>
          </div>
          {!expanded && (
            <div className="absolute inset-0 bg-linear-to-t from-background from-10% to-transparent" />
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <CodeXmlIcon className="size-3.5" />
            {expanded ? "Collapse" : "View Code"}
          </button>
        </div>
      </div>
    </section>
  );
}
