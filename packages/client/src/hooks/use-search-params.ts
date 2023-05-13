import { useCallback, useMemo } from 'react';
import { useLocationProperty } from 'wouter/use-location';
import { useNavigate } from './use-navigate';
import { useLocation } from 'wouter';

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
  const [location] = useLocation();

  const setSearchParam = useCallback(
    (value: string | undefined) => {
      const url = new URL(location, window.location.origin);

      if (value === undefined) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }

      navigate(url.toString(), { replace: true });
    },
    [key, location, navigate]
  );

  return [value, setSearchParam] as const;
};
