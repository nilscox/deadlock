import { useMemo } from 'react';
import { useLocationProperty } from 'wouter/use-location';

const searchParams = () => window.location.search;

const useSearch = () => {
  return useLocationProperty(searchParams);
};

export const useSearchParams = () => {
  const search = useSearch();

  return useMemo(() => {
    return new URLSearchParams(search);
  }, [search]);
};

export const useSearchParam = (key: string) => {
  return useSearchParams().get(key);
};
