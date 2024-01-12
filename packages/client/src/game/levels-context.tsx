import { Game, Level, LevelData, assert } from '@deadlock/game';
import { useCallback, useMemo } from 'react';

import { useLevels, usePostLevelSession } from './levels-api';
import { LevelUserData, useLevelUserData, useSaveLevelUserData, useUserData } from './levels-user-data';

export const useLevel = (levelId: string) => {
  const levels = useLevels();
  return useMemo(() => levels[levelId], [levels, levelId]);
};

export const useLevelNumber = (levelId: string) => {
  return useLevel(levelId).number;
};

export const useIsLevelCompleted = (levelId: string) => {
  const data = useLevelUserData(levelId);
  return Boolean(data?.completed);
};

export const useLevelsIds = () => {
  const levels = useLevels();
  return useMemo(() => Object.keys(levels), [levels]);
};

export const useLevelsMatching = (
  predicate: (level: LevelData, userLevelData: LevelUserData | undefined) => boolean
) => {
  const levels = useLevels();
  const userData = useUserData();

  return useMemo(() => {
    return Object.values(levels).filter((level) => predicate(level, userData[level.id]));
  }, [levels, userData, predicate]);
};

export const useLevelDefinition = (levelId: string) => {
  const levels = useLevels();
  const level = levels[levelId];

  assert(level, `level "${levelId}" not found`);

  return level.definition;
};

export const useLevelInstance = (levelId: string) => {
  const definition = useLevelDefinition(levelId);

  return useMemo(() => {
    return Level.load(definition);
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

      const time = game.stopwatch.elapsed;
      const tries = game.tries;

      if (!completed && time < 2000) {
        return;
      }

      postLevelSession({ levelId, completed, tries, time });

      if (!alreadyCompleted) {
        saveUserLevelData(levelId, { completed, tries, time });
      }
    },
    [levelId, userLevelData, saveUserLevelData, postLevelSession]
  );
};
