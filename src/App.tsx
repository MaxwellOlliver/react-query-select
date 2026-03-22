import { useState } from "react";
import { RQSelect } from "./components";
import type { RQSelectOption, RQSelectFetcherResult } from "./components";
import "./app.css";

type RickAndMortyResponse = {
  info: { count: number; pages: number; next: string | null; prev: string | null };
  results: { id: number; name: string; image: string; species: string; status: string }[];
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

  const res = await fetch(`https://rickandmortyapi.com/api/character?${params}`);
  if (res.status === 404) return { options: [], hasMore: false };
  const data: RickAndMortyResponse = await res.json();

  const options: RQSelectOption[] = data.results.map((c) => ({
    label: c.name,
    value: String(c.id),
    metadata: { image: c.image, species: c.species, status: c.status },
  }));

  return { options, hasMore: data.info.next !== null };
};

const rickAndMortyOptionFetcher = async (value: string): Promise<RQSelectOption> => {
  const res = await fetch(`https://rickandmortyapi.com/api/character/${value}`);
  const data = await res.json();
  return {
    label: data.name,
    value: String(data.id),
    metadata: { image: data.image, species: data.species, status: data.status },
  };
};

function App() {
  const [value, setValue] = useState<string | undefined>("1");
  const [selectedOption, setSelectedOption] = useState<RQSelectOption>();

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>RQ Select Demo</h2>
      <RQSelect
        queryKey="rick-and-morty"
        value={value}
        onChange={(val, option) => {
          setValue(val);
          setSelectedOption(option);
        }}
        fetcher={rickAndMortyFetcher}
        optionFetcher={rickAndMortyOptionFetcher}
        placeholder="Select a character..."
        searchPlaceholder="Search characters..."
        classNames={{
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
        }}
      />
      {selectedOption && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-border p-3">
          <img
            src={selectedOption.metadata?.image as string}
            alt={selectedOption.label}
            className="size-12 rounded-full object-cover"
          />
          <div className="text-sm">
            <p className="font-medium">{selectedOption.label}</p>
            <p className="text-foreground-muted">
              {selectedOption.metadata?.species as string} &middot; {selectedOption.metadata?.status as string}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
