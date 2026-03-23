import type React from "react";

export type RQSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
  hidden?: boolean;
};

export type RQSelectFetcherResult = {
  options: RQSelectOption[];
  hasMore: boolean;
};

export type RQSelectClassNames = {
  trigger?: string;
  triggerIcon?: string;
  triggerValue?: string;
  content?: string;
  searchWrapper?: string;
  searchIcon?: string;
  searchInput?: string;
  scrollArea?: string;
  scrollAreaViewport?: string;
  scrollAreaScrollbar?: string;
  scrollAreaThumb?: string;
  list?: string;
  message?: string;
  item?: string;
  itemIndicator?: string;
  itemCheckIcon?: string;
  pill?: string;
  pillRemove?: string;
  clear?: string;
  spinner?: string;
};

type RQSelectBaseProps = {
  // Data fetching
  queryKey: string;
  fetcher: (params: { search: string; page: number }) => Promise<RQSelectFetcherResult>;
  deps?: unknown[];
  fetchOnOpen?: boolean;

  // Search
  searchable?: boolean;
  searchDebounceMs?: number;
  searchPlaceholder?: string;

  // UI
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  className?: string;
  classNames?: RQSelectClassNames;

  // Rendering
  renderOption?: (option: RQSelectOption, state: { selected: boolean; focused: boolean }) => React.ReactNode;

  // Messages
  loadingMessage?: string;
  emptyMessage?: string;
  errorMessage?: string;
};

export type RQSelectSingleOptionFetcher = (value: string) => Promise<RQSelectOption>;
export type RQSelectMultipleOptionFetcher = (values: string[]) => Promise<RQSelectOption[]>;

export type RQSelectSingleProps = RQSelectBaseProps & {
  multiple?: false;
  value?: string;
  onChange?: (value: string | undefined, option: RQSelectOption | undefined) => void;
  optionFetcher?: RQSelectSingleOptionFetcher;
};

export type RQSelectMultipleProps = RQSelectBaseProps & {
  multiple: true;
  value?: string[];
  onChange?: (value: string[], options: RQSelectOption[]) => void;
  optionFetcher?: RQSelectMultipleOptionFetcher;
};

export type RQSelectProps = RQSelectSingleProps | RQSelectMultipleProps;
