# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

rc-query-select (`RQSelect`) is a React select/combobox component that uses React Query to fetch its options. It supports server-side search, infinite scrolling (via IntersectionObserver), initial value resolution by ID, and debounced search input. Built on Radix UI Popover primitives.

## Commands

- `pnpm dev` — start Vite dev server on port 5173
- `pnpm build` — typecheck with `tsc -b` then build with Vite
- `pnpm lint` — run ESLint
- `pnpm preview` — preview production build

## Architecture

The core component lives in `src/components/`:

- **`rq-select.tsx`** — main `RQSelect` component. Uses `useInfiniteQuery` for paginated option fetching and `useQuery` for resolving an initial value by ID. Dropdown is a Radix Popover. Infinite scroll uses a sentinel div observed via IntersectionObserver.
- **`types.ts`** — all public types (`RQSelectOption`, `RQSelectFetcherResult`, `RQSelectProps`, `RQSelectClassNames`). The `fetcher` prop receives `{ search, page }` and returns `{ options, hasMore }`.
- **`index.ts`** — public barrel export for the component and types.

Styling uses Tailwind CSS v4 (via `@tailwindcss/vite` plugin) alongside a component-specific CSS file (`rq-select.css`). CSS custom properties are defined in `src/variables.css`. All class names use the `rqs-` prefix and can be overridden via the `classNames` prop. The `cn` utility (`src/lib/cn.ts`) merges classes with `clsx` + `tailwind-merge`.

`App.tsx` is a demo/playground with a fake async fetcher — not part of the component library itself.
