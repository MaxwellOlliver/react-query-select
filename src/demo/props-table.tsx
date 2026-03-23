type PropRow = {
  name: string;
  type: string;
  default: string;
  description: string;
};

export const baseProps: PropRow[] = [
  {
    name: "queryKey",
    type: "string",
    default: "—",
    description:
      "Unique key for React Query caching. Each select instance should have its own key.",
  },
  {
    name: "fetcher",
    type: "({ search, page }) => Promise<{ options, hasMore }>",
    default: "—",
    description:
      "Async function that fetches options. Receives the current search term and page number for infinite scrolling.",
  },
  {
    name: "optionFetcher",
    type: "(value) => Promise<Option> | (values) => Promise<Option[]>",
    default: "undefined",
    description:
      "Resolves initial value(s) to full option objects when they aren't in the fetched list yet. Signature changes based on multiple mode.",
  },
  {
    name: "value",
    type: "string | string[]",
    default: "undefined",
    description:
      "Controlled value. A single string in single mode, an array of strings in multi mode.",
  },
  {
    name: "onChange",
    type: "(value, option) => void",
    default: "undefined",
    description:
      "Called when the selection changes. Receives both the value(s) and the resolved option object(s).",
  },
  {
    name: "multiple",
    type: "boolean",
    default: "false",
    description:
      "Enables multi-select mode. Changes value/onChange signatures and renders pills in the trigger.",
  },
  {
    name: "deps",
    type: "unknown[]",
    default: "[]",
    description:
      "Additional dependencies for the query key. When these change, the options list refetches.",
  },
  {
    name: "fetchOnOpen",
    type: "boolean",
    default: "true",
    description:
      "When true, delays fetching until the popover is first opened. Set to false to prefetch on mount.",
  },
  {
    name: "searchable",
    type: "boolean",
    default: "true",
    description:
      "Shows a search input inside the popover. When false, the listbox receives keyboard focus directly.",
  },
  {
    name: "searchDebounceMs",
    type: "number",
    default: "300",
    description:
      "Debounce delay in milliseconds before the search term triggers a new fetch.",
  },
  {
    name: "searchPlaceholder",
    type: "string",
    default: '"Search..."',
    description: "Placeholder text for the search input.",
  },
  {
    name: "placeholder",
    type: "string",
    default: '"Select..."',
    description:
      "Placeholder text shown in the trigger when no value is selected.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Disables the select. Prevents opening and interaction.",
  },
  {
    name: "readOnly",
    type: "boolean",
    default: "false",
    description:
      "Prevents opening the popover while keeping the trigger visually enabled.",
  },
  {
    name: "clearable",
    type: "boolean",
    default: "false",
    description:
      "Shows a clear button in the trigger when a value is selected.",
  },
  {
    name: "renderOption",
    type: "(option, { selected, focused }) => ReactNode",
    default: "undefined",
    description:
      "Custom render function for each option item. Replaces the default label + check icon content.",
  },
  {
    name: "className",
    type: "string",
    default: "undefined",
    description: "Additional class name applied to the trigger button.",
  },
  {
    name: "classNames",
    type: "RQSelectClassNames",
    default: "undefined",
    description:
      "Object mapping each internal element slot to a CSS class name. This is the primary styling mechanism.",
  },
  {
    name: "loadingMessage",
    type: "string",
    default: '"Loading..."',
    description: "Message shown while options are being fetched.",
  },
  {
    name: "emptyMessage",
    type: "string",
    default: '"No options found"',
    description: "Message shown when the fetcher returns zero options.",
  },
  {
    name: "errorMessage",
    type: "string",
    default: '"Failed to load options"',
    description: "Message shown when the fetcher throws an error.",
  },
];

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="rounded-lg border border-border divide-y divide-border">
      {rows.map((row) => (
        <div key={row.name} className="px-4 py-3 flex flex-col gap-1.5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <code className="rounded bg-background-muted px-1.5 py-0.5 text-xs font-mono text-primary font-medium">
              {row.name}
            </code>
            {row.default !== "—" && row.default !== "undefined" && (
              <span className="text-xs text-foreground-muted">
                default: <code className="font-mono">{row.default}</code>
              </span>
            )}
          </div>
          <code className="text-xs font-mono text-foreground-muted break-all">
            {row.type}
          </code>
          <p className="text-sm text-foreground-muted leading-relaxed">
            {row.description}
          </p>
        </div>
      ))}
    </div>
  );
}
