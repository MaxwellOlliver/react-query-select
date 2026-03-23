import type { RQSelectOption, RQSelectFetcherResult } from "../components";

type RickAndMortyCharacter = {
  id: number;
  name: string;
  image: string;
  species: string;
  status: string;
};

type RickAndMortyResponse = {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: RickAndMortyCharacter[];
};

const toOption = (c: RickAndMortyCharacter): RQSelectOption => ({
  label: c.name,
  value: String(c.id),
  metadata: { image: c.image, species: c.species, status: c.status },
});

export const rickAndMortyFetcher = async ({
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

  return {
    options: data.results.map(toOption),
    hasMore: data.info.next !== null,
  };
};

export const rickAndMortyOptionFetcher = async (
  value: string,
): Promise<RQSelectOption> => {
  const res = await fetch(`https://rickandmortyapi.com/api/character/${value}`);
  const data = await res.json();
  return toOption(data);
};

export const rickAndMortyOptionsFetcher = async (
  values: string[],
): Promise<RQSelectOption[]> => {
  const res = await fetch(
    `https://rickandmortyapi.com/api/character/${values.join(",")}`,
  );
  const data = await res.json();
  const results = Array.isArray(data) ? data : [data];
  return results.map((c: RickAndMortyCharacter) => toOption(c));
};
