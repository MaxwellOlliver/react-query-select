import { useState } from "react";
import { RQSelect } from "./components";
import type { RQSelectOption, RQSelectFetcherResult } from "./components";
import "./app.css";

type RickAndMortyResponse = {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: {
    id: number;
    name: string;
    image: string;
    species: string;
    status: string;
  }[];
};

const rickAndMortyFetcher = async ({
  search,
  page,
}: {
  search: string;
  page: number;
}): Promise<RQSelectFetcherResult> => {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set("name", search);

  const res = await fetch(
    `https://rickandmortyapi.com/api/character?${params}`,
  );
  if (res.status === 404) return { options: [], hasMore: false };
  const data: RickAndMortyResponse = await res.json();

  const options: RQSelectOption[] = data.results.map((c) => ({
    label: c.name,
    value: String(c.id),
    metadata: { image: c.image, species: c.species, status: c.status },
  }));

  return { options, hasMore: data.info.next !== null };
};

const rickAndMortyOptionFetcher = async (
  value: string,
): Promise<RQSelectOption> => {
  const res = await fetch(`https://rickandmortyapi.com/api/character/${value}`);
  const data = await res.json();
  return {
    label: data.name,
    value: String(data.id),
    metadata: { image: data.image, species: data.species, status: data.status },
  };
};

const rickAndMortyOptionsFetcher = async (
  values: string[],
): Promise<RQSelectOption[]> => {
  const res = await fetch(
    `https://rickandmortyapi.com/api/character/${values.join(",")}`,
  );
  const data = await res.json();
  const results = Array.isArray(data) ? data : [data];
  return results.map(
    (c: {
      id: number;
      name: string;
      image: string;
      species: string;
      status: string;
    }) => ({
      label: c.name,
      value: String(c.id),
      metadata: { image: c.image, species: c.species, status: c.status },
    }),
  );
};

const rqSelectClassNames = {
  trigger: "rqs-trigger",
  triggerValue: "rqs-trigger__value",
  triggerIcon: "rqs-trigger__icon",
  spinner: "rqs-spinner",
  content: "rqs-content",
  searchWrapper: "rqs-search-wrapper",
  searchIcon: "rqs-search__icon",
  searchInput: "rqs-search",
  scrollArea: "rqs-scroll-area--padded",
  list: "rqs-list",
  message: "rqs-message",
  item: "rqs-item",
  itemIndicator: "rqs-item__indicator",
  itemCheckIcon: "rqs-item__check-icon",
  pill: "rqs-pill",
  pillRemove: "rqs-pill-remove",
} as const;

function App() {
  const [singleValue, setSingleValue] = useState<string | undefined>("1");
  const [singleOption, setSingleOption] = useState<RQSelectOption>();

  const [multiValues, setMultiValues] = useState<string[]>(["1", "2"]);
  const [multiOptions, setMultiOptions] = useState<RQSelectOption[]>([]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 style={{ marginBottom: 16 }}>Single Select</h2>
        <RQSelect
          queryKey="rick-and-morty-single"
          value={singleValue}
          onChange={(val, option) => {
            setSingleValue(val);
            setSingleOption(option);
          }}
          fetcher={rickAndMortyFetcher}
          optionFetcher={rickAndMortyOptionFetcher}
          placeholder="Select a character..."
          searchPlaceholder="Search characters..."
          classNames={rqSelectClassNames}
        />
        {singleOption && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-border p-3">
            <img
              src={singleOption.metadata?.image as string}
              alt={singleOption.label}
              className="size-12 rounded-full object-cover"
            />
            <div className="text-sm">
              <p className="font-medium">{singleOption.label}</p>
              <p className="text-foreground-muted">
                {singleOption.metadata?.species as string} &middot;{" "}
                {singleOption.metadata?.status as string}
              </p>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 style={{ marginBottom: 16 }}>Multi Select</h2>
        <RQSelect
          multiple
          queryKey="rick-and-morty-multi"
          value={multiValues}
          onChange={(vals, opts) => {
            setMultiValues(vals);
            setMultiOptions(opts);
          }}
          fetcher={rickAndMortyFetcher}
          optionFetcher={rickAndMortyOptionsFetcher}
          placeholder="Select characters..."
          searchPlaceholder="Search characters..."
          classNames={rqSelectClassNames}
        />
        {multiOptions.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {multiOptions.map((opt) => (
              <div
                key={opt.value}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <img
                  src={opt.metadata?.image as string}
                  alt={opt.label}
                  className="size-10 rounded-full object-cover"
                />
                <div className="text-sm">
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-foreground-muted">
                    {opt.metadata?.species as string} &middot;{" "}
                    {opt.metadata?.status as string}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
