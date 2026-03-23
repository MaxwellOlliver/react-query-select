# rc-query-select

A React select component that uses [React Query](https://tanstack.com/query) to fetch options asynchronously. Supports server-side search, infinite scrolling, and initial value resolution by ID.

[Live Demo](https://maxwellolliver.github.io/react-query-select/)

## Features

- **Async data fetching** — provide a `fetcher` function, options are loaded via React Query
- **Server-side search** — debounced search input passes the query to your fetcher
- **Infinite scroll** — automatically fetches the next page when the user scrolls to the bottom
- **Initial value by ID** — resolve a selected value from just an ID (e.g. from a database) via `initialValueFetcher`
- **Fully styleable** — override any part via the `classNames` prop or target `rqs-*` CSS classes directly

## Usage

```tsx
import { RQSelect } from "./components";
import type { RQSelectOption } from "./components";

const [value, setValue] = useState<RQSelectOption | undefined>();

<RQSelect
  queryKey="users"
  value={value}
  onChange={setValue}
  fetcher={({ search, page }) =>
    fetch(`/api/users?q=${search}&page=${page}`).then(r => r.json())
  }
  placeholder="Select a user..."
/>
```

The `fetcher` receives `{ search: string; page: number }` and must return `{ options: RQSelectOption[]; hasMore: boolean }`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `RQSelectOption` | — | Currently selected option |
| `onChange` | `(option \| undefined) => void` | — | Called on select/deselect |
| `queryKey` | `string` | — | Unique key for the React Query cache |
| `fetcher` | `({ search, page }) => Promise<Result>` | — | Async function to load options |
| `deps` | `unknown[]` | `[]` | Extra dependencies that trigger a refetch |
| `fetchOnOpen` | `boolean` | `true` | Delay fetching until the dropdown opens |
| `initialValueId` | `string` | — | ID to resolve into a full option on mount |
| `initialValueFetcher` | `(id: string) => Promise<Option>` | — | Fetcher for resolving `initialValueId` |
| `searchable` | `boolean` | `true` | Show the search input |
| `searchDebounceMs` | `number` | `300` | Debounce delay for search |
| `placeholder` | `string` | `"Select..."` | Trigger placeholder text |
| `disabled` | `boolean` | `false` | Disable the select |
| `readOnly` | `boolean` | `false` | Make the select read-only |
| `className` | `string` | — | Class for the trigger button |
| `classNames` | `RQSelectClassNames` | — | Override classes for individual parts |

## Styling

The component uses CSS classes prefixed with `rqs-`. You can override any part using the `classNames` prop:

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

Available slots: `trigger`, `triggerIcon`, `triggerValue`, `content`, `searchWrapper`, `searchIcon`, `searchInput`, `list`, `message`, `item`, `itemIndicator`, `itemCheckIcon`, `spinner`.

## Development

```sh
pnpm install
pnpm dev       # start dev server on :5173
pnpm build     # typecheck + build
pnpm lint      # eslint
```
