import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { RQSelect } from "./components";
import type { RQSelectOption } from "./components";
import { DemoSection } from "./demo/demo-section";
import {
  useActiveSection,
  tocSectionIds,
  TocLink,
  TocSection,
} from "./demo/toc";
import { PropsTable, baseProps } from "./demo/props-table";
import { StyleSlotsTable } from "./demo/style-slots-table";
import { KeyboardTable } from "./demo/keyboard-table";
import { rqSelectClassNames } from "./demo/class-names";
import {
  rickAndMortyFetcher,
  rickAndMortyOptionFetcher,
  rickAndMortyOptionsFetcher,
} from "./demo/fetchers";
import "./app.css";
import "./highlight.css";

// ---------------------------------------------------------------------------
// Custom option renderer
// ---------------------------------------------------------------------------

const renderCharacterOption = (
  option: RQSelectOption,
  { selected }: { selected: boolean },
) => (
  <>
    <img
      src={option.metadata?.image as string}
      alt={option.label}
      className="size-6 rounded-full object-cover shrink-0"
    />
    <span className="flex-1 truncate">{option.label}</span>
    <span className="text-xs text-foreground-muted">
      {option.metadata?.species as string}
    </span>
    {selected && (
      <span className="rqs-item__indicator">
        <CheckIcon className="rqs-item__check-icon" />
      </span>
    )}
  </>
);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const dependencies = [
  "@tanstack/react-query",
  "@radix-ui/react-popover",
  "@radix-ui/react-scroll-area",
];

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

