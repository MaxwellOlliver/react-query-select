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
  list?: string;
  message?: string;
  item?: string;
  itemIndicator?: string;
  itemCheckIcon?: string;
  spinner?: string;
};

export type RQSelectProps = {
  // Value
  value?: RQSelectOption;
  onChange?: (option: RQSelectOption | undefined) => void;

  // Data fetching
  queryKey: string;
  fetcher: (params: { search: string; page: number }) => Promise<RQSelectFetcherResult>;
  deps?: unknown[];
  fetchOnOpen?: boolean;

  // Initial value loading (when only an ID is available, e.g. from database)
  initialValueId?: string;
  initialValueFetcher?: (id: string) => Promise<RQSelectOption>;

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
