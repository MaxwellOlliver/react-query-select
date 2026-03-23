const shortcuts: [string, string][] = [
  ["↓ / ↑", "Move focus through options"],
  ["Home / End", "Jump to first / last option"],
  ["Enter", "Select the focused option"],
  ["Escape", "Close the popover"],
];

export function KeyboardTable() {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
      {shortcuts.map(([key, desc]) => (
        <div key={key} className="contents">
          <div>
            <kbd className="rounded border border-border bg-background-muted px-1.5 py-0.5 text-xs font-mono">
              {key}
            </kbd>
          </div>
          <div className="text-foreground-muted">{desc}</div>
        </div>
      ))}
    </div>
  );
}
