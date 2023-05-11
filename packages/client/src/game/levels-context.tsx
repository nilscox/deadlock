import { Game, Level, LevelDefinition, assert } from '@deadlock/game';
import { useCallback, useMemo } from 'react';

import { useLevels, usePostLevelSession } from './levels-api';
import { LevelUserData, useLevelUserData, useSaveLevelUserData, useUserData } from './levels-user-data';

export const useLevelExists = (levelId: string) => {
  return levelId in useLevels();
};

export const useIsLevelCompleted = (levelId: string) => {
  const data = useLevelUserData(levelId);
  return Boolean(data?.completed);
};

export const useLevelsIds = () => {
  const levels = useLevels();
  return useMemo(() => Object.keys(levels), [levels]);
};

export const useLevelNumber = (levelId: string) => {
  const levelsIds = useLevelsIds();
  return levelsIds.indexOf(levelId) + 1;
};

export const useLevelsMatching = (
  predicate: (level: LevelDefinition, userLevelData: LevelUserData | undefined) => boolean
) => {
  const levels = useLevels();
  const userData = useUserData();

  return useMemo(() => {
    return Object.entries(levels)
      .filter(([levelId, level]) => predicate(level, userData[levelId]))
      .map(([levelId]) => levelId);
  }, [levels, userData, predicate]);
};

export const useLevelDefinition = (levelId: string) => {
  const levels = useLevels();
  const level = levels[levelId];

  assert(level, `level ${levelId} not found`);

  return level;
};

export const useLevelInstance = (levelId: string) => {
  const definition = useLevelDefinition(levelId);

  return useMemo(() => {
    return new Level(definition);
  }, [definition]);
};

export const useOnSessionTerminated = (levelId: string) => {
  const userLevelData = useLevelUserData(levelId);

  const saveUserLevelData = useSaveLevelUserData();
  const postLevelSession = usePostLevelSession();

  return useCallback(
    (game: Game, completed: boolean) => {
      assert(game);

      const alreadyCompleted = userLevelData?.completed;

      if (alreadyCompleted && !completed) {
        return;
      }

      const time = game.stopwatch.elapsed;
      const tries = game.tries;

      if (!completed && time < 2000) {
        return;
      }

      saveUserLevelData(levelId, { completed, tries, time });
      postLevelSession({ levelId, completed, tries, time });
    },
    [levelId, userLevelData, saveUserLevelData, postLevelSession]
  );
};
