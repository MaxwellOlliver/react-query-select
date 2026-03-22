import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import debounce from "lodash.debounce";
import { cn } from "../lib/cn";
import { ScrollArea } from "./scroll-area";
import { Spinner } from "./spinner";
import type { RQSelectOption, RQSelectProps } from "./types";

const EMPTY_DEPS: unknown[] = [];

function RQSelect({
  value,
  onChange,
  queryKey,
  fetcher,
  deps = EMPTY_DEPS,
  fetchOnOpen = true,
  initialValueId,
  initialValueFetcher,
  searchable = true,
  searchDebounceMs = 300,
  searchPlaceholder = "Search...",
  placeholder = "Select...",
  disabled = false,
  readOnly = false,
  className,
  classNames,
  loadingMessage = "Loading...",
  emptyMessage = "No options found",
  errorMessage = "Failed to load options",
}: RQSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [sentinelNode, setSentinelNode] = useState<HTMLDivElement | null>(null);
  const hasBeenOpened = useRef(false);
  const initialValueApplied = useRef(false);
  const isFetchingNextPageRef = useRef(false);

  const debouncedSetSearch = useMemo(
    () => debounce((val: string) => setDebouncedSearch(val), searchDebounceMs),
    [searchDebounceMs],
  );

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearch(val);
      debouncedSetSearch(val);
    },
    [debouncedSetSearch],
  );

  const optionsEnabled = fetchOnOpen ? hasBeenOpened.current : true;

  const optionsQuery = useInfiniteQuery({
    queryKey: ["rq-select", queryKey, ...deps, debouncedSearch],
    queryFn: ({ pageParam }) => fetcher({ search: debouncedSearch, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    enabled: optionsEnabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const shouldFetchInitialValue = !!initialValueId && !!initialValueFetcher && !value;
  const initialValueQuery = useQuery({
    queryKey: ["rq-select-initial", queryKey, initialValueId],
    queryFn: () => initialValueFetcher!(initialValueId!),
    enabled: shouldFetchInitialValue,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const { hasNextPage, fetchNextPage } = optionsQuery;
  isFetchingNextPageRef.current = optionsQuery.isFetchingNextPage;

  const options = useMemo(() => {
    if (!optionsQuery.data?.pages) return [];
    return optionsQuery.data.pages.flatMap(page => page.options).filter(opt => !opt.hidden);
  }, [optionsQuery.data?.pages]);

  useEffect(() => {
    if (!sentinelNode) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && !isFetchingNextPageRef.current) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelNode);
    return () => observer.disconnect();
  }, [sentinelNode, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (initialValueQuery.data && !initialValueApplied.current) {
      initialValueApplied.current = true;
      onChange?.(initialValueQuery.data);
    }
  }, [initialValueQuery.data, onChange]);

  const handleSelect = useCallback(
    (option: RQSelectOption) => {
      if (option.disabled) return;
      const isDeselect = value?.value === option.value;
      onChange?.(isDeselect ? undefined : option);
      setOpen(false);
      setSearch("");
      debouncedSetSearch("");
    },
    [value, onChange, debouncedSetSearch],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (disabled || readOnly) return;
      if (nextOpen) hasBeenOpened.current = true;
      setOpen(nextOpen);
      if (!nextOpen) {
        setSearch("");
        debouncedSetSearch("");
      }
    },
    [disabled, readOnly, debouncedSetSearch],
  );

  const isInitialLoading = optionsQuery.isLoading;
  const showError = optionsQuery.isError;
  const showEmpty = !isInitialLoading && !showError && options.length === 0;
  const showItems = !isInitialLoading && !showError && options.length > 0;

  const renderItem = (option: RQSelectOption) => {
    const isSelected = value?.value === option.value;
    return (
      <div
        key={option.value}
        role="option"
        data-disabled={option.disabled || undefined}
        aria-selected={isSelected}
        aria-disabled={option.disabled}
        className={cn("rqs-item", classNames?.item)}
        onClick={() => handleSelect(option)}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelect(option);
          }
        }}
        tabIndex={option.disabled ? -1 : 0}
      >
        {option.label}
        {isSelected && (
          <span className={cn("rqs-item__indicator", classNames?.itemIndicator)}>
            <CheckIcon className={cn("rqs-item__check-icon", classNames?.itemCheckIcon)} />
          </span>
        )}
      </div>
    );
  };

  const sentinel = optionsQuery.hasNextPage && (
    <>
      <div ref={setSentinelNode} aria-hidden style={{ height: 1, flexShrink: 0 }} />
      <div className={cn("rqs-message", classNames?.message)}>
        <Spinner className={cn("rqs-sentinel-spinner", classNames?.spinner)} />
      </div>
    </>
  );

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <button
          type="button"
          data-placeholder={!value ? "" : undefined}
          className={cn("rqs-trigger", classNames?.trigger, className)}
          disabled={disabled}
          aria-expanded={open}
        >
          <span className={cn("rqs-trigger__value", classNames?.triggerValue)}>
            {value?.label ?? placeholder}
          </span>
          {isInitialLoading || initialValueQuery.isLoading || optionsQuery.isFetching ? (
            <Spinner className={cn("rqs-trigger__icon", classNames?.triggerIcon)} />
          ) : (
            <ChevronDownIcon className={cn("rqs-trigger__icon", classNames?.triggerIcon)} />
          )}
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className={cn("rqs-content", classNames?.content)}
          side="bottom"
          sideOffset={4}
          collisionPadding={8}
          hideWhenDetached
          align="start"
          style={{
            width: "var(--radix-popover-trigger-width)",
            minWidth: "var(--radix-popover-trigger-width)",
          }}
          onOpenAutoFocus={e => {
            e.preventDefault();
            searchInputRef.current?.focus();
          }}
        >
          {searchable && (
            <div className={cn("rqs-search-wrapper", classNames?.searchWrapper)}>
              <SearchIcon className={cn("rqs-search__icon", classNames?.searchIcon)} />
              <input
                ref={searchInputRef}
                type="text"
                className={cn("rqs-search", classNames?.searchInput)}
                placeholder={searchPlaceholder}
                value={search}
                onChange={handleSearchChange}
                aria-label={searchPlaceholder}
              />
            </div>
          )}

          <ScrollArea type="always" className={cn("rqs-list", classNames?.list)}>
            <div role="listbox" aria-label="Options">
              {isInitialLoading && (
                <div className={cn("rqs-message", classNames?.message)}>
                  <Spinner className={cn("rqs-loading-spinner", classNames?.spinner)} />
                  {loadingMessage}
                </div>
              )}

              {showError && (
                <div className={cn("rqs-message", classNames?.message)}>{errorMessage}</div>
              )}

              {showEmpty && (
                <div className={cn("rqs-message", classNames?.message)}>{emptyMessage}</div>
              )}

              {showItems && options.map(option => renderItem(option))}

              {showItems && sentinel}
            </div>
          </ScrollArea>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export { RQSelect };
