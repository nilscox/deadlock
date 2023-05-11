import { LevelDefinition, identity, toObject, assert, Level } from '@deadlock/game';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useConfig } from '../hooks/use-config';

/* eslint-disable react-refresh/only-export-components */

type StoredLevel = {
  completed: boolean;
  tries: number;
  time: number;
};

type LevelsContext = {
  levels: Record<string, LevelDefinition>;
  storedLevels: Record<string, StoredLevel | undefined>;
  storeLevelResult: (levelId: string, result: StoredLevel) => void;
};

const levelsContext = createContext<LevelsContext>(null as never);

type LevelsProviderProps = {
  children: React.ReactNode;
};

export const LevelsProvider = ({ children }: LevelsProviderProps) => {
  const levels = useFetchLevels();
  const [storedLevels, setStoredLevels] = useStoredLevels();

  const storeLevelResult = useCallback<LevelsContext['storeLevelResult']>(
    (levelId, result) => {
      setStoredLevels((levels) => ({ ...levels, [levelId]: result }));
    },
    [setStoredLevels]
  );

  if (levels === undefined) {
    return null;
  }

  const value: LevelsContext = {
    levels,
    storedLevels,
    storeLevelResult,
  };

  return <levelsContext.Provider value={value}>{children}</levelsContext.Provider>;
};

const useLevelsContext = () => {
  const ctx = useContext(levelsContext);
  assert(ctx, 'missing levels context provider');
  return ctx;
};

export const useLevelsIds = () => {
  const { levels } = useLevelsContext();
  return useMemo(() => Object.keys(levels), [levels]);
};

export const useLevels = () => {
  const ctx = useLevelsContext();
  const levelsIds = useLevelsIds();

  return useMemo(() => {
    return toObject(levelsIds, identity, (id) => ({
      definition: ctx.levels[id],
      ...ctx.storedLevels[id],
    }));
  }, [ctx, levelsIds]);
};

export const useLevel = (levelId: string) => {
  const levels = useLevels();
  const level = levels[levelId];

  assert(level, `level ${levelId} not found`);

  return level;
};

export const useLevelInstance = (levelId: string) => {
  const { definition } = useLevel(levelId);

  return useMemo(() => {
    return new Level(definition);
  }, [definition]);
};

export const useStoreLevelResult = () => {
  return useLevelsContext().storeLevelResult;
};

const useFetchLevels = () => {
  const { serverUrl } = useConfig();
  const [levels, setLevels] = useState<Record<string, LevelDefinition>>();

  useEffect(() => {
    void fetch(`${serverUrl}/levels`)
      .then((res) => res.json())
      .then(setLevels);
  }, [serverUrl]);

  return levels;
};

const useStoredLevels = () => {
  const [storedLevels, setStoredLevels] = useState<Record<string, StoredLevel | undefined>>(() => {
    return JSON.parse(localStorage.getItem('levels') ?? '{}') as Record<string, StoredLevel | undefined>;
  });

  useEffect(() => {
    localStorage.setItem('levels', JSON.stringify(storedLevels));
  }, [storedLevels]);

  return [storedLevels, setStoredLevels] as const;
};

export const useSaveReport = () => {
  const { serverUrl } = useConfig();

  return useCallback(
    (levelId: string, completed: boolean, tries: number, time: number) => {
      void fetch(`${serverUrl}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ levelId, completed, time, tries }),
      });
    },
    [serverUrl]
  );
};

export const useLevelNumber = (levelId: string) => {
  const levelsIds = useLevelsIds();
  return levelsIds.indexOf(levelId) + 1;
};
