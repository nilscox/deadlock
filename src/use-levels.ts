import { useCallback, useEffect, useState } from 'react';
import { levels as levelsData } from './game/levels';

export const useLevels = () => {
  const [levels, setLevels] = useState(() => {
    const levels: Record<string, { completed: boolean }> = JSON.parse(localStorage.getItem('levels') ?? '{}');

    for (const id of Object.keys(levelsData)) {
      levels[id] ??= { completed: false };
    }

    return levels;
  });

  useEffect(() => {
    localStorage.setItem('levels', JSON.stringify(levels));
  }, [levels]);

  const setCompleted = useCallback((id: string) => {
    setLevels((levels) => ({
      ...levels,
      [id]: { completed: true },
    }));
  }, []);

  return [levels, setCompleted] as const;
};