function App() {
  const activeId = useActiveSection(tocSectionIds);

  const [basicValue, setBasicValue] = useState<string | undefined>();

  const [multiValues, setMultiValues] = useState<string[]>([]);

  const [clearableValue, setClearableValue] = useState<string | undefined>("1");

  const [customValue, setCustomValue] = useState<string | undefined>();

  const [disabledValue] = useState<string | undefined>("1");

  const [noSearchValue, setNoSearchValue] = useState<string | undefined>();

  return (
    <div className="grid md:grid-cols-[1fr_160px] gap-10 pb-20 pt-4 items-start">
      {/* Main content */}
      <div className="flex flex-col gap-16 min-w-0">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">RQSelect</h1>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              v1.0
            </span>
          </div>
          <p className="text-sm text-foreground-muted leading-relaxed max-w-lg">
            A headless React select component that uses React Query to fetch its
            options. Server-side search, infinite scrolling, initial value
            resolution, multi-select with pills, and full keyboard navigation —
            all with zero default styles.
          </p>
          <div className="flex gap-2 mt-1 flex-wrap">
            {dependencies.map((d) => (
              <span
                key={d}
                className="rounded border border-border bg-background-muted px-2 py-0.5 text-xs font-mono text-foreground-muted text-nowrap"
              >
                {d}
              </span>
            ))}
          </div>
        </header>

        {/* Demos */}
        <div className="flex flex-col gap-10">
          <div>
            <h2
              id="examples"
              className="text-lg font-semibold tracking-tight mb-1"
            >
              Examples
            </h2>
            <p className="text-sm text-foreground-muted">
              Interactive demos using the Rick and Morty API.
            </p>
          </div>

          <DemoSection
            id="demo-basic"
            title="Basic"
            description="Single select with server-side search and infinite scroll."
            code={`<RQSelect
  queryKey="characters"
  value={value}
  onChange={(val) => setValue(val)}
  fetcher={async ({ search, page }) => {
    const data = await api.getCharacters({ search, page })
    return {
      options: data.results.map(toOption),
      hasMore: data.info.next !== null,
    }
  }}
  optionFetcher={async (id) => {
    const character = await api.getCharacter(id)
    return toOption(character)
  }}
  placeholder="Select a character..."
  searchPlaceholder="Search characters..."
/>`}
          >
            <RQSelect
              queryKey="demo-basic"
              value={basicValue}
              onChange={(val) => setBasicValue(val)}
              fetcher={rickAndMortyFetcher}
              optionFetcher={rickAndMortyOptionFetcher}
              placeholder="Select a character..."
              searchPlaceholder="Search characters..."
              classNames={rqSelectClassNames}
            />
          </DemoSection>

          <DemoSection
            id="demo-multi"
            title="Multi Select"
            description="Select multiple values. Selections render as removable pills in the trigger."
            code={`<RQSelect
  multiple
  queryKey="characters-multi"
  value={values}
  onChange={(vals) => setValues(vals)}
  fetcher={async ({ search, page }) => {
    const data = await api.getCharacters({ search, page })
    return {
      options: data.results.map(toOption),
      hasMore: data.info.next !== null,
    }
  }}
  optionFetcher={async (ids) => {
    const characters = await api.getCharacters(ids)
    return characters.map(toOption)
  }}
  placeholder="Select characters..."
  searchPlaceholder="Search characters..."
/>`}
          >
            <RQSelect
              multiple
              queryKey="demo-multi"
              value={multiValues}
              onChange={(vals) => setMultiValues(vals)}
              fetcher={rickAndMortyFetcher}
              optionFetcher={rickAndMortyOptionsFetcher}
              placeholder="Select characters..."
              searchPlaceholder="Search characters..."
              classNames={rqSelectClassNames}
            />
          </DemoSection>

          <DemoSection
            id="demo-clearable"
            title="Clearable"
            description="Shows an X button to reset the selection. The initial value is resolved via optionFetcher."
            code={`<RQSelect
  queryKey="characters-clearable"
  value={value}
  onChange={(val) => setValue(val)}
  fetcher={async ({ search, page }) => {
    const data = await api.getCharacters({ search, page })
    return {
      options: data.results.map(toOption),
      hasMore: data.info.next !== null,
    }
  }}
  optionFetcher={async (id) => {
    const character = await api.getCharacter(id)
    return toOption(character)
  }}
  placeholder="Select a character..."
  clearable
/>`}
          >
            <RQSelect
              queryKey="demo-clearable"
              value={clearableValue}
              onChange={(val) => setClearableValue(val)}
              fetcher={rickAndMortyFetcher}
              optionFetcher={rickAndMortyOptionFetcher}
              placeholder="Select a character..."
              searchPlaceholder="Search characters..."
              clearable
              classNames={rqSelectClassNames}
            />
          </DemoSection>

          <DemoSection
            id="demo-custom"
            title="Custom Option Rendering"
            description="Use renderOption to display rich content — avatars, metadata, custom indicators."
            code={`const renderOption = (option, { selected }) => (
  <>
    <img
      src={option.metadata?.image}
      alt={option.label}
      className="size-6 rounded-full"
    />
    <span className="flex-1 truncate">
      {option.label}
    </span>
    <span className="text-xs text-muted">
      {option.metadata?.species}
    </span>
    {selected && <CheckIcon className="size-4" />}
  </>
)

<RQSelect
  queryKey="characters-custom"
  value={value}
  onChange={(val) => setValue(val)}
  fetcher={async ({ search, page }) => {
    const data = await api.getCharacters({ search, page })
    return {
      options: data.results.map(toOption),
      hasMore: data.info.next !== null,
    }
  }}
  optionFetcher={async (id) => {
    const character = await api.getCharacter(id)
    return toOption(character)
  }}
  clearable
  renderOption={renderOption}
/>`}
          >
            <RQSelect
              queryKey="demo-custom"
              value={customValue}
              onChange={(val) => setCustomValue(val)}
              fetcher={rickAndMortyFetcher}
              optionFetcher={rickAndMortyOptionFetcher}
              placeholder="Select a character..."
              searchPlaceholder="Search characters..."
              clearable
              renderOption={renderCharacterOption}
              classNames={rqSelectClassNames}
            />
          </DemoSection>

          <DemoSection
            id="demo-disabled"
            title="Disabled"
            description="The select is non-interactive. The initial value is still resolved and displayed."
            code={`<RQSelect
  queryKey="characters-disabled"
  value="1"
  fetcher={async ({ search, page }) => {
    const data = await api.getCharacters({ search, page })
    return {
      options: data.results.map(toOption),
      hasMore: data.info.next !== null,
    }
  }}
  optionFetcher={async (id) => {
    const character = await api.getCharacter(id)
    return toOption(character)
  }}
  placeholder="Select a character..."
  disabled
/>`}
          >
            <RQSelect
              queryKey="demo-disabled"
              value={disabledValue}
              fetcher={rickAndMortyFetcher}
              optionFetcher={rickAndMortyOptionFetcher}
              placeholder="Select a character..."
              disabled
              classNames={rqSelectClassNames}
            />
          </DemoSection>

          <DemoSection
            id="demo-no-search"
            title="Non-searchable"
            description="Hides the search input. Keyboard navigation still works — the listbox receives focus directly."
            code={`<RQSelect
  queryKey="characters-no-search"
  value={value}
  onChange={(val) => setValue(val)}
  fetcher={async ({ search, page }) => {
    const data = await api.getCharacters({ search, page })
    return {
      options: data.results.map(toOption),
      hasMore: data.info.next !== null,
    }
  }}
  optionFetcher={async (id) => {
    const character = await api.getCharacter(id)
    return toOption(character)
  }}
  placeholder="Select a character..."
  searchable={false}
/>`}
          >
            <RQSelect
              queryKey="demo-no-search"
              value={noSearchValue}
              onChange={(val) => setNoSearchValue(val)}
              fetcher={rickAndMortyFetcher}
              optionFetcher={rickAndMortyOptionFetcher}
              placeholder="Select a character..."
              searchable={false}
              classNames={rqSelectClassNames}
            />
          </DemoSection>
        </div>

        {/* Keyboard shortcuts */}
        <section className="flex flex-col gap-3">
          <h2
            id="keyboard-navigation"
            className="text-lg font-semibold tracking-tight"
          >
            Keyboard Navigation
          </h2>
          <KeyboardTable />
        </section>

        {/* Props reference */}
        <section className="flex flex-col gap-4">
          <div>
            <h2
              id="api-reference"
              className="text-lg font-semibold tracking-tight"
            >
              API Reference
            </h2>
            <p className="text-sm text-foreground-muted mt-0.5">
              All available props. The component uses a discriminated union on{" "}
              <code className="rounded bg-background-muted px-1 py-0.5 text-xs font-mono text-primary">
                multiple
              </code>{" "}
              — value, onChange, and optionFetcher signatures adapt
              automatically.
            </p>
          </div>
          <PropsTable rows={baseProps} />
        </section>

        {/* classNames reference */}
        <section className="flex flex-col gap-4">
          <div>
            <h2
              id="style-slots"
              className="text-lg font-semibold tracking-tight"
            >
              Style Slots
            </h2>
            <p className="text-sm text-foreground-muted mt-0.5">
              Every element exposes a{" "}
              <code className="rounded bg-background-muted px-1 py-0.5 text-xs font-mono text-primary">
                data-slot
              </code>{" "}
              attribute and accepts a class via the{" "}
              <code className="rounded bg-background-muted px-1 py-0.5 text-xs font-mono text-primary">
                classNames
              </code>{" "}
              prop. The component ships with zero default visual styles.
            </p>
          </div>
          <StyleSlotsTable />
        </section>
      </div>

      {/* Sticky sidebar ToC */}
      <nav className="sticky top-6 flex-col gap-2.5 pt-1 hidden md:flex">
        <p className="text-xs font-medium text-foreground-muted">
          On this page
        </p>
        <TocSection
          href="#examples"
          label="Examples"
          activeId={activeId}
          sub={[
            ["#demo-basic", "Basic"],
            ["#demo-multi", "Multi Select"],
            ["#demo-clearable", "Clearable"],
            ["#demo-custom", "Custom Rendering"],
            ["#demo-disabled", "Disabled"],
            ["#demo-no-search", "Non-searchable"],
          ]}
        />
        <TocLink
          href="#keyboard-navigation"
          label="Keyboard Navigation"
          active={activeId === "keyboard-navigation"}
        />
        <TocLink
          href="#api-reference"
          label="API Reference"
          active={activeId === "api-reference"}
        />
        <TocLink
          href="#style-slots"
          label="Style Slots"
          active={activeId === "style-slots"}
        />
      </nav>
    </div>
  );
}

export default App;
