const styleSlots: [string, string, string][] = [
  ["trigger", "rqs-trigger", "Trigger button"],
  ["triggerValue", "rqs-trigger-value", "Value display area"],
  ["triggerIcon", "rqs-trigger-icon", "Chevron icon"],
  ["placeholder", "rqs-placeholder", "Placeholder text"],
  ["clear", "rqs-clear", "Clear button"],
  ["pill", "rqs-pill", "Multi-select pill"],
  ["pillRemove", "rqs-pill-remove", "Pill remove button"],
  ["content", "rqs-content", "Popover content"],
  ["searchWrapper", "rqs-search-wrapper", "Search input wrapper"],
  ["searchIcon", "rqs-search-icon", "Search icon"],
  ["searchInput", "rqs-search-input", "Search input"],
  ["scrollArea", "rqs-scroll-area", "Scroll area root"],
  ["list", "rqs-list", "Options listbox"],
  ["item", "rqs-item", "Option item"],
  ["itemIndicator", "rqs-item-indicator", "Selected indicator wrapper"],
  ["itemCheckIcon", "rqs-item-check-icon", "Check icon"],
  ["message", "rqs-message", "Loading/empty/error message"],
  ["spinner", "rqs-spinner", "Loading spinner"],
];

export function StyleSlotsTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-background-muted/50">
            <th className="px-4 py-2.5 text-left font-medium text-foreground-muted">
              Slot
            </th>
            <th className="px-4 py-2.5 text-left font-medium text-foreground-muted">
              data-slot
            </th>
            <th className="px-4 py-2.5 text-left font-medium text-foreground-muted">
              Element
            </th>
          </tr>
        </thead>
        <tbody>
          {styleSlots.map(([slot, dataSlot, element]) => (
            <tr
              key={slot}
              className="border-b border-border last:border-b-0"
            >
              <td className="px-4 py-2 align-top">
                <code className="rounded bg-background-muted px-1.5 py-0.5 text-xs font-mono text-primary">
                  {slot}
                </code>
              </td>
              <td className="px-4 py-2 align-top">
                <code className="text-xs font-mono text-foreground-muted">
                  {dataSlot}
                </code>
              </td>
              <td className="px-4 py-2 align-top text-foreground-muted">
                {element}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
