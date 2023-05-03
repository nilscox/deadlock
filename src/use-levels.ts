import { useCallback, useEffect, useState } from 'react';
import { levels as levelsData } from './game/levels';
import { toObject } from './game/utils';

type StoredLevel = {
  completed?: boolean;
  skipped?: boolean;
  tries?: number;
  time?: number;
};

export const useLevels = () => {
  const [levels, setLevels] = useState(() => {
    const stored: Record<string, StoredLevel | undefined> = JSON.parse(
      localStorage.getItem('levels') ?? '{}'
    );

    return toObject(
      Object.keys(levelsData),
      (key) => key,
      (key) => stored[key]
    );
  });

  useEffect(() => {
    localStorage.setItem('levels', JSON.stringify(levels));
  }, [levels]);

  const setCompleted = useCallback((id: string, tries: number, time: number) => {
    setLevels((levels) => ({
      ...levels,
      [id]: { completed: true, tries, time },
    }));
  }, []);

  const setSkipped = useCallback((id: string, tries: number, time: number) => {
    setLevels((levels) => ({
      ...levels,
      [id]: { skipped: true, tries, time },
    }));
  }, []);

  return {
    levels,
    setCompleted,
    setSkipped,
  };
};

const levelIds = Object.keys(levelsData);

export const getNextLevelId = (levelId: string) => {
  return levelIds[levelIds.indexOf(levelId) + 1];
};
