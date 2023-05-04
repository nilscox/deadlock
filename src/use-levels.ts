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
  const saveReport = useSaveReport();

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

  const setCompleted = useCallback(
    (levelId: string, tries: number, time: number) => {
      saveReport(levelId, true, tries, time);

      setLevels((levels) => ({
        ...levels,
        [levelId]: { completed: true, tries, time },
      }));
    },
    [saveReport]
  );

  const setSkipped = useCallback(
    (levelId: string, tries: number, time: number) => {
      saveReport(levelId, false, tries, time);

      setLevels((levels) => ({
        ...levels,
        [levelId]: { skipped: true, tries, time },
      }));
    },
    [saveReport]
  );

  return {
    levels,
    setCompleted,
    setSkipped,
  };
};

const serverUrl = import.meta.env.VITE_APP_SERVER_URL;

const useSaveReport = () => {
  return useCallback((levelId: string, completed: boolean, tries: number, time: number) => {
    if (!serverUrl) {
      return;
    }

    void fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ levelId, completed, time, tries }),
    });
  }, []);
};

const levelIds = Object.keys(levelsData);

export const getNextLevelId = (levelId: string) => {
  return levelIds[levelIds.indexOf(levelId) + 1];
};

export const getLevelNumber = (levelId: string) => {
  return levelIds.indexOf(levelId) + 1;
};
