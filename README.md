# rc-query-select

A React select component that uses [React Query](https://tanstack.com/query) to fetch options asynchronously. Supports server-side search, infinite scrolling, multi-select, and initial value resolution by ID.

[Live Demo](https://maxwellolliver.github.io/react-query-select/)

## Features

- **Async data fetching** — provide a `fetcher` function, options are loaded via React Query
- **Server-side search** — debounced search input passes the query to your fetcher
- **Infinite scroll** — automatically fetches the next page when the user scrolls to the bottom
- **Multi-select** — select multiple values with removable pills
- **Value resolution** — resolve selected value(s) by ID via `optionFetcher`
- **Clearable** — optional clear button to reset the selection
- **Custom rendering** — full control over option rendering via `renderOption`
- **Keyboard navigation** — arrow keys, Home/End, Enter, Escape
- **Fully styleable** — zero default styles, override any part via `classNames` prop or `data-slot` attributes

## Usage

```tsx
import { useState } from "react";
import { RQSelect } from "rc-query-select";

function UserSelect() {
  const [value, setValue] = useState<string>();

  return (
    <RQSelect
      queryKey="users"
      value={value}
      onChange={(val) => setValue(val)}
      fetcher={async ({ search, page }) => {
        const data = await api.getUsers({ search, page });
        return {
          options: data.results.map((u) => ({
            label: u.name,
            value: String(u.id),
          })),
          hasMore: data.hasNext,
        };
      }}
      optionFetcher={async (id) => {
        const user = await api.getUser(id);
        return { label: user.name, value: String(user.id) };
      }}
      placeholder="Select a user..."
    />
  );
}
```

The `fetcher` receives `{ search: string; page: number }` and must return `{ options: RQSelectOption[]; hasMore: boolean }`.

## Props

The component uses a discriminated union on `multiple` — `value`, `onChange`, and `optionFetcher` signatures adapt automatically.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `queryKey` | `string` | — | Unique key for React Query caching |
| `fetcher` | `({ search, page }) => Promise<{ options, hasMore }>` | — | Async function to load options |
| `optionFetcher` | `(id) => Promise<Option>` / `(ids) => Promise<Option[]>` | — | Resolves value(s) to full option objects |
| `value` | `string` / `string[]` | — | Controlled value (adapts to `multiple` mode) |
| `onChange` | `(value, option) => void` | — | Called when selection changes |
| `multiple` | `boolean` | `false` | Enable multi-select mode |
| `deps` | `unknown[]` | `[]` | Extra dependencies that trigger a refetch |
| `fetchOnOpen` | `boolean` | `true` | Delay fetching until the dropdown opens |
| `searchable` | `boolean` | `true` | Show the search input |
| `searchDebounceMs` | `number` | `300` | Debounce delay for search |
| `searchPlaceholder` | `string` | `"Search..."` | Placeholder for the search input |
| `placeholder` | `string` | `"Select..."` | Trigger placeholder text |
| `disabled` | `boolean` | `false` | Disable the select |
| `readOnly` | `boolean` | `false` | Prevent opening while keeping visual state |
| `clearable` | `boolean` | `false` | Show a clear button when a value is selected |
| `renderOption` | `(option, { selected, focused }) => ReactNode` | — | Custom render function for options |
| `className` | `string` | — | Class for the trigger button |
| `classNames` | `RQSelectClassNames` | — | Override classes for individual parts |
| `loadingMessage` | `string` | `"Loading..."` | Message shown while fetching |
| `emptyMessage` | `string` | `"No options found"` | Message shown when no results |
| `errorMessage` | `string` | `"Failed to load options"` | Message shown on fetch error |

## Styling

The component ships with zero default styles. Every element exposes a `data-slot` attribute and accepts a class via the `classNames` prop:

```tsx
<RQSelect
  classNames={{
    trigger: "my-trigger",
    content: "my-dropdown",
    item: "my-item",
  }}
  // ...
/>
```

Available slots: `trigger`, `triggerValue`, `triggerIcon`, `placeholder`, `clear`, `pill`, `pillRemove`, `content`, `searchWrapper`, `searchIcon`, `searchInput`, `scrollArea`, `list`, `item`, `itemIndicator`, `itemCheckIcon`, `message`, `spinner`.

## Development

```sh
pnpm install
pnpm dev       # start dev server on :5173
pnpm build     # typecheck + build
pnpm lint      # eslint
```
