import { useCallback, useEffect, useState } from 'react';
import { levels as levelsData } from './game/levels';

type StoredLevel = {
  completed?: {
    tries: number;
    time: number;
  };
};

export const useLevels = () => {
  const [levels, setLevels] = useState(() => {
    const levels: Record<string, StoredLevel> = JSON.parse(localStorage.getItem('levels') ?? '{}');

    for (const id of Object.keys(levelsData)) {
      levels[id] ??= {};
    }

    return levels;
  });

  useEffect(() => {
    localStorage.setItem('levels', JSON.stringify(levels));
  }, [levels]);

  const setCompleted = useCallback((id: string, tries: number, time: number) => {
    setLevels((levels) => ({
      ...levels,
      [id]: { completed: { tries, time } },
    }));
  }, []);

  return [levels, setCompleted] as const;
};

const levelIds = Object.keys(levelsData);

export const useNextLevelId = (levelId: string) => {
  return levelIds[levelIds.indexOf(levelId) + 1];
};
