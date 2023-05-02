import { useRef, useCallback, useMemo } from 'react';

export const useStopwatch = () => {
  const startDate = useRef(new Date());

  const elapsed = useCallback(() => {
    const start = startDate.current.getTime();
    const end = new Date().getTime();
    const time = Math.floor(end - start);

    return time;
  }, []);

  const restart = useCallback(() => {
    startDate.current = new Date();
  }, []);

  return useMemo(
    () => ({
      elapsed,
      restart,
    }),
    [elapsed, restart]
  );
};
