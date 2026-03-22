import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import {
  CheckIcon,
  ChevronDownIcon,
  Loader2Icon,
  SearchIcon,
} from "lucide-react";
import debounce from "lodash.debounce";
import { cn } from "../lib/cn";
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
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const initialValueApplied = useRef(false);

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

  const optionsEnabled = fetchOnOpen ? hasBeenOpened : true;

  const optionsQuery = useInfiniteQuery({
    queryKey: ["rq-select", queryKey, ...deps, debouncedSearch],
    queryFn: ({ pageParam }) =>
      fetcher({ search: debouncedSearch, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    enabled: optionsEnabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const shouldFetchInitialValue =
    !!initialValueId && !!initialValueFetcher && !value;
  const initialValueQuery = useQuery({
    queryKey: ["rq-select-initial", queryKey, initialValueId],
    queryFn: () => initialValueFetcher!(initialValueId!),
    enabled: shouldFetchInitialValue,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const { hasNextPage, fetchNextPage } = optionsQuery;

  const pages = optionsQuery.data?.pages;

  const options = useMemo(() => {
    if (!pages) return [];
    return pages.flatMap((page) => page.options).filter((opt) => !opt.hidden);
  }, [pages]);

  useEffect(() => {
    if (!sentinelNode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !optionsQuery.isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelNode);
    return () => observer.disconnect();
  }, [
    sentinelNode,
    hasNextPage,
    fetchNextPage,
    optionsQuery.isFetchingNextPage,
  ]);

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
      if (nextOpen && !hasBeenOpened) setHasBeenOpened(true);
      setOpen(nextOpen);
      if (!nextOpen) {
        setSearch("");
        debouncedSetSearch("");
      }
    },
    [disabled, readOnly, hasBeenOpened, debouncedSetSearch],
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
        data-slot="rqs-item"
        data-disabled={option.disabled || undefined}
        aria-selected={isSelected}
        aria-disabled={option.disabled}
        className={classNames?.item}
        onClick={() => handleSelect(option)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelect(option);
          }
        }}
        tabIndex={option.disabled ? -1 : 0}
      >
        {option.label}
        {isSelected && (
          <span data-slot="rqs-item-indicator" className={classNames?.itemIndicator}>
            <CheckIcon data-slot="rqs-item-check-icon" className={classNames?.itemCheckIcon} />
          </span>
        )}
      </div>
    );
  };

  const sentinel = optionsQuery.hasNextPage && (
    <>
      <div
        ref={setSentinelNode}
        aria-hidden
        style={{ height: 1, flexShrink: 0 }}
      />
      <div data-slot="rqs-message" className={classNames?.message}>
        <Loader2Icon data-slot="rqs-spinner" className={classNames?.spinner} />
      </div>
    </>
  );

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <button
          type="button"
          data-slot="rqs-trigger"
          data-placeholder={!value ? "" : undefined}
          className={cn(classNames?.trigger, className)}
          disabled={disabled}
          aria-expanded={open}
        >
          <span data-slot="rqs-trigger-value" className={classNames?.triggerValue}>
            {value?.label ?? placeholder}
          </span>
          {isInitialLoading ||
          initialValueQuery.isLoading ||
          optionsQuery.isFetching ? (
            <Loader2Icon
              data-slot="rqs-spinner"
              className={cn(classNames?.spinner, classNames?.triggerIcon)}
            />
          ) : (
            <ChevronDownIcon
              data-slot="rqs-trigger-icon"
              className={classNames?.triggerIcon}
            />
          )}
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-slot="rqs-content"
          className={classNames?.content}
          side="bottom"
          sideOffset={4}
          collisionPadding={8}
          hideWhenDetached
          align="start"
          style={{
            width: "var(--radix-popover-trigger-width)",
            minWidth: "var(--radix-popover-trigger-width)",
          }}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            searchInputRef.current?.focus();
          }}
        >
          {searchable && (
            <div data-slot="rqs-search-wrapper" className={classNames?.searchWrapper}>
              <SearchIcon data-slot="rqs-search-icon" className={classNames?.searchIcon} />
              <input
                ref={searchInputRef}
                type="text"
                data-slot="rqs-search-input"
                className={classNames?.searchInput}
                placeholder={searchPlaceholder}
                value={search}
                onChange={handleSearchChange}
                aria-label={searchPlaceholder}
              />
            </div>
          )}

          <ScrollAreaPrimitive.Root
            type="always"
            data-slot="rqs-scroll-area"
            className={cn("relative flex flex-col flex-1 overflow-hidden", classNames?.scrollArea)}
          >
            <ScrollAreaPrimitive.Viewport
              className={cn(
                "size-full rounded-[inherit]",
                classNames?.scrollAreaViewport,
              )}
            >
              <div
                role="listbox"
                aria-label="Options"
                data-slot="rqs-list"
                className={classNames?.list}
              >
                {isInitialLoading && (
                  <div data-slot="rqs-message" className={classNames?.message}>
                    <Loader2Icon
                      data-slot="rqs-spinner"
                      className={classNames?.spinner}
                    />
                    {loadingMessage}
                  </div>
                )}

                {showError && (
                  <div data-slot="rqs-message" className={classNames?.message}>
                    {errorMessage}
                  </div>
                )}

                {showEmpty && (
                  <div data-slot="rqs-message" className={classNames?.message}>
                    {emptyMessage}
                  </div>
                )}

                {showItems && options.map((option) => renderItem(option))}

                {showItems && sentinel}
              </div>
            </ScrollAreaPrimitive.Viewport>
            <ScrollAreaPrimitive.Scrollbar
              orientation="vertical"
              className={cn(
                "flex touch-none p-px transition-colors select-none h-full w-2.5 border-l border-l-transparent",
                classNames?.scrollAreaScrollbar,
              )}
            >
              <ScrollAreaPrimitive.Thumb
                className={cn(
                  "bg-foreground/40 relative flex-1 rounded-full",
                  classNames?.scrollAreaThumb,
                )}
              />
            </ScrollAreaPrimitive.Scrollbar>
            <ScrollAreaPrimitive.Corner />
          </ScrollAreaPrimitive.Root>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export { RQSelect };
