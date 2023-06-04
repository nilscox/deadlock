import { toObject } from '@deadlock/game';
import { useCallback, useMemo } from 'react';
import { useLocationProperty } from 'wouter/use-location';

import { useNavigate } from './use-navigate';

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
  const value = useSearchParams().get(key);
  const navigate = useNavigate();

  const setSearchParam = useCallback(
    (value: string | undefined) => {
      const url = new URL(window.location.toString());

      if (value === undefined) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }

      navigate(url.toString(), { replace: true });
    },
    [key, navigate]
  );

  return [value ?? undefined, setSearchParam] as const;
};

export const toSearchParams = (params: Record<string, unknown>) => {
  return new URLSearchParams(
    toObject(
      Object.entries(params).filter((key, value) => value !== undefined),
      ([key]) => key,
      ([, value]) => (typeof value === 'object' ? JSON.stringify(value) : String(value))
    )
  ).toString();
};
