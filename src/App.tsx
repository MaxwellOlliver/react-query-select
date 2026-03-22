import { useState } from "react";
import { RQSelect } from "./components";
import type { RQSelectOption, RQSelectFetcherResult } from "./components";

const fruits: RQSelectOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Grape", value: "grape" },
  { label: "Orange", value: "orange" },
  { label: "Mango", value: "mango" },
  { label: "Pineapple", value: "pineapple" },
  { label: "Strawberry", value: "strawberry" },
  { label: "Watermelon", value: "watermelon" },
  { label: "Kiwi", value: "kiwi" },
];

const fakeFetcher = async ({
  search,
}: {
  search: string;
  page: number;
}): Promise<RQSelectFetcherResult> => {
  await new Promise((r) => setTimeout(r, 500));
  const filtered = search
    ? fruits.filter((f) => f.label.toLowerCase().includes(search.toLowerCase()))
    : fruits;
  return { options: filtered, hasMore: false };
};

function App() {
  const [value, setValue] = useState<RQSelectOption | undefined>();

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>RQ Select Demo</h2>
      <RQSelect
        queryKey="fruits"
        value={value}
        onChange={setValue}
        fetcher={fakeFetcher}
        placeholder="Select a fruit..."
        searchPlaceholder="Search fruits..."
      />
      {value && (
        <p style={{ marginTop: 12, fontSize: 14 }}>
          Selected: {value.label}
        </p>
      )}
    </div>
  );
}

export default App;
