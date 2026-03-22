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
  spinner?: string;
};

export type RQSelectProps = {
  // Value
  value?: string;
  onChange?: (value: string | undefined, option: RQSelectOption | undefined) => void;

  // Data fetching
  queryKey: string;
  fetcher: (params: { search: string; page: number }) => Promise<RQSelectFetcherResult>;
  optionFetcher?: (value: string) => Promise<RQSelectOption>;
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
  className?: string;
  classNames?: RQSelectClassNames;

  // Messages
  loadingMessage?: string;
  emptyMessage?: string;
  errorMessage?: string;
};
