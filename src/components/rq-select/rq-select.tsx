import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { CheckIcon, ChevronDownIcon, Loader2Icon, XIcon } from "lucide-react";
import { RemoveScroll } from "react-remove-scroll";
import debounce from "lodash.debounce";
import { cn } from "../../lib/cn";
import type {
  RQSelectMultipleProps,
  RQSelectOption,
  RQSelectProps,
  RQSelectSingleProps,
} from "./types";

const EMPTY_DEPS: unknown[] = [];

function RQSelect({
  multiple,
  value,
  onChange,
  queryKey,
  fetcher,
  optionFetcher,
  deps = EMPTY_DEPS,
  fetchOnOpen = true,
  searchable = true,
  searchDebounceMs = 300,
  searchPlaceholder = "Search...",
  placeholder = "Select...",
  disabled = false,
  readOnly = false,
  clearable = false,
  className,
  classNames,
  renderOption,
  loadingMessage = "Loading...",
  emptyMessage = "No options found",
  errorMessage = "Failed to load options",
}: RQSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [sentinelNode, setSentinelNode] = useState<HTMLDivElement | null>(null);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);

  const debouncedSetSearch = useMemo(
    () =>
      debounce((val: string) => {
        setDebouncedSearch(val);
        setFocusedIndex(-1);
      }, searchDebounceMs),
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
    placeholderData: keepPreviousData,
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

  const values = useMemo(
    () => (multiple ? (value ?? []) : value ? [value] : []),
    [multiple, value],
  );

  const hasValue = values.length > 0;

  const [selectedOptions, setSelectedOptions] = useState<RQSelectOption[]>([]);

  const valuesToResolve = useMemo(() => {
    if (!optionFetcher) return [];
    return values.filter(
      (v) =>
        !options.find((o) => o.value === v) &&
        !selectedOptions.find((o) => o.value === v),
    );
  }, [values, options, optionFetcher, selectedOptions]);

  const resolveQuery = useQuery({
    queryKey: ["rq-select-resolve", queryKey, ...valuesToResolve] as const,
    queryFn: async () => {
      if (multiple) {
        return optionFetcher!(valuesToResolve);
      }
      const option = await optionFetcher!(valuesToResolve[0]);
      return [option];
    },
    enabled: valuesToResolve.length > 0 && !!optionFetcher,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  // Sync selected options from query results — legitimate derived state sync
  useEffect(() => {
    const resolved = values
      .map(
        (v) =>
          options.find((o) => o.value === v) ??
          resolveQuery.data?.find((o) => o.value === v) ??
          selectedOptions.find((o) => o.value === v),
      )
      .filter((o): o is RQSelectOption => !!o);

    if (
      resolved.length !== selectedOptions.length ||
      resolved.some((o, i) => o.value !== selectedOptions[i]?.value)
    ) {
      setSelectedOptions(resolved); // eslint-disable-line  react-hooks/set-state-in-effect
    }
  }, [values, options, resolveQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const isResolvingOptions = resolveQuery.isLoading;

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

  const handleSelect = useCallback(
    (option: RQSelectOption) => {
      if (option.disabled) return;

      if (multiple) {
        const currentValues = (value as string[] | undefined) ?? [];
        const isDeselect = currentValues.includes(option.value);
        const newValues = isDeselect
          ? currentValues.filter((v) => v !== option.value)
          : [...currentValues, option.value];

        const newOptions = isDeselect
          ? selectedOptions.filter((o) => o.value !== option.value)
          : [...selectedOptions, option];

        (onChange as RQSelectMultipleProps["onChange"])?.(
          newValues,
          newOptions,
        );
        setSearch("");
        debouncedSetSearch("");
        searchInputRef.current?.focus();
      } else {
        const isDeselect = value === option.value;
        (onChange as RQSelectSingleProps["onChange"])?.(
          isDeselect ? undefined : option.value,
          isDeselect ? undefined : option,
        );
        setOpen(false);
        setSearch("");
        debouncedSetSearch("");
      }
    },
    [multiple, value, onChange, selectedOptions, debouncedSetSearch],
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent, optionValue: string) => {
      e.stopPropagation();
      if (!multiple) return;
      const currentValues = (value as string[] | undefined) ?? [];
      const newValues = currentValues.filter((v) => v !== optionValue);
      const newOptions = selectedOptions.filter((o) => o.value !== optionValue);
      (onChange as RQSelectMultipleProps["onChange"])?.(newValues, newOptions);
    },
    [multiple, value, onChange, selectedOptions],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (multiple) {
        (onChange as RQSelectMultipleProps["onChange"])?.([], []);
      } else {
        (onChange as RQSelectSingleProps["onChange"])?.(undefined, undefined);
      }
    },
    [multiple, onChange],
  );

  const isInitialLoading = optionsQuery.isLoading;
  const showError = optionsQuery.isError;
  const showEmpty = !isInitialLoading && !showError && options.length === 0;
  const showItems = !isInitialLoading && !showError && options.length > 0;

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (disabled || readOnly) return;
      if (nextOpen && !hasBeenOpened) setHasBeenOpened(true);
      setOpen(nextOpen);
      if (!nextOpen) {
        setSearch("");
        debouncedSetSearch("");
        setFocusedIndex(-1);
      }
    },
    [disabled, readOnly, hasBeenOpened, debouncedSetSearch],
  );

  const enabledIndices = useMemo(
    () =>
      options.reduce<number[]>((acc, opt, i) => {
        if (!opt.disabled) acc.push(i);
        return acc;
      }, []),
    [options],
  );

  const moveFocus = useCallback((index: number) => {
    setFocusedIndex(index);
    const items =
      listRef.current?.querySelectorAll<HTMLElement>("[role='option']");
    items?.[index]?.scrollIntoView({ block: "nearest" });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showItems || enabledIndices.length === 0) return;

      const pos = enabledIndices.indexOf(focusedIndex);

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          moveFocus(
            enabledIndices[
              pos < 0 ? 0 : Math.min(pos + 1, enabledIndices.length - 1)
            ],
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          moveFocus(enabledIndices[pos <= 0 ? 0 : pos - 1]);
          break;
        case "Home":
          e.preventDefault();
          moveFocus(enabledIndices[0]);
          break;
        case "End":
          e.preventDefault();
          moveFocus(enabledIndices[enabledIndices.length - 1]);
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < options.length) {
            handleSelect(options[focusedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          handleOpenChange(false);
          break;
      }
    },
    [
      showItems,
      enabledIndices,
      options,
      focusedIndex,
      moveFocus,
      handleSelect,
      handleOpenChange,
    ],
  );

  const isSelected = useCallback(
    (optionValue: string) =>
      multiple
        ? ((value as string[] | undefined) ?? []).includes(optionValue)
        : value === optionValue,
    [multiple, value],
  );

  const renderItem = (option: RQSelectOption, index: number) => {
    const selected = isSelected(option.value);
    const focused = index === focusedIndex;
    return (
      <div
        key={option.value}
        role="option"
        data-slot="rqs-item"
        id={`rqs-option-${option.value}`}
        data-disabled={option.disabled || undefined}
        data-focused={focused || undefined}
        aria-selected={selected}
        aria-disabled={option.disabled}
        className={classNames?.item}
        onClick={() => handleSelect(option)}
        onMouseEnter={() => setFocusedIndex(index)}
      >
        {renderOption ? (
          renderOption(option, { selected, focused })
        ) : (
          <>
            {option.label}
            {selected && (
              <span
                data-slot="rqs-item-indicator"
                className={classNames?.itemIndicator}
              >
                <CheckIcon
                  data-slot="rqs-item-check-icon"
                  className={classNames?.itemCheckIcon}
                />
              </span>
            )}
          </>
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

  const inputValue = searchable
    ? open
      ? search
      : !multiple
        ? (selectedOptions[0]?.label ?? "")
        : ""
    : "";

  const inputPlaceholder = searchable
    ? open
      ? searchPlaceholder
      : hasValue && !multiple
        ? undefined
        : placeholder
    : undefined;

  const handleInputFocus = useCallback(() => {
    if (!open && !disabled && !readOnly) {
      handleOpenChange(true);
    }
  }, [open, disabled, readOnly, handleOpenChange]);

  const triggerContent = (
    <>
      <span data-slot="rqs-trigger-value" className={classNames?.triggerValue}>
        {multiple &&
          selectedOptions.length > 0 &&
          selectedOptions.map((opt) => (
            <span
              key={opt.value}
              data-slot="rqs-pill"
              className={classNames?.pill}
            >
              {opt.label}
              <button
                type="button"
                data-slot="rqs-pill-remove"
                className={classNames?.pillRemove}
                onClick={(e) => handleRemove(e, opt.value)}
                aria-label={`Remove ${opt.label}`}
                tabIndex={-1}
              >
                <XIcon />
              </button>
            </span>
          ))}
        {searchable ? (
          <input
            ref={searchInputRef}
            type="text"
            data-slot="rqs-search-input"
            className={cn(
              classNames?.searchInput,
              multiple && !open && selectedOptions.length > 0 && "sr-only",
            )}
            placeholder={
              multiple && selectedOptions.length > 0
                ? undefined
                : inputPlaceholder
            }
            value={inputValue}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            disabled={disabled}
            readOnly={readOnly}
            aria-label={searchPlaceholder}
            aria-activedescendant={
              focusedIndex >= 0
                ? `rqs-option-${options[focusedIndex]?.value}`
                : undefined
            }
            aria-expanded={open}
            role="combobox"
            autoComplete="off"
          />
        ) : !multiple ? (
          selectedOptions[0]?.label || (
            <span
              data-slot="rqs-placeholder"
              className={classNames?.placeholder}
            >
              {placeholder}
            </span>
          )
        ) : !selectedOptions.length ? (
          <span data-slot="rqs-placeholder" className={classNames?.placeholder}>
            {placeholder}
          </span>
        ) : null}
      </span>
      {clearable && hasValue && !disabled && !readOnly && (
        <button
          type="button"
          data-slot="rqs-clear"
          className={classNames?.clear}
          onClick={handleClear}
          aria-label="Clear selection"
          tabIndex={-1}
        >
          <XIcon />
        </button>
      )}
      {isInitialLoading || isResolvingOptions || optionsQuery.isFetching ? (
        <Loader2Icon
          data-slot="rqs-spinner"
          className={cn(classNames?.spinner, classNames?.triggerIcon)}
        />
      ) : (
        <ChevronDownIcon
          data-slot="rqs-trigger-icon"
          className={classNames?.triggerIcon}
          onClick={
            searchable && open
              ? (e) => {
                  e.stopPropagation();
                  handleOpenChange(false);
                }
              : undefined
          }
        />
      )}
    </>
  );

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <button
          type="button"
          ref={triggerRef}
          data-slot="rqs-trigger"
          data-placeholder={!hasValue && !search ? "" : undefined}
          className={cn(classNames?.trigger, className)}
          disabled={disabled}
          aria-expanded={open}
          data-multiple={multiple}
          data-has-value={hasValue}
          onClick={
            searchable
              ? (e) => {
                  e.preventDefault();
                  if (readOnly) return;
                  if (!open) {
                    handleOpenChange(true);
                    searchInputRef.current?.focus();
                  }
                }
              : undefined
          }
        >
          {triggerContent}
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
            if (!searchable) {
              listRef.current?.focus();
            }
          }}
        >
          <RemoveScroll
            allowPinchZoom
            className="flex flex-col flex-1 overflow-hidden"
          >
            <ScrollAreaPrimitive.Root
              type="always"
              data-slot="rqs-scroll-area"
              className={cn(
                "relative flex flex-col flex-1 overflow-hidden",
                classNames?.scrollArea,
              )}
            >
              <ScrollAreaPrimitive.Viewport
                className={cn(
                  "size-full rounded-[inherit]",
                  classNames?.scrollAreaViewport,
                )}
              >
                <div
                  ref={listRef}
                  role="listbox"
                  aria-label="Options"
                  aria-multiselectable={multiple || undefined}
                  data-slot="rqs-list"
                  className={classNames?.list}
                  {...(!searchable && {
                    onKeyDown: handleKeyDown,
                    tabIndex: 0,
                  })}
                >
                  {isInitialLoading && (
                    <div
                      data-slot="rqs-message"
                      className={classNames?.message}
                    >
                      <Loader2Icon
                        data-slot="rqs-spinner"
                        className={cn(classNames?.spinner, "animate-spin")}
                      />
                      {loadingMessage}
                    </div>
                  )}

                  {showError && (
                    <div
                      data-slot="rqs-message"
                      className={classNames?.message}
                    >
                      {errorMessage}
                    </div>
                  )}

                  {showEmpty && (
                    <div
                      data-slot="rqs-message"
                      className={classNames?.message}
                    >
                      {emptyMessage}
                    </div>
                  )}

                  {showItems &&
                    options.map((option, i) => renderItem(option, i))}

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
          </RemoveScroll>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export { RQSelect };
